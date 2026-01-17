"use client"

interface ChartData {
  month: string
  value: number
}

interface SimpleChartProps {
  data: ChartData[]
  title: string
  color?: string
  isLoading?: boolean
}

export function SimpleBarChart({ data, title, color = "bg-primary", isLoading }: SimpleChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <div className="h-4 w-32 skeleton rounded mb-6" />
        <div className="flex items-end gap-2 h-40">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-1 skeleton rounded" style={{ height: `${30 + Math.random() * 70}%` }} />
          ))}
        </div>
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-6">{title}</h3>
      <div className="flex items-end gap-2 h-40">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div
              className={`w-full ${color} rounded-t-md transition-all hover:opacity-80`}
              style={{ height: `${(item.value / maxValue) * 100}%` }}
            />
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SimpleLineChart({ data, title, color = "text-primary", isLoading }: SimpleChartProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl bg-card p-5 shadow-sm">
        <div className="h-4 w-32 skeleton rounded mb-6" />
        <div className="h-40 skeleton rounded" />
      </div>
    )
  }

  const maxValue = Math.max(...data.map((d) => d.value))
  const minValue = Math.min(...data.map((d) => d.value))
  const range = maxValue - minValue || 1

  const points = data
    .map((item, index) => {
      const x = (index / (data.length - 1)) * 100
      const y = 100 - ((item.value - minValue) / range) * 80 - 10
      return `${x},${y}`
    })
    .join(" ")

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-foreground mb-6">{title}</h3>
      <div className="h-40 relative">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline fill="none" stroke="currentColor" strokeWidth="2" className={color} points={points} />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100
            const y = 100 - ((item.value - minValue) / range) * 80 - 10
            return <circle key={index} cx={x} cy={y} r="2" fill="currentColor" className={color} />
          })}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-1">
          {data.map((item, index) => (
            <span key={index} className="text-[10px] text-muted-foreground">
              {item.month}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
