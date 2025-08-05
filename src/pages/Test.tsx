import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Brain, Play, RotateCcw, Save } from 'lucide-react'

type TestPhase = 'setup' | 'instructions' | 'warmup' | 'test' | 'results'

interface TestResult {
  reactionTimes: number[]
  averageTime: number
}

export function Test() {
  const { user } = useAuth()
  const [phase, setPhase] = useState<TestPhase>('setup')
  const [testType, setTestType] = useState<'warmup' | 'test'>('warmup')
  const [currentTrial, setCurrentTrial] = useState(0)
  const [reactionTimes, setReactionTimes] = useState<number[]>([])
  const [startTime, setStartTime] = useState<number>(0)
  const [showStimulus, setShowStimulus] = useState(false)
  const [waitingForClick, setWaitingForClick] = useState(false)
  const [condition, setCondition] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [results, setResults] = useState<TestResult | null>(null)
  const [earlyClick, setEarlyClick] = useState(false)

  const totalTrials = testType === 'warmup' ? 5 : 20

  const startTrial = useCallback(() => {
    setShowStimulus(false)
    setWaitingForClick(false)
    setEarlyClick(false)
    
    // Random delay between 1-4 seconds
    const delay = Math.random() * 3000 + 1000
    
    setTimeout(() => {
      setShowStimulus(true)
      setWaitingForClick(true)
      setStartTime(performance.now())
    }, delay)
  }, [])

  const handleClick = useCallback(() => {
    // If user clicks before stimulus appears, show warning and restart trial
    if (!showStimulus && !waitingForClick) {
      setEarlyClick(true)
      setTimeout(() => {
        startTrial()
      }, 1500) // Show warning for 1.5 seconds then restart
      return
    }
    
    if (!waitingForClick || !showStimulus) return
    
    const reactionTime = performance.now() - startTime
    const newReactionTimes = [...reactionTimes, reactionTime]
    setReactionTimes(newReactionTimes)
    setWaitingForClick(false)
    setShowStimulus(false)
    
    if (currentTrial + 1 >= totalTrials) {
      // Test complete
      const averageTime = newReactionTimes.reduce((sum, time) => sum + time, 0) / newReactionTimes.length
      setResults({
        reactionTimes: newReactionTimes,
        averageTime
      })
      setPhase('results')
    } else {
      setCurrentTrial(currentTrial + 1)
      setTimeout(startTrial, 1000) // 1 second break between trials
    }
  }, [waitingForClick, showStimulus, startTime, reactionTimes, currentTrial, totalTrials, startTrial])

  useEffect(() => {
    if (phase === 'warmup' || phase === 'test') {
      startTrial()
    }
  }, [phase, startTrial])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (phase === 'warmup' || phase === 'test')) {
        e.preventDefault()
        handleClick()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleClick, phase])

  const startTest = (type: 'warmup' | 'test') => {
    setTestType(type)
    setCurrentTrial(0)
    setReactionTimes([])
    setResults(null)
    setPhase('instructions')
  }

  const beginTest = () => {
    setPhase(testType)
  }

  const saveResults = async () => {
    if (!user || !results) return
    
    setSaving(true)
    try {
      // Ensure user profile exists before saving test results
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!profile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
          })
      }

      const { error } = await supabase
        .from('brain_tests')
        .insert({
          user_id: user.id,
          test_type: testType,
          reaction_times: results.reactionTimes,
          average_time: results.averageTime,
          condition: condition || null,
          notes: notes || null
        })

      if (error) throw error
      
      // Reset for next test
      setPhase('setup')
      setCondition('')
      setNotes('')
    } catch (error) {
      console.error('Error saving test results:', error)
      alert('Failed to save test results. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const resetTest = () => {
    setPhase('setup')
    setCurrentTrial(0)
    setReactionTimes([])
    setResults(null)
    setCondition('')
    setNotes('')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {phase === 'setup' && (
        <div className="text-center space-y-8">
          <div>
            <Brain className="h-20 w-20 text-primary-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Brain Reaction Time Test</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              This test measures your brain's reaction time to visual stimuli. 
              You'll see a circle appear on screen - click it (or press spacebar) as quickly as possible.
            </p>
          </div>

          <div className="card max-w-md mx-auto space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Condition (optional)
              </label>
              <input
                type="text"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="input-field px-3 py-2"
                placeholder="e.g., after coffee, morning, tired"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field px-3 py-2"
                rows={3}
                placeholder="Any additional notes about your current state"
              />
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => startTest('warmup')}
              className="btn-secondary flex items-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Warmup (5 trials)
            </button>
            <button
              onClick={() => startTest('test')}
              className="btn-primary flex items-center"
            >
              <Play className="h-5 w-5 mr-2" />
              Full Test (20 trials)
            </button>
          </div>
        </div>
      )}

      {phase === 'instructions' && (
        <div className="text-center space-y-8">
          <div className="card max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {testType === 'warmup' ? 'Warmup Instructions' : 'Test Instructions'}
            </h2>
            <div className="text-left space-y-4 text-gray-700">
              <p>• A red circle will appear on screen after a random delay</p>
              <p>• Click the circle (or press spacebar) as quickly as possible when it appears</p>
              <p>• Don't click before the circle appears - wait for it!</p>
              <p>• You'll complete {totalTrials} trials</p>
              <p>• Try to stay focused and react as quickly as possible</p>
            </div>
            <button
              onClick={beginTest}
              className="btn-primary mt-6 flex items-center mx-auto"
            >
              <Play className="h-5 w-5 mr-2" />
              Begin {testType === 'warmup' ? 'Warmup' : 'Test'}
            </button>
          </div>
        </div>
      )}

      {(phase === 'warmup' || phase === 'test') && (
        <div className="text-center space-y-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {testType === 'warmup' ? 'Warmup' : 'Test'} in Progress
            </h2>
            <p className="text-lg text-gray-600">
              Trial {currentTrial + 1} of {totalTrials}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-4 max-w-md mx-auto">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentTrial + 1) / totalTrials) * 100}%` }}
              />
            </div>
          </div>

          <div className="relative">
            <div 
              className="h-96 flex items-center justify-center bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer"
              onClick={handleClick}
            >
              {earlyClick && (
                <div className="text-center">
                  <p className="text-red-600 text-xl font-semibold mb-2">Too early!</p>
                  <p className="text-gray-600">Wait for the red circle to appear</p>
                </div>
              )}
              {!earlyClick && !showStimulus && !waitingForClick && (
                <p className="text-gray-500 text-lg">Get ready...</p>
              )}
              {!earlyClick && !showStimulus && waitingForClick && (
                <p className="text-gray-500 text-lg">Wait for it...</p>
              )}
              {!earlyClick && showStimulus && (
                <button
                  onClick={handleClick}
                  className="w-24 h-24 bg-red-500 rounded-full animate-pulse-slow hover:bg-red-600 transition-colors focus:outline-none focus:ring-4 focus:ring-red-300"
                  aria-label="Click when you see this circle"
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click the red circle or press spacebar when it appears
            </p>
          </div>
        </div>
      )}

      {phase === 'results' && results && (
        <div className="text-center space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {testType === 'warmup' ? 'Warmup' : 'Test'} Complete!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Average Time</h3>
              <p className="text-3xl font-bold text-primary-600">{results.averageTime.toFixed(0)}ms</p>
            </div>
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Best Time</h3>
              <p className="text-3xl font-bold text-green-600">
                {Math.min(...results.reactionTimes).toFixed(0)}ms
              </p>
            </div>
            <div className="card text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Trials</h3>
              <p className="text-3xl font-bold text-gray-900">{results.reactionTimes.length}</p>
            </div>
          </div>

          <div className="card max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Trial Results</h3>
            <div className="grid grid-cols-5 gap-2 text-sm">
              {results.reactionTimes.map((time, index) => (
                <div
                  key={index}
                  className={`p-2 rounded text-center font-medium ${
                    time < 300 ? 'bg-green-100 text-green-800' :
                    time < 400 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}
                >
                  {time.toFixed(0)}ms
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={resetTest}
              className="btn-secondary flex items-center"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Take Another Test
            </button>
            {testType === 'test' && (
              <button
                onClick={saveResults}
                disabled={saving}
                className="btn-primary flex items-center disabled:opacity-50"
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? 'Saving...' : 'Save Results'}
              </button>
            )}
          </div>

          {testType === 'warmup' && (
            <div className="card max-w-md mx-auto bg-blue-50 border-blue-200">
              <p className="text-blue-800 text-sm">
                This was a warmup session. Take the full test to save your results and track your progress over time.
              </p>
              <button
                onClick={() => startTest('test')}
                className="btn-primary mt-4 w-full"
              >
                Take Full Test
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}