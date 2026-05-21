'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

interface BatchStats {
  batch: number
  count: number
}

interface WorkFieldStats {
  field: string
  count: number
}

interface StatsData {
  totalAlumni: number
  usersPerBatch: BatchStats[]
  usersPerWorkField: WorkFieldStats[]
  cachedAt: string
  source: 'cache' | 'api'
}

const COLORS = [
  '#0033A0',
  '#0066CC',
  '#3399FF',
  '#66B2FF',
  '#99CCFF',
  '#0055AA',
  '#4477AA',
  '#7799BB',
  '#AACCEE',
  '#224466',
]

function BatchTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number }>
  label?: string
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
        <p className="font-semibold text-ugm-main">Angkatan {label}</p>
        <p className="text-ugm-blue font-bold">{payload[0].value} alumni</p>
      </div>
    )
  }
  return null
}

function FieldTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ name: string; value: number }>
}) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2">
        <p className="font-semibold text-ugm-main">{payload[0].name}</p>
        <p className="text-ugm-blue font-bold">{payload[0].value} alumni</p>
      </div>
    )
  }
  return null
}

function getBatchTicks(batches: BatchStats[]): number[] {
  if (batches.length === 0) return []
  const years = batches.map((b) => b.batch)
  const min = Math.min(...years)
  const max = Math.max(...years)
  const start = Math.floor(min / 5) * 5
  const ticks: number[] = []
  for (let y = start; y <= max; y += 5) {
    if (y >= min) ticks.push(y)
  }
  if (ticks[0] !== min && min % 5 !== 0) {
    ticks.unshift(min)
  }
  return ticks
}

export default function AlumniDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/alumni/stats')
        if (!response.ok) throw new Error('Failed to fetch stats')
        const data: StatsData = await response.json()
        setStats(data)
      } catch (err) {
        console.error('Error fetching alumni stats:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const batchTicks = useMemo(() => {
    if (!stats) return []
    return getBatchTicks(stats.usersPerBatch)
  }, [stats])

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full min-h-[300px] bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-ugm-blue border-t-transparent" />
          <p className="text-ugm-muted font-medium">Memuat statistik alumni...</p>
        </div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center w-full min-h-[300px] bg-white rounded-xl shadow-lg border border-red-200">
        <div className="text-center px-4">
          <svg
            className="mx-auto h-12 w-12 text-red-500 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-red-500 font-semibold text-lg mb-2">Gagal memuat statistik</p>
          <p className="text-gray-500 text-sm">
            Silakan refresh halaman atau hubungi administrator
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-ugm-blue text-white rounded-lg hover:bg-ugm-blue-soft transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    )
  }

  function capitalizeFirstLetter(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  const topWorkFields = stats.usersPerWorkField.slice(0, 10).map((field) => ({
    ...field,
    field: capitalizeFirstLetter(field.field),
  }))

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-ugm-main">
              Jumlah Alumni per Angkatan
            </h3>
            <p className="text-xs sm:text-sm text-ugm-muted mt-1">
              Distribusi alumni berdasarkan tahun angkatan
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={stats.usersPerBatch}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  type="number"
                  dataKey="batch"
                  domain={['dataMin', 'dataMax']}
                  ticks={batchTicks}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<BatchTooltip />} />
                <Bar dataKey="count" fill="#0033A0" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-4 sm:px-6 border-b border-gray-100">
            <h3 className="text-base sm:text-lg font-bold text-ugm-main">
              Jumlah Alumni per Bidang Pekerjaan
            </h3>
            <p className="text-xs sm:text-sm text-ugm-muted mt-1">
              Distribusi alumni berdasarkan bidang pekerjaan (10 teratas)
            </p>
          </div>
          <div className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={380}>
              <BarChart
                data={topWorkFields}
                layout="vertical"
                margin={{ top: 5, right: 10, left: 50, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                  tickCount={4}
                />
                <YAxis
                  dataKey="field"
                  type="category"
                  width={75}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<FieldTooltip />} />
                <Bar dataKey="count" fill="#0033A0" radius={[0, 4, 4, 0]} barSize={22}>
                  {topWorkFields.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-gray-400 pb-4">
        Data diperbarui: {new Date(stats.cachedAt).toLocaleString('id-ID')}
      </div>
    </div>
  )
}
