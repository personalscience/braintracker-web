import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Brain, TrendingDown, TrendingUp, Activity, Calendar } from 'lucide-react'
import { format, subDays } from 'date-fns'

interface TestResult {
  id: string
  test_type: 'warmup' | 'test'
  average_time: number
  created_at: string
  condition: string | null
}

interface Stats {
  totalTests: number
  averageTime: number
  bestTime: number
  trend: 'up' | 'down' | 'stable'
}

export function Dashboard() {
  const { user } = useAuth()
  const [recentTests, setRecentTests] = useState<TestResult[]>([])
  const [stats, setStats] = useState<Stats>({
    totalTests: 0,
    averageTime: 0,
    bestTime: 0,
    trend: 'stable'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      // Fetch recent test results (last 30 days)
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()
      
      const { data: tests, error } = await supabase
        .from('brain_tests')
        .select('id, test_type, average_time, created_at, condition')
        .eq('user_id', user.id)
        .eq('test_type', 'test')
        .gte('created_at', thirtyDaysAgo)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) throw error

      setRecentTests(tests || [])

      // Calculate stats
      if (tests && tests.length > 0) {
        const totalTests = tests.length
        const averageTime = tests.reduce((sum, test) => sum + test.average_time, 0) / totalTests
        const bestTime = Math.min(...tests.map(test => test.average_time))
        
        // Calculate trend (compare last 5 tests with previous 5)
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (tests.length >= 10) {
          const recent5 = tests.slice(0, 5).reduce((sum, test) => sum + test.average_time, 0) / 5
          const previous5 = tests.slice(5, 10).reduce((sum, test) => sum + test.average_time, 0) / 5
          const difference = recent5 - previous5
          
          if (Math.abs(difference) > 10) { // 10ms threshold
            trend = difference > 0 ? 'up' : 'down'
          }
        }

        setStats({
          totalTests,
          averageTime,
          bestTime,
          trend
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const chartData = recentTests
    .slice()
    .reverse()
    .map((test, index) => ({
      test: index + 1,
      time: test.average_time,
      date: format(new Date(test.created_at), 'MMM dd')
    }))

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your brain reaction time performance</p>
        </div>
        <Link
          to="/app/test"
          className="btn-primary flex items-center"
        >
          <Brain className="h-5 w-5 mr-2" />
          Take Test
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Activity className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageTime.toFixed(0)}ms</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Best Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.bestTime.toFixed(0)}ms</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              stats.trend === 'down' ? 'bg-green-100' : 
              stats.trend === 'up' ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {stats.trend === 'down' ? (
                <TrendingDown className="h-6 w-6 text-green-600" />
              ) : stats.trend === 'up' ? (
                <TrendingUp className="h-6 w-6 text-red-600" />
              ) : (
                <Activity className="h-6 w-6 text-gray-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trend</p>
              <p className={`text-2xl font-bold ${
                stats.trend === 'down' ? 'text-green-600' : 
                stats.trend === 'up' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {stats.trend === 'down' ? 'Improving' : 
                 stats.trend === 'up' ? 'Declining' : 'Stable'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {chartData.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Performance</h2>
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
      )}

      {/* Recent Tests */}
      {recentTests.length > 0 ? (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Tests</h2>
            <Link to="/app/history" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {recentTests.slice(0, 5).map((test) => (
              <div key={test.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div>
                  <p className="font-medium text-gray-900">{test.average_time.toFixed(0)}ms</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(test.created_at), 'MMM dd, yyyy at h:mm a')}
                  </p>
                  {test.condition && (
                    <p className="text-xs text-gray-500">{test.condition}</p>
                  )}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  test.average_time < 400 ? 'bg-green-100 text-green-800' :
                  test.average_time < 500 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {test.average_time < 400 ? 'Excellent' :
                   test.average_time < 500 ? 'Good' : 'Needs Work'}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card text-center py-12">
          <Brain className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests yet</h3>
          <p className="text-gray-600 mb-6">Take your first brain reaction time test to start tracking your performance.</p>
          <Link to="/app/test" className="btn-primary">
            Take Your First Test
          </Link>
        </div>
      )}
    </div>
  )
}