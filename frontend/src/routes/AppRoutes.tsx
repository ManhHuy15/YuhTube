import { Route, Routes } from 'react-router-dom'
import { HomePage } from '../features/home/HomePage'
import { WatchPage } from '../features/watch/WatchPage'
import { StudioPage } from '../features/studio/StudioPage'
import { UploadPage } from '../features/upload/UploadPage'
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/watch/:videoId" element={<WatchPage />} />
      <Route
        path="/studio"
        element={
          <ProtectedRoute>
            <StudioPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/studio/upload"
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
