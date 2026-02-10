import Select from '@/components/common/Select'

export default function PayrollFilters({ selectedMonth, selectedYear, setSelectedMonth, setSelectedYear }) {
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' })
  }))

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i
    return { value: year, label: year.toString() }
  })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-black">
        <Select
          label="Month"
          options={monthOptions}
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
        />
        <Select
          label="Year"
          options={yearOptions}
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
        />
      </div>
    </div>
  )
}