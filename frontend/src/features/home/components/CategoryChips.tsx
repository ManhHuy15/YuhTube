import { HOME_CATEGORIES } from '../constants/home.constants'

interface CategoryChipsProps {
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryChips({ selectedCategory, onSelectCategory }: CategoryChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none select-none">
      {HOME_CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === cat
              ? 'bg-white text-black'
              : 'bg-white/10 text-white/80 hover:bg-white/15'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  )
}
