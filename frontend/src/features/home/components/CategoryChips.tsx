import { DEFAULT_HOME_CATEGORIES } from '../constants/home.constants'

interface CategoryChipsProps {
  categories?: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryChips({
  categories = [...DEFAULT_HOME_CATEGORIES],
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  const displayCategories = categories.length > 0 ? categories : [...DEFAULT_HOME_CATEGORIES]

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none select-none">
      {displayCategories.map((cat) => {
        const isSelected = selectedCategory === cat
        return (
          <button
            key={cat}
            type="button"
            onClick={() => onSelectCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
              isSelected
                ? 'bg-white text-zinc-950 font-bold shadow-lg shadow-white/10'
                : 'bg-white/[0.04] hover:bg-white/[0.09] text-white/70 hover:text-white border border-white/[0.08] backdrop-blur-xl font-medium'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
