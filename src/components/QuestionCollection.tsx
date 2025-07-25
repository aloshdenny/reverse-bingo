import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generatePersonalizedQuestions, type AIQuestion } from '../lib/ai-questions'
import { ChevronLeft, ChevronRight, CheckCircle, MessageCircle, Loader2 } from 'lucide-react'

interface QuestionCollectionProps {
  roomId: string
  playerId: string
  onQuestionsCompleted: () => void
}

export default function QuestionCollection({ roomId: _, playerId, onQuestionsCompleted }: QuestionCollectionProps) {
  const [questions, setQuestions] = useState<AIQuestion[]>([])
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const generatedQuestions = await generatePersonalizedQuestions()
        setQuestions(generatedQuestions)
      } catch (err) {
        console.error('Failed to load questions:', err)
        // If all else fails, use local fallback
        setQuestions([
          { question: "What's your favorite way to spend a weekend?", category: "lifestyle" },
          { question: "If you could have dinner with any historical figure, who would it be?", category: "personality" },
          { question: "What's the most unusual food you've ever tried and enjoyed?", category: "food" },
          { question: "Do you prefer mountains or beaches for vacation?", category: "travel" },
          { question: "What's a skill you'd love to learn if you had unlimited time?", category: "interests" },
          { question: "Are you more of a morning person or night owl?", category: "lifestyle" },
          { question: "What's your go-to comfort activity when stressed?", category: "personality" },
          { question: "If you could live in any time period, which would you choose?", category: "preferences" },
          { question: "What's something you're passionate about that might surprise people?", category: "interests" },
          { question: "Do you prefer big social gatherings or intimate small groups?", category: "personality" }
        ])
      } finally {
        setIsLoadingQuestions(false)
      }
    }

    loadQuestions()
  }, [])

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0

  const handleNext = async () => {
    if (!currentAnswer.trim()) {
      setError('Please provide an answer')
      return
    }

    const newAnswers = { ...answers, [currentQuestion.question]: currentAnswer.trim() }
    setAnswers(newAnswers)
    setCurrentAnswer('')
    setError('')

    if (isLastQuestion) {
      setIsSubmitting(true)
      try {
        // Save all answers to database
        const { error: updateError } = await supabase
          .from('players')
          .update({ answers: newAnswers })
          .eq('id', playerId)

        if (updateError) throw updateError

        onQuestionsCompleted()
      } catch (err: any) {
        setError(err.message || 'Failed to save answers')
        setIsSubmitting(false)
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      const prevQuestion = questions[currentQuestionIndex - 1]
      setCurrentAnswer(answers[prevQuestion.question] || '')
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setError('')
    }
  }

  // Load previous answer if going back
  useEffect(() => {
    if (currentQuestion) {
      setCurrentAnswer(answers[currentQuestion.question] || '')
    }
  }, [currentQuestionIndex, answers, currentQuestion])

  // Loading state
  if (isLoadingQuestions) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mb-4">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Preparing Your Questions
          </h2>
          <p className="text-white/70">
            Generating personalized questions just for you...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-3xl p-6 sm:p-8 slide-up">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                  Tell us about yourself
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  Your answers will be used to generate clues for others to guess
                </p>
              </div>
              <div className="mt-4 sm:mt-0">
                <span className="inline-flex items-center bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {currentQuestionIndex + 1} of {questions.length}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden backdrop-blur-sm">
                <div 
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-full rounded-full transition-all duration-500 ease-out pulse-glow"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-lg flex items-center justify-center"
                   style={{ left: `calc(${progress}% - 10px)` }}>
                <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>

          {currentQuestion && (
            <div className="space-y-6">
              {/* Question */}
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">{currentQuestionIndex + 1}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 leading-relaxed">
                      {currentQuestion.question}
                    </h3>
                    <div className="relative">
                      <textarea
                        value={currentAnswer}
                        onChange={(e) => setCurrentAnswer(e.target.value)}
                        className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm transition-all duration-200"
                        rows={4}
                        placeholder="Share your thoughts here..."
                        maxLength={200}
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-white/50">
                        {currentAnswer.length}/200
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/20 border border-red-400/30 text-red-100 rounded-xl backdrop-blur-sm slide-up">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="order-2 sm:order-1 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm flex items-center justify-center space-x-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={isSubmitting || !currentAnswer.trim()}
                  className="order-1 sm:order-2 gradient-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-8 py-3 rounded-xl flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </>
                  ) : isLastQuestion ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      <span>Complete</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Tip */}
          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
            <div className="text-center">
              <p className="text-white/70 text-sm">
                💡 <strong>Tip:</strong> Be creative and specific - it makes the guessing game more fun!
              </p>
            </div>
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-20 right-20 w-16 h-16 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-full blur-xl floating-animation"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-xl" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
} 