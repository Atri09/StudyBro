import React, { useState } from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Auth from './components/Auth'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import SubjectList from './components/SubjectList'
import TopicView from './components/TopicView'
import Goals from './components/Goals'
import TimeTracker from './components/TimeTracker'
import { Subject, Topic } from './lib/supabase'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [selectedTopic, setSelectedTopic] = useState<{ subject: Subject; topic: Topic } | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return <Auth />
  }

  const handleTopicSelect = (subject: Subject, topic: Topic) => {
    setSelectedTopic({ subject, topic })
    setCurrentPage('topic-view')
  }

  const handleBackToSubjects = () => {
    setSelectedTopic(null)
    setCurrentPage('subjects')
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />
      case 'subjects':
        return <SubjectList onTopicSelect={handleTopicSelect} />
      case 'topic-view':
        return selectedTopic ? (
          <TopicView 
            subject={selectedTopic.subject}
            topic={selectedTopic.topic}
            onBack={handleBackToSubjects}
          />
        ) : (
          <SubjectList onTopicSelect={handleTopicSelect} />
        )
      case 'goals':
        return <Goals />
      case 'time-tracker':
        return <TimeTracker />
      case 'profile':
        return (
          <div className="card">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
            <p className="text-gray-600">Profile management coming soon...</p>
          </div>
        )
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App