import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, Goal } from '../lib/supabase'
import { 
  Target, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Clock, 
  PlayCircle,
  Edit,
  Trash2,
  X
} from 'lucide-react'
import { format } from 'date-fns'

export default function Goals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    target_date: '',
    status: 'pending' as 'pending' | 'in_progress' | 'completed'
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [user])

  const fetchGoals = async () => {
    try {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })

      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingGoal) {
        // Update existing goal
        const { error } = await supabase
          .from('goals')
          .update({
            title: formData.title,
            description: formData.description,
            target_date: formData.target_date,
            status: formData.status
          })
          .eq('id', editingGoal.id)

        if (error) throw error
      } else {
        // Create new goal
        const { error } = await supabase
          .from('goals')
          .insert({
            user_id: user?.id,
            title: formData.title,
            description: formData.description,
            target_date: formData.target_date,
            status: formData.status
          })

        if (error) throw error
      }

      setFormData({ title: '', description: '', target_date: '', status: 'pending' })
      setShowForm(false)
      setEditingGoal(null)
      fetchGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description || '',
      target_date: goal.target_date || '',
      status: goal.status
    })
    setShowForm(true)
  }

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalId)

      if (error) throw error
      fetchGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const updateGoalStatus = async (goalId: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      const { error } = await supabase
        .from('goals')
        .update({ status })
        .eq('id', goalId)

      if (error) throw error
      fetchGoals()
    } catch (error) {
      console.error('Error updating goal status:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'in_progress':
        return <PlayCircle className="h-5 w-5 text-yellow-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Goals</h1>
          <p className="text-gray-600 mt-1">Set and track your learning objectives</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingGoal(null)
            setFormData({ title: '', description: '', target_date: '', status: 'pending' })
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingGoal ? 'Edit Goal' : 'New Goal'}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingGoal(null)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Complete Physics Chapter 1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field"
                  rows={3}
                  placeholder="Describe your goal in detail..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="input-field"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setEditingGoal(null)
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
          <p className="text-gray-600 mb-4">Set your first learning goal to get started</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => (
            <div key={goal.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(goal.status)}
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(goal.status)}`}>
                    {goal.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(goal)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{goal.title}</h3>
              
              {goal.description && (
                <p className="text-gray-600 text-sm mb-4">{goal.description}</p>
              )}

              {goal.target_date && (
                <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
                </div>
              )}

              <div className="flex space-x-2">
                {goal.status === 'pending' && (
                  <button
                    onClick={() => updateGoalStatus(goal.id, 'in_progress')}
                    className="btn-secondary text-sm flex-1"
                  >
                    Start
                  </button>
                )}
                {goal.status === 'in_progress' && (
                  <button
                    onClick={() => updateGoalStatus(goal.id, 'completed')}
                    className="btn-primary text-sm flex-1"
                  >
                    Complete
                  </button>
                )}
                {goal.status === 'completed' && (
                  <button
                    onClick={() => updateGoalStatus(goal.id, 'in_progress')}
                    className="btn-secondary text-sm flex-1"
                  >
                    Reopen
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}