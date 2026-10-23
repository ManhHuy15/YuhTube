# YuhTube - Serverless Video Streaming & Social Platform

**YuhTube** là nền tảng chia sẻ và phát video trực tuyến (Video Streaming Platform) được thiết kế và triển khai hoàn toàn theo kiến trúc **Serverless** trên đám mây AWS. Dự án được xây dựng nhằm mô phỏng hệ thống phân tán quy mô lớn của YouTube, giải quyết triệt để các bài toán về tối ưu băng thông tải lên, chuyển mã định dạng đa độ phân giải thích ứng (Adaptive Bitrate Streaming), phân phối nội dung độ trễ thấp và thiết kế cơ sở dữ liệu NoSQL hiệu năng cao.

---

## 1. Mục tiêu kiến trúc & Bài toán giải quyết (System Design Goals)

* **Xử lý tệp media dung lượng lớn (Direct-to-S3 Upload):** Giải quyết hạn chế về payload (10MB) của API Gateway và timeout (15 phút) của AWS Lambda bằng kỹ thuật chia nhỏ dữ liệu đa phần (Multipart Upload) và cấp quyền truy cập tạm thời (Presigned URLs).
* **Phát video mượt mà, chống gián đoạn (Adaptive Bitrate Streaming):** Tự động chuyển đổi video thô sang chuẩn HLS (`.m3u8` / `.ts`) với nhiều mức phân giải (1080p, 720p, 480p, 360p), tự động co giãn theo chất lượng đường truyền của người xem.
* **Tối ưu chi phí & Triệt tiêu vòng lặp vô hạn (Infinite Loop Prevention):** Sử dụng kiến trúc tách rời 2 S3 Buckets (`s3_raw` và `s3_processed`) kết hợp chính sách vòng đời (S3 Lifecycle) để tự động nén/xóa tệp video gốc.
* **Cơ sở dữ liệu NoSQL tốc độ cao (Single-Table Design):** Gom toàn bộ các thực thể (Users, Videos, Comments, Likes) vào một bảng vật lý DynamoDB duy nhất. Áp dụng kỹ thuật Pre-join và Khử chuẩn hóa (Denormalization) để đọc toàn bộ trang xem video (Metadata + Comments + Like) trong **1 lệnh Query duy nhất**.
* **Phân phối toàn cầu (Global Edge Caching):** Sử dụng CloudFront CDN để lưu đệm các phân đoạn video tại các Edge Locations gần người dùng nhất, giảm tải trực tiếp cho kho lưu trữ S3.

---

## 2. Toàn cảnh kiến trúc hệ thống (High-Level Architecture)

Toàn bộ hệ thống vận hành theo mô hình hướng sự kiện (Event-Driven Architecture):

```text
[ Người dùng / React Client ]
       │
       ├──► [ Amazon Cognito ] ──────────── (1) Xác thực & Cấp quyền JWT
       │
       ├──► [ Amazon CloudFront (CDN) ] ── (2) Phân phối giao diện tĩnh & Stream video (.m3u8, .ts)
       │
       ├──► [ Amazon API Gateway ] ─────── (3) Định tuyến API
                  │
                  ▼
         [ AWS Lambda (.NET 10) ]
                  │
                  ├──────────────────────────────┬──────────────────────────────┐
                  ▼                              ▼                              ▼
          [ Amazon DynamoDB ]           [ S3: s3_raw Bucket ]         [ S3: s3_processed Bucket ]
        (Single-Table Design)         (Tải lên trực tiếp qua            (Chứa file HLS thành phẩm,
      Lưu User, Video, Comment, Like)     Presigned URLs)               được cache qua CloudFront)
                                                 │                              ▲
                                                 ├─ (4) S3 Event Notification   │
                                                 ▼                              │
                                        [ Lambda Orchestrator ]                 │
                                                 │                              │
                                                 ▼                              │
                                   [ AWS Elemental MediaConvert ] ──────────────┘
                                  (Transcode & băm nhỏ phân đoạn)
```

---

## 3. Các phân hệ chức năng cốt lõi (Core Modules)

### 3.1. Phân hệ Xác thực & Người dùng (Authentication & Identity)
* **Amazon Cognito User Pools:** Đăng ký, đăng nhập, xác thực 2 bước (MFA), và quản lý phiên làm việc thông qua JSON Web Tokens (JWT).
* **Cognito Identity Pools:** Ủy quyền IAM Role tạm thời để người dùng tương tác an toàn với các dịch vụ AWS được chỉ định.

### 3.2. Phân hệ Tải lên Video (Video Ingestion Pipeline)
* **Frontend:** Cắt nhỏ tệp video lớn thành các khối 5MB và gửi yêu cầu xin URL tải lên.
* **AWS Lambda (.NET 10):** Khởi tạo `InitiateMultipartUpload`, sinh danh sách `Presigned URLs` tương ứng cho từng part, và gọi `CompleteMultipartUpload` để S3 tự ghép tệp.
* **S3 Raw Bucket:** Thư mục tiếp nhận tệp video thô, áp dụng cấu hình CORS và bảo mật tuyệt đối (chặn truy cập công khai).

### 3.3. Phân hệ Xử lý & Chuyển mã Media (Transcoding Pipeline)
* **S3 Event Notifications:** Phát tín hiệu sự kiện `s3:ObjectCreated:*` ngay khi video thô được ghép hoàn chỉnh.
* **Lambda Coordinator:** Đọc thông số tệp và tạo cấu hình Job cho **AWS Elemental MediaConvert**.
* **MediaConvert Processing:** Băm nhỏ video thành các phân đoạn 2–6 giây (`.ts`) cùng danh sách phát (`.m3u8`) theo cấu trúc phân giải thích ứng (HLS), lưu sang `s3_processed`.
* **Cập nhật trạng thái:** Khi Job hoàn tất (bắt qua Amazon EventBridge), một hàm Lambda sẽ cập nhật trạng thái video từ `PROCESSING` sang `READY` trên DynamoDB.

### 3.4. Phân hệ Dữ liệu & Tương tác xã hội (DynamoDB Single-Table Design)
Áp dụng thiết kế đơn bảng `StreamingTable` với chế độ On-Demand Capacity Mode:

| PK (Partition Key) | SK (Sort Key) | Thuộc tính (Attributes) | Ý nghĩa thực thể |
| :--- | :--- | :--- | :--- |
| `USER#<User_KSUID>` | `PROFILE#<User_KSUID>` | `ChannelName`, `Email`, `AvatarURL`, `JoinedDate` | Hồ sơ Kênh / Tác giả |
| `VIDEO#<Video_KSUID>` | `META#<Video_KSUID>` | `Title`, `Description`, `PlaybackURL`, `Status`, `UploaderID`, `UploaderName`, `UploaderAvatar` | Thông tin Video (Khử chuẩn hóa thông tin kênh) |
| `VIDEO#<Video_KSUID>` | `COMMENT#<Comment_KSUID>` | `Content`, `UserID`, `UserName`, `UserAvatar`, `CreatedAt` | Bình luận (KSUID tự sắp xếp theo thời gian) |
| `VIDEO#<Video_KSUID>` | `LIKE#<User_KSUID>` | `CreatedAt` | Đánh dấu User đã Like (Chống trùng lặp) |

* **Global Secondary Index (GSI1):** `GSI1_PK = UploaderID`, `GSI1_SK = Video_KSUID` phục vụ truy vấn danh sách toàn bộ video của một kênh cụ thể sắp xếp từ mới nhất đến cũ nhất.

### 3.5. Phân hệ Phân phối & Trình phát (Playback & Streaming)
* **Amazon CloudFront:** Đứng trước bucket `s3_processed`, thực hiện lưu đệm (cache) phân đoạn video gần vị trí địa lý của khán giả nhất.
* **Origin Access Control (OAC):** Khóa quyền đọc trực tiếp từ S3, chỉ cho phép CloudFront đọc dữ liệu ra internet.
* **Frontend Player:** Tích hợp `Hls.js` cho phép phát mượt mà, tua nhanh tức thì và tự động chuyển đổi chất lượng video dựa trên tốc độ mạng của client.

---

## 4. Công nghệ sử dụng (Technology Stack)

* **Backend & API:** C# (.NET 10), AWS Lambda Serverless, Amazon API Gateway.
* **Frontend:** React, TypeScript, Vite, TanStack Query, Zustand, Axios, Tailwind CSS, HTML5 Video, Hls.js.
* **Lưu trữ & Phân phối:** Amazon S3 (Raw & Processed Buckets), Amazon CloudFront.
* **Cơ sở dữ liệu:** Amazon DynamoDB (Single-Table Design, GSI).
* **Chuyển mã Media:** AWS Elemental MediaConvert.
* **Định danh & Bảo mật:** Amazon Cognito, AWS IAM (Least Privilege Policies).
* **Giám sát & Sự kiện:** Amazon CloudWatch Logs & Metrics, Amazon EventBridge.

---

## 5. Cấu trúc kho lưu trữ (Project Organization)

```text
yuhtube/
├── backend/
│   ├── YuhTube.slnx
│   └── src/
│   │   ├── YuhTube.Video.Api/                 # HTTP Lambda: video metadata và channel queries
│   │   ├── YuhTube.Upload.Api/                # HTTP Lambda: multipart upload và presigned URLs
│   │   ├── YuhTube.Social.Api/                # HTTP Lambda: comment, like và subscribe
│   │   ├── YuhTube.MediaConvertCoordinator/   # S3-triggered Lambda: khởi tạo MediaConvert job
│   │   └── YuhTube.TranscodeStatusUpdater/    # EventBridge Lambda: cập nhật trạng thái video
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   └── package.json
└── README.md
```

Ba HTTP Lambda sử dụng ASP.NET Core Controllers và Lambda hosting adapter. Hai Lambda xử lý sự kiện dùng class-library handler trực tiếp; handler tách biệt khỏi service nghiệp vụ và tái sử dụng AWS clients trong execution environment. Xác thực do Cognito Authorizer tại API Gateway đảm nhiệm nên không có `AuthHandler` riêng.

---

## 6. Hướng dẫn thiết lập môi trường & Chạy thử nghiệm

### 6.1. Yêu cầu hệ thống
* [.NET 10 SDK](https://dotnet.microsoft.com/)
* [Node.js 22.12+](https://nodejs.org/)
* [AWS CLI](https://aws.amazon.com/cli/) đã cấu hình với IAM User có đủ quyền qua `aws configure`.

### 6.2. Cấu hình CORS cho Bucket `s3_raw`
Trên giao diện S3 Console, chọn bucket lưu file gốc (`s3_raw`) -> Tab **Permissions** -> mục **CORS**:
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["PUT", "POST", "GET"],
        "AllowedOrigins": ["http://localhost:3000"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### 6.3. Khởi chạy và kiểm thử Backend tại Local
Build toàn bộ backend:

```bash
dotnet build backend/YuhTube.slnx
```

Chạy từng HTTP Lambda bằng Kestrel tại local:

```bash
dotnet run --project backend/src/YuhTube.Video.Api
dotnet run --project backend/src/YuhTube.Upload.Api
dotnet run --project backend/src/YuhTube.Social.Api
```

| Project | Local URL |
| :--- | :--- |
| `YuhTube.Video.Api` | `http://localhost:5101` |
| `YuhTube.Upload.Api` | `http://localhost:5102` |
| `YuhTube.Social.Api` | `http://localhost:5103` |

### 6.4. Khởi chạy Frontend (React)
1. Di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt thư viện phụ thuộc và khởi chạy:
   ```bash
   npm install
   npm run dev
   ```
3. Mở trình duyệt tại `http://localhost:3000` để truy cập giao diện YuhTube.

---

## 7. Lộ trình phát triển (Development Roadmap)

- [ ] Thiết kế NoSQL Single-Table Schema trên DynamoDB và xác định các Access Patterns.
- [ ] Hoàn thiện module tải video dung lượng lớn qua Multipart Presigned URLs.
- [ ] Xây dựng Lambda nhận S3 Event Notification để kích hoạt Job trên AWS Elemental MediaConvert.
- [ ] Cấu hình Amazon CloudFront và Origin Access Control (OAC) phân phối các tệp HLS.
- [ ] Xây dựng trình phát video với `Hls.js` và cụm tính năng tương tác (Bình luận, Thả tim).
- [ ] Tích hợp Amazon Cognito xác thực người dùng và bảo vệ API Gateway qua Cognito Authorizers.
- [ ] Thiết lập luồng CI/CD tự động hóa kiểm thử và đóng gói triển khai (AWS CodePipeline / GitHub Actions).
