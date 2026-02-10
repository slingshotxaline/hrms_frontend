import { Search } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
  const handleChange = (e) => {
    // ✅ Extract the value from the event and pass it to onChange
    onChange(e.target.value)
  }

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-black" />
      </div>
      <input
        type="text"
        value={value || ''} // ✅ Ensure value is always a string
        onChange={handleChange} // ✅ Use handleChange instead of passing onChange directly
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-black"
      />
      {value && (
        <button
          onClick={() => onChange('')} // ✅ Clear button
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-black hover:text-black"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}