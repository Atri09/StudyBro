import React, { useState, useEffect } from 'react'
import { supabase, Subject, Topic } from '../lib/supabase'
import { 
  BookOpen, 
  ChevronRight, 
  FileText, 
  Brain, 
  TestTube,
  Search,
  Filter
} from 'lucide-react'

interface SubjectListProps {
  onTopicSelect: (subject: Subject, topic: Topic) => void
}

export default function SubjectList({ onTopicSelect }: SubjectListProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [topics, setTopics] = useState<{ [key: string]: Topic[] }>({})
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('*')
        .order('name')

      setSubjects(subjectsData || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTopics = async (subjectId: string) => {
    if (topics[subjectId]) return // Already fetched

    try {
      const { data: topicsData } = await supabase
        .from('topics')
        .select('*')
        .eq('subject_id', subjectId)
        .order('order_index')

      setTopics(prev => ({
        ...prev,
        [subjectId]: topicsData || []
      }))
    } catch (error) {
      console.error('Error fetching topics:', error)
    }
  }

  const handleSubjectClick = async (subject: Subject) => {
    if (expandedSubject === subject.id) {
      setExpandedSubject(null)
    } else {
      setExpandedSubject(subject.id)
      await fetchTopics(subject.id)
    }
  }

  const getSubjectIcon = (subjectName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Physics': <TestTube className="h-6 w-6" />,
      'Chemistry': <TestTube className="h-6 w-6" />,
      'Mathematics': <Brain className="h-6 w-6" />,
      'Biology': <TestTube className="h-6 w-6" />,
      'Computer Science': <Brain className="h-6 w-6" />,
      'Information Technology': <Brain className="h-6 w-6" />,
    }
    return iconMap[subjectName] || <BookOpen className="h-6 w-6" />
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
        <p className="text-gray-600 mt-1">Explore comprehensive notes and resources for all subjects</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <button className="btn-secondary flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubjects.map((subject) => (
          <div key={subject.id} className="card hover:shadow-lg transition-all duration-200">
            <button
              onClick={() => handleSubjectClick(subject)}
              className="w-full text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div 
                  className="p-3 rounded-lg"
                  style={{ backgroundColor: `${subject.color}20` }}
                >
                  <div style={{ color: subject.color }}>
                    {getSubjectIcon(subject.name)}
                  </div>
                </div>
                <ChevronRight 
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    expandedSubject === subject.id ? 'rotate-90' : ''
                  }`} 
                />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{subject.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{subject.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center space-x-1">
                  <FileText className="h-4 w-4" />
                  <span>{topics[subject.id]?.length || 0} Topics</span>
                </span>
              </div>
            </button>

            {/* Topics List */}
            {expandedSubject === subject.id && topics[subject.id] && (
              <div className="mt-4 pt-4 border-t border-gray-200 animate-slide-up">
                <h4 className="font-medium text-gray-900 mb-3">Topics</h4>
                <div className="space-y-2">
                  {topics[subject.id].map((topic) => (
                    <button
                      key={topic.id}
                      onClick={() => onTopicSelect(subject, topic)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{topic.title}</p>
                          <p className="text-sm text-gray-600">{topic.description}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredSubjects.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
          <p className="text-gray-600">Try adjusting your search terms</p>
        </div>
      )}
    </div>
  )
}