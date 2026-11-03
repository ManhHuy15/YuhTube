/**
 * Formats an ISO date string, timestamp, or Date into a Vietnamese relative time string.
 * Ví dụ: "Vừa xong", "5 phút trước", "2 giờ trước", "3 ngày trước", "2 tháng trước", "1 năm trước".
 */
export function formatRelativeTime(dateInput?: string | number | Date | null): string {
  if (!dateInput) return 'Vừa xong'

  const date = typeof dateInput === 'string' || typeof dateInput === 'number'
    ? new Date(dateInput)
    : dateInput

  if (isNaN(date.getTime())) {
    return 'Vừa xong'
  }

  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  // Future dates or less than 1 minute ago
  if (diffInSeconds < 60) {
    return 'Vừa xong'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} giờ trước`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} ngày trước`
  }

  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`
  }

  const diffInYears = Math.floor(diffInDays / 365)
  return `${diffInYears} năm trước`
}
