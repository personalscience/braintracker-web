import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Calendar, Filter, Download } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface TestResult {
  id: string
  test_type: 'warmup' | 'test'
  reaction_times: number[]
  average_time: number
  condition: string | null
  notes: string | null
  created_at: string
}

type TimeRange = '7d' | '30d' | '90d' | 'all'

export function History() {
  const { user } = useAuth()
  const [tests, setTests] = useState<TestResult[]>([])
  const [filteredTests, setFilteredTests] = useState<TestResult[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [conditionFilter, setConditionFilter] = useState('')

  useEffect(() => {
    fetchTestHistory()
  }, [user])

  useEffect(() => {
    filterTests()
  }, [tests, timeRange, conditionFilter])

  const fetchTestHistory = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('brain_tests')
        .select('*')
        .eq('user_id', user.id)
        .eq('test_type', 'test')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTests(data || [])
    } catch (error) {
      console.error('Error fetching test history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTests = () => {
    let filtered = [...tests]

    // Filter by time range
    const now = new Date()
    let cutoffDate: Date
    
    switch (timeRange) {
      case '7d':
        cutoffDate = subDays(now, 7)
        break
      case '30d':
        cutoffDate = subDays(now, 30)
        break
      case '90d':
        cutoffDate = subDays(now, 90)
        break
      default:
        cutoffDate = new Date(0) // All time
    }

    filtered = filtered.filter(test => new Date(test.created_at) >= cutoffDate)

    // Filter by condition
    if (conditionFilter) {
      filtered = filtered.filter(test => 
        test.condition?.toLowerCase().includes(conditionFilter.toLowerCase())
      )
    }

    setFilteredTests(filtered)
  }

  const chartData = filteredTests
    .slice()
    .reverse()
    .map((test, index) => ({
      test: index + 1,
      time: test.average_time,
      date: format(new Date(test.created_at), 'MMM dd'),
      fullDate: test.created_at
    }))

  const distributionData = React.useMemo(() => {
    if (filteredTests.length === 0) return []
    
    const ranges = [
      { range: '< 300ms', min: 0, max: 300, count: 0 },
      { range: '300-400ms', min: 300, max: 400, count: 0 },
      { range: '400-500ms', min: 400, max: 500, count: 0 },
      { range: '500-600ms', min: 500, max: 600, count: 0 },
      { range: '> 600ms', min: 600, max: Infinity, count: 0 },
    ]

    filteredTests.forEach(test => {
      const range = ranges.find(r => test.average_time >= r.min && test.average_time < r.max)
      if (range) range.count++
    })

    return ranges
  }, [filteredTests])

  const uniqueConditions = React.useMemo(() => {
    const conditions = tests
      .map(test => test.condition)
      .filter(Boolean)
      .filter((condition, index, arr) => arr.indexOf(condition) === index)
    return conditions as string[]
  }, [tests])

  const exportData = () => {
    const csvContent = [
      ['Date', 'Average Time (ms)', 'Best Time (ms)', 'Worst Time (ms)', 'Condition', 'Notes'],
      ...filteredTests.map(test => [
        format(new Date(test.created_at), 'yyyy-MM-dd HH:mm:ss'),
        test.average_time.toFixed(2),
        Math.min(...test.reaction_times).toFixed(2),
        Math.max(...test.reaction_times).toFixed(2),
        test.condition || '',
        test.notes || ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `brain-test-history-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Test History</h1>
          <p className="text-gray-600 mt-1">View and analyze your brain reaction time performance over time</p>
        </div>
        
        {filteredTests.length > 0 && (
          <button
            onClick={exportData}
            className="btn-secondary flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="input-field px-3 py-2 w-auto"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="input-field px-3 py-2 w-auto"
            >
              <option value="">All conditions</option>
              {uniqueConditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div className="text-sm text-gray-600">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="card text-center py-12">
          <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No test data found</h3>
          <p className="text-gray-600">
            {tests.length === 0 
              ? "You haven't taken any tests yet. Take your first test to start tracking your performance."
              : "No tests match your current filters. Try adjusting the time range or condition filter."
            }
          </p>
        </div>
      ) : (
        <>
          {/* Performance Chart */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Over Time</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    label={{ value: 'Reaction Time (ms)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [`${value.toFixed(0)}ms`, 'Reaction Time']}
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return format(new Date(payload[0].payload.fullDate), 'MMM dd, yyyy at h:mm a')
                      }
                      return label
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="time" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Distribution Chart */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Distribution</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [`${value} tests`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Test List */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Details</h2>
            <div className="space-y-4">
              {filteredTests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        test.average_time < 400 ? 'bg-green-100 text-green-800' :
                        test.average_time < 500 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {test.average_time.toFixed(0)}ms avg
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(new Date(test.created_at), 'MMM dd, yyyy at h:mm a')}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Best: {Math.min(...test.reaction_times).toFixed(0)}ms
                    </div>
                  </div>
                  
                  {test.condition && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Condition:</span> {test.condition}
                    </div>
                  )}
                  
                  {test.notes && (
                    <div className="text-sm text-gray-700 mb-2">
                      <span className="font-medium">Notes:</span> {test.notes}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-10 gap-1 mt-3">
                    {test.reaction_times.map((time, index) => (
                      <div
                        key={index}
                        className={`text-xs p-1 rounded text-center font-medium ${
                          time < 300 ? 'bg-green-100 text-green-800' :
                          time < 400 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                        title={`Trial ${index + 1}: ${time.toFixed(0)}ms`}
                      >
                        {time.toFixed(0)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}