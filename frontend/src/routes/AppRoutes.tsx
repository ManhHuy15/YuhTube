import { Navigate, Route, Routes } from 'react-router-dom'
import { UploadPage } from '../features/upload/UploadPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/upload" replace />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="*" element={<Navigate to="/upload" replace />} />
    </Routes>
  )
}
