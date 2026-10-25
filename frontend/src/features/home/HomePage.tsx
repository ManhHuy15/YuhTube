import { useState } from 'react'
import { HomeHeader } from './components/HomeHeader'
import { HomeSidebar } from './components/HomeSidebar'
import { CategoryChips } from './components/CategoryChips'
import { VideoCard } from './components/VideoCard'
import { useHomeFeed } from './hooks/useHomeFeed'

export function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('Tất cả')
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const { videos, isLoading } = useHomeFeed(selectedCategory)

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-[#f1f1f1] flex flex-col selection:bg-red-600/30">
      <HomeHeader onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />

      <div className="flex flex-1 pt-14">
        {isSidebarOpen && <HomeSidebar />}

        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 transition-all ${isSidebarOpen ? 'md:ml-60' : ''}`}>
          <div className="max-w-[1760px] mx-auto space-y-6">
            <CategoryChips
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
