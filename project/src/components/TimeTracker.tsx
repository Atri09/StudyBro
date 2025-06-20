import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Subject, TimeEntry } from '../lib/supabase'
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Calendar,
  BarChart3,
  Timer
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, isWithinInterval, differenceInMinutes } from 'date-fns'

export default function TimeTracker() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([])
  const [activeSession, setActiveSession] = useState<TimeEntry | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [sessionNotes, setSessionNotes] = useState('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [user])

  const fetchData = async () => {
    try {
      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      // Fetch time entries
      const { data: timeEntriesData } = await supabase
        .from('time_entries')
        .select(`
          *,
          subjects (name, color)
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      // Check for active session
      const activeEntry = timeEntriesData?.find(entry => !entry.end_time)

      setSubjects(subjectsData || [])
      setTimeEntries(timeEntriesData || [])
      setActiveSession(activeEntry || null)
      
      if (activeEntry) {
        setSelectedSubject(activeEntry.subject_id)
        setSessionNotes(activeEntry.notes || '')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const startSession = async () => {
    if (!selectedSubject) return

    try {
      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          user_id: user?.id,
          subject_id: selectedSubject,
          start_time: new Date().toISOString(),
          notes: sessionNotes
        })
        .select()
        .single()

      if (error) throw error

      setActiveSession(data)
      fetchData()
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const endSession = async () => {
    if (!activeSession) return

    try {
      const endTime = new Date()
      const duration = differenceInMinutes(endTime, new Date(activeSession.start_time))

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration_minutes: duration,
          notes: sessionNotes
        })
        .eq('id', activeSession.id)

      if (error) throw error

      setActiveSession(null)
      setSessionNotes('')
      fetchData()
    } catch (error) {
      console.error('Error ending session:', error)
    }
  }

  const getSessionDuration = () => {
    if (!activeSession) return 0
    return differenceInMinutes(currentTime, new Date(activeSession.start_time))
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
  }

  const getWeeklyStats = () => {
    const now = new Date()
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)

    const weeklyEntries = timeEntries.filter(entry => 
      entry.end_time && 
      isWithinInterval(new Date(entry.start_time), { start: weekStart, end: weekEnd })
    )

    const totalMinutes = weeklyEntries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0)
    const subjectStats = subjects.map(subject => {
      const subjectMinutes = weeklyEntries
        .filter(entry => entry.subject_id === subject.id)
        .reduce((total, entry) => total + (entry.duration_minutes || 0), 0)
      
      return {
        subject: subject.name,
        color: subject.color,
        minutes: subjectMinutes,
        percentage: totalMinutes > 0 ? (subjectMinutes / totalMinutes) * 100 : 0
      }
    }).filter(stat => stat.minutes > 0)

    return { totalMinutes, subjectStats }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const { totalMinutes, subjectStats } = getWeeklyStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Time Tracker</h1>
        <p className="text-gray-600 mt-1">Track your study sessions and analyze your learning patterns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timer Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Timer */}
          <div className="card">
            <div className="text-center">
              <div className="bg-primary-100 p-6 rounded-full w-32 h-32 mx-auto mb-6 flex items-center justify-center">
                <div className="text-center">
                  <Timer className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-primary-900">
                    {formatDuration(getSessionDuration())}
                  </div>
                </div>
              </div>

              {!activeSession ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Subject
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      className="input-field max-w-xs mx-auto"
                      required
                    >
                      <option value="">Choose a subject...</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Session Notes (Optional)
                    </label>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="input-field max-w-md mx-auto"
                      rows={2}
                      placeholder="What are you studying today?"
                    />
                  </div>

                  <button
                    onClick={startSession}
                    disabled={!selectedSubject}
                    className="btn-primary flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Play className="h-5 w-5" />
                    <span>Start Session</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                    <div className="flex items-center space-x-2 justify-center mb-2">
                      <div 
                        className="w-3 h-3 rounded-full animate-pulse"
                        style={{ backgroundColor: subjects.find(s => s.id === activeSession.subject_id)?.color }}
                      ></div>
                      <span className="font-medium text-green-800">
                        Studying {subjects.find(s => s.id === activeSession.subject_id)?.name}
                      </span>
                    </div>
                    <p className="text-sm text-green-600">
                      Started at {format(new Date(activeSession.start_time), 'HH:mm')}
                    </p>
                  </div>

                  <div>
                    <textarea
                      value={sessionNotes}
                      onChange={(e) => setSessionNotes(e.target.value)}
                      className="input-field max-w-md mx-auto"
                      rows={2}
                      placeholder="Add notes about this session..."
                    />
                  </div>

                  <button
                    onClick={endSession}
                    className="btn-primary flex items-center space-x-2 mx-auto bg-red-600 hover:bg-red-700"
                  >
                    <Square className="h-5 w-5" />
                    <span>End Session</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Sessions */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Sessions</h2>
            
            {timeEntries.filter(entry => entry.end_time).length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No completed sessions yet</p>
                <p className="text-sm text-gray-400">Start your first study session!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {timeEntries
                  .filter(entry => entry.end_time)
                  .slice(0, 10)
                  .map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: (entry.subjects as any)?.color }}
                        ></div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {(entry.subjects as any)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(new Date(entry.start_time), 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {formatDuration(entry.duration_minutes || 0)}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-gray-500 truncate max-w-32">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Weekly Stats */}
          <div className="card">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">This Week</h2>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-primary-600">
                {formatDuration(totalMinutes)}
              </div>
              <p className="text-sm text-gray-600">Total study time</p>
            </div>

            {subjectStats.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900 text-sm">By Subject</h3>
                {subjectStats.map((stat, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">{stat.subject}</span>
                      <span className="font-medium">{formatDuration(stat.minutes)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.color 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Sessions</span>
                <span className="font-medium">
                  {timeEntries.filter(entry => entry.end_time).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Average Session</span>
                <span className="font-medium">
                  {timeEntries.filter(entry => entry.end_time).length > 0
                    ? formatDuration(
                        Math.round(
                          timeEntries
                            .filter(entry => entry.end_time)
                            .reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) /
                          timeEntries.filter(entry => entry.end_time).length
                        )
                      )
                    : '0:00'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subjects Studied</span>
                <span className="font-medium">{subjectStats.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}