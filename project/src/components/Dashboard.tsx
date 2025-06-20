import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Subject, Goal, TimeEntry } from '../lib/supabase'
import { 
  BookOpen, 
  Target, 
  Clock, 
  TrendingUp, 
  Calendar,
  Award,
  CheckCircle,
  PlayCircle
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      // Fetch user goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5)

      // Fetch recent time entries
      const { data: timeEntriesData } = await supabase
        .from('time_entries')
        .select(`
          *,
          subjects (name, color)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10)

      setSubjects(subjectsData || [])
      setGoals(goalsData || [])
      setTimeEntries(timeEntriesData || [])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWeeklyStudyTime = () => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    return timeEntries
      .filter(entry => 
        entry.end_time && 
        isWithinInterval(new Date(entry.start_time), { start: weekStart, end: weekEnd })
      )
      .reduce((total, entry) => total + (entry.duration_minutes || 0), 0)
  }

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.status === 'completed').length
  }

  const getActiveGoals = () => {
    return goals.filter(goal => goal.status !== 'completed').length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const weeklyMinutes = getWeeklyStudyTime()
  const weeklyHours = Math.floor(weeklyMinutes / 60)
  const remainingMinutes = weeklyMinutes % 60

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Track your learning progress and stay motivated</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Subjects</p>
              <p className="text-2xl font-bold text-gray-900">{subjects.length}</p>
            </div>
            <div className="bg-primary-100 p-3 rounded-full">
              <BookOpen className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Goals</p>
              <p className="text-2xl font-bold text-gray-900">{getActiveGoals()}</p>
            </div>
            <div className="bg-secondary-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-secondary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Week</p>
              <p className="text-2xl font-bold text-gray-900">
                {weeklyHours}h {remainingMinutes}m
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Goals</p>
              <p className="text-2xl font-bold text-gray-900">{getCompletedGoals()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Award className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Goals */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Goals</h2>
            <Target className="h-5 w-5 text-gray-400" />
          </div>
          
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No goals set yet</p>
              <p className="text-sm text-gray-400">Set your first goal to get started!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 5).map((goal) => (
                <div key={goal.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-1 rounded-full ${
                    goal.status === 'completed' 
                      ? 'bg-green-100' 
                      : goal.status === 'in_progress' 
                      ? 'bg-yellow-100' 
                      : 'bg-gray-100'
                  }`}>
                    {goal.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : goal.status === 'in_progress' ? (
                      <PlayCircle className="h-4 w-4 text-yellow-600" />
                    ) : (
                      <Calendar className="h-4 w-4 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{goal.title}</p>
                    <p className="text-xs text-gray-500">
                      {goal.target_date && format(new Date(goal.target_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    goal.status === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : goal.status === 'in_progress' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Study Sessions */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Study Sessions</h2>
            <Clock className="h-5 w-5 text-gray-400" />
          </div>
          
          {timeEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No study sessions yet</p>
              <p className="text-sm text-gray-400">Start tracking your study time!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {timeEntries.slice(0, 5).map((entry) => (
                <div key={entry.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: (entry.subjects as any)?.color || '#3b82f6' }}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {(entry.subjects as any)?.name || 'Unknown Subject'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(entry.start_time), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {entry.duration_minutes ? `${entry.duration_minutes}m` : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors">
            <BookOpen className="h-6 w-6 text-primary-600" />
            <div className="text-left">
              <p className="font-medium text-primary-900">Browse Subjects</p>
              <p className="text-sm text-primary-600">Explore notes and resources</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors">
            <Target className="h-6 w-6 text-secondary-600" />
            <div className="text-left">
              <p className="font-medium text-secondary-900">Set New Goal</p>
              <p className="text-sm text-secondary-600">Plan your learning objectives</p>
            </div>
          </button>
          
          <button className="flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
            <Clock className="h-6 w-6 text-orange-600" />
            <div className="text-left">
              <p className="font-medium text-orange-900">Start Timer</p>
              <p className="text-sm text-orange-600">Track your study session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}