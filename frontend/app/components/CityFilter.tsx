'use client'

interface CityFilterProps {
  cities: string[]
  selected: string | null
  onSelect: (city: string | null) => void
}

export function CityFilter({ cities, selected, onSelect }: CityFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 city-scroll">
      <button
        onClick={() => onSelect(null)}
        className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
          selected === null
            ? 'bg-podcast-500 text-white shadow-sm'
            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
        }`}
      >
        全部
      </button>
      {cities.map(city => (
        <button
          key={city}
          onClick={() => onSelect(city)}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
            selected === city
              ? 'bg-podcast-500 text-white shadow-sm'
              : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
          }`}
        >
          {city}
        </button>
      ))}
    </div>
  )
}
