# YuhTube Agent Instructions & Design Standards

## Core Engineering & Design Directives

Khi phát triển, sửa đổi hoặc mở rộng bất kỳ thành phần nào trên Frontend của YuhTube, agent **BẮT BUỘC** phải tuân thủ và áp dụng 2 bộ quy chuẩn thiết kế sau:

1. **`frontend-design` Skill** (`.agents/skills/frontend-design/SKILL.md`):
   - **Studio Mindset**: Thiết kế giao diện như một Senior Design Technologist tại các studio sản phẩm hàng đầu thế giới.
   - **Anti-AI-Slop**: Tuyệt đối không tạo ra các giao diện chung chung, vô hồn (không dùng gradient tím/xanh nhạt nhạt rập khuôn, không tạo 3 card bằng nhau nhàm chán).
   - **Token Discipline**: Tuân thủ bảng màu Cinematic Dark (`#0e0e10`, `#131315`, `#1c1b1d`), đường viền sắc nét (`border-white/10`), điểm nhấn Đỏ thương hiệu (`#FF0000`, `red-600`), cùng Accent Cyan (`#69d8d4`) cho các thông số kỹ thuật (4K, FPS, bitrate, timecode).

2. **`design-taste-frontend` Skill** (`.agents/skills/design-taste-frontend/SKILL.md`):
   - Luôn hiệu chỉnh theo **Bộ Ba Thông Số (The Three Dials)**:
     - `DESIGN_VARIANCE = 5.5`: Bố cục bất đối xứng cân bằng giữa trải nghiệm quen thuộc của YouTube và phong cách Studio hiện đại.
     - `MOTION_INTENSITY = 5.0`: Micro-interactions tinh tế, phản hồi xúc giác (`active:scale-95`, `transition-all duration-200`), thanh tiến trình mượt mà, backdrop blur.
     - `VISUAL_DENSITY = 7.0`: Mật độ thông tin cao cho Pro Creator Studio & Video Player, hiển thị rõ ràng thông số, trạng thái lưu bản nháp, chất lượng video, không tạo khoảng trắng thừa thãi vô nghĩa.
   - **Full State Coverage**: Luôn thiết kế đầy đủ các trạng thái tương tác: default, hover, active, focus-visible, loading, disabled, error, và empty state.

3. **Công nghệ & Framework chuẩn mực**:
   - React 19 + TypeScript + Tailwind CSS + Zustand.
   - Kiểm tra chất lượng mã bằng `npm --prefix frontend run lint` (Oxlint) và `npm --prefix frontend run build` trước khi hoàn tất turn.
