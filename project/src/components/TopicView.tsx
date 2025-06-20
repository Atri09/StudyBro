import React, { useState, useEffect } from 'react'
import { supabase, Subject, Topic, Note, PracticeQuestion } from '../lib/supabase'
import { 
  ArrowLeft, 
  FileText, 
  Brain, 
  TestTube2, 
  Play,
  CheckCircle,
  XCircle,
  RotateCcw
} from 'lucide-react'

interface TopicViewProps {
  subject: Subject
  topic: Topic
  onBack: () => void
}

export default function TopicView({ subject, topic, onBack }: TopicViewProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [activeTab, setActiveTab] = useState<'notes' | 'practice'>('notes')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopicContent()
  }, [topic.id])

  const fetchTopicContent = async () => {
    try {
      // Fetch notes
      const { data: notesData } = await supabase
        .from('notes')
        .select('*')
        .eq('topic_id', topic.id)
        .order('created_at')

      // Fetch practice questions
      const { data: questionsData } = await supabase
        .from('practice_questions')
        .select('*')
        .eq('topic_id', topic.id)
        .order('created_at')

      setNotes(notesData || [])
      setQuestions(questionsData || [])
    } catch (error) {
      console.error('Error fetching topic content:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    const isCorrect = selectedAnswer === questions[currentQuestion].correct_answer
    if (isCorrect) {
      setScore(score + 1)
    }

    setAnsweredQuestions([...answeredQuestions, currentQuestion])
    setShowResult(true)
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowResult(false)
    }
  }

  const resetQuiz = () => {
    setCurrentQuestion(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setAnsweredQuestions([])
  }

  const isQuizComplete = answeredQuestions.length === questions.length

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
      <div className="flex items-center space-x-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-1">
            <span>{subject.name}</span>
            <span>•</span>
            <span>Topic</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
          <p className="text-gray-600 mt-1">{topic.description}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notes'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Notes & Resources</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('practice')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'practice'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TestTube2 className="h-4 w-4" />
              <span>Practice Test</span>
              {questions.length > 0 && (
                <span className="bg-primary-100 text-primary-600 px-2 py-1 rounded-full text-xs">
                  {questions.length}
                </span>
              )}
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          {notes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notes available</h3>
              <p className="text-gray-600">Notes for this topic will be added soon</p>
            </div>
          ) : (
            notes.map((note) => (
              <div key={note.id} className="card">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-primary-100 p-2 rounded-lg">
                    {note.note_type === 'mindmap' ? (
                      <Brain className="h-5 w-5 text-primary-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{note.title}</h3>
                    <span className="text-sm text-gray-500 capitalize">{note.note_type} Notes</span>
                  </div>
                </div>

                {note.note_type === 'mindmap' && note.mind_map_url ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-3">Mind Map</p>
                    <img 
                      src={note.mind_map_url} 
                      alt="Mind Map" 
                      className="w-full rounded-lg border border-gray-200"
                    />
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700">
                      {note.content}
                    </div>
                    
                    {note.short_notes && (
                      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2">Quick Summary</h4>
                        <p className="text-yellow-700 text-sm">{note.short_notes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'practice' && (
        <div className="space-y-6">
          {questions.length === 0 ? (
            <div className="text-center py-12">
              <TestTube2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No practice questions available</h3>
              <p className="text-gray-600">Practice questions for this topic will be added soon</p>
            </div>
          ) : (
            <div className="card">
              {/* Quiz Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Practice Test</h3>
                  <p className="text-sm text-gray-600">
                    Question {currentQuestion + 1} of {questions.length}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Score: {score}/{answeredQuestions.length}
                  </div>
                  <button
                    onClick={resetQuiz}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>

              {!isQuizComplete ? (
                <>
                  {/* Question */}
                  <div className="mb-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">
                      {questions[currentQuestion].question}
                    </h4>
                    
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            selectedAnswer === index
                              ? showResult
                                ? index === questions[currentQuestion].correct_answer
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-red-500 bg-red-50'
                                : 'border-primary-500 bg-primary-50'
                              : showResult && index === questions[currentQuestion].correct_answer
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswer === index
                                ? showResult
                                  ? index === questions[currentQuestion].correct_answer
                                    ? 'border-green-500 bg-green-500'
                                    : 'border-red-500 bg-red-500'
                                  : 'border-primary-500 bg-primary-500'
                                : showResult && index === questions[currentQuestion].correct_answer
                                ? 'border-green-500 bg-green-500'
                                : 'border-gray-300'
                            }`}>
                              {showResult && (
                                selectedAnswer === index
                                  ? index === questions[currentQuestion].correct_answer
                                    ? <CheckCircle className="h-4 w-4 text-white" />
                                    : <XCircle className="h-4 w-4 text-white" />
                                  : index === questions[currentQuestion].correct_answer
                                  ? <CheckCircle className="h-4 w-4 text-white" />
                                  : null
                              )}
                            </div>
                            <span className="text-gray-900">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  {showResult && questions[currentQuestion].explanation && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-800 mb-2">Explanation</h5>
                      <p className="text-blue-700 text-sm">{questions[currentQuestion].explanation}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <div></div>
                    {!showResult ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="btn-primary"
                      >
                        {currentQuestion < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                      </button>
                    )}
                  </div>
                </>
              ) : (
                /* Quiz Complete */
                <div className="text-center py-8">
                  <div className="bg-green-100 p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    Your Score: {score}/{questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </p>
                  <button
                    onClick={resetQuiz}
                    className="btn-primary"
                  >
                    Take Quiz Again
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}