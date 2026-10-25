import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { WatchPage } from '../features/watch/WatchPage'
import { StudioPage } from '../features/studio/StudioPage'
import { UploadPage } from '../features/upload/UploadPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/watch/:videoId" element={<WatchPage />} />
      <Route path="/studio" element={<StudioPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/studio/upload" element={<UploadPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
