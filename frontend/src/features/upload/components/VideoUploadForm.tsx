import { useState, type ChangeEvent } from 'react'
import { useVideoUpload } from '../hooks/useVideoUpload'

export function VideoUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const { error, isUploading, progress, reset, result, upload } = useVideoUpload()

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null)
    reset()
  }

  async function handleUpload() {
    if (!file) return
    await upload(file)
  }

  return (
    <section className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
      <h1 className="text-3xl font-bold tracking-tight">Upload video</h1>
      <p className="mt-2 text-sm text-zinc-400">Multipart upload trực tiếp từ trình duyệt lên S3.</p>

      <label className="mt-6 block text-sm font-medium" htmlFor="video-file">
        Video
      </label>
      <input
        id="video-file"
        type="file"
        accept="video/*"
        disabled={isUploading}
        onChange={handleFileChange}
        className="mt-2 block w-full rounded-lg border border-zinc-700 bg-zinc-950 p-3 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-red-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-red-500 disabled:opacity-60"
      />

      <button
        type="button"
        disabled={!file || isUploading}
        onClick={handleUpload}
        className="mt-5 w-full rounded-lg bg-red-600 px-4 py-3 font-semibold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isUploading ? `Uploading ${progress}%` : 'Upload'}
      </button>

      <div
        role="progressbar"
        aria-label="Upload progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress}
        className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-800"
      >
        <div
          className="h-full bg-red-500 transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {result && (
        <p className="mt-4 text-sm text-emerald-400">
          Đã hoàn tất {result.parts.length}/{result.partCount} parts tại {result.completion.objectKey}.
        </p>
      )}
    </section>
  )
}
