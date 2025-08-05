import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Brain, Play, BarChart3, Clock, Target, TrendingUp, User, LogIn } from 'lucide-react'

// Import version from package.json
const version = import.meta.env.PACKAGE_VERSION || '1.0.0'

export function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">BrainTracker</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  to="/app"
                  className="flex items-center px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors"
                >
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <Brain className="h-20 w-20 text-primary-600 mx-auto mb-6" />
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Track Your Brain's Reaction Time
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              BrainTracker is a scientific tool for measuring and monitoring your brain's reaction time to visual stimuli. 
              Originally developed by researcher Seth Roberts, this test helps you understand and improve your cognitive performance over time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to={user ? "/app/test" : "/login"}
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center"
            >
              <Play className="h-6 w-6 mr-2" />
              Try Now
            </Link>
            {!user && (
              <Link
                to="/login"
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
              >
                <User className="h-6 w-6 mr-2" />
                Create Account
              </Link>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card text-center">
              <Clock className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Precise Measurement</h3>
              <p className="text-gray-600">
                Measure your reaction time to millisecond precision with scientifically validated testing protocols.
              </p>
            </div>
            
            <div className="card text-center">
              <BarChart3 className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Track Progress</h3>
              <p className="text-gray-600">
                Monitor your cognitive performance over time with detailed charts and statistics.
              </p>
            </div>
            
            <div className="card text-center">
              <Target className="h-12 w-12 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Optimize Performance</h3>
              <p className="text-gray-600">
                Identify factors that affect your reaction time and optimize your cognitive health.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                The Science Behind Brain Tracking
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Seth Roberts was an early self-experimenter who developed this script as a way to measure 
                  "brain reaction time", which he believed was correlated with many important aspects of 
                  health and well-being.
                </p>
                <p>
                  Through careful self-experimentation, Roberts discovered that reaction time could be 
                  influenced by factors like sleep quality, diet, exercise, and various supplements. 
                  This tool allows you to conduct your own experiments and discover what affects your 
                  cognitive performance.
                </p>
                <p>
                  The test measures the time it takes for your brain to process a visual stimulus and 
                  respond with a motor action. Faster reaction times generally indicate better cognitive 
                  function and neural efficiency.
                </p>
              </div>
            </div>
            
            <div className="card bg-primary-50 border-primary-200">
              <h3 className="text-xl font-semibold text-primary-900 mb-4">How It Works</h3>
              <div className="space-y-3 text-primary-800">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</div>
                  <p>A red circle appears on screen after a random delay</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</div>
                  <p>Click the circle (or press spacebar) as quickly as possible</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</div>
                  <p>Complete 20 trials to get an accurate measurement</p>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</div>
                  <p>Track your results over time to identify patterns</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Research Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Research & Examples
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Seth Roberts published several examples of insights gained from brain reaction time testing:
          </p>
          
          <div className="card text-left max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Published Research</h3>
            <p className="text-gray-600 mb-4">
              Roberts, S. (2004). Self-experimentation as a source of new ideas: Ten examples about sleep, 
              mood, health, and weight.
            </p>
            <p className="text-sm text-gray-500">
              This research demonstrates how self-tracking can lead to valuable insights about factors 
              affecting cognitive performance, including the effects of different foods, sleep patterns, 
              and lifestyle changes on brain function.
            </p>
          </div>

          {/* Video Presentation */}
          <div className="card max-w-2xl mx-auto mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Experiments with BrainTracker</h3>
            <p className="text-gray-600 mb-4">
              Here's a presentation showing more about experiments conducted with this app:
            </p>
            <a 
              href="https://player.vimeo.com/video/147673343?title=0&byline=0&portrait=0" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block hover:opacity-90 transition-opacity"
            >
              <img 
                src="https://i.imgur.com/VgKfJWD.png" 
                alt="QS15 Fish Oil - Brain tracking experiments presentation"
                className="w-full rounded-lg shadow-md border border-gray-200"
              />
            </a>
            <p className="text-sm text-gray-500 mt-3">
              Click to watch the presentation about brain tracking experiments and their findings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Discover Patterns</h4>
              <p className="text-sm text-gray-600">
                Track how different conditions affect your reaction time - morning vs evening, 
                before/after coffee, exercise effects, and more.
              </p>
            </div>
            
            <div className="card">
              <Brain className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold text-gray-900 mb-2">Optimize Health</h4>
              <p className="text-sm text-gray-600">
                Use your data to make informed decisions about diet, sleep, supplements, 
                and lifestyle changes that improve cognitive function.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Start Tracking Your Brain Performance Today
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join the community of self-experimenters discovering what affects their cognitive performance.
          </p>
          <Link
            to={user ? "/app/test" : "/login"}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Play className="h-6 w-6 mr-2" />
            {user ? "Take a Test" : "Get Started Free"}
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Brain className="h-6 w-6 text-primary-400 mr-2" />
            <span className="font-semibold">BrainTracker</span>
            <span className="ml-2 text-sm text-gray-400">v{version}</span>
          </div>
          <p className="text-sm mb-2">
            Based on the original research by Seth Roberts. 
            <a href="https://personalscience.com" className="text-primary-400 hover:text-primary-300 ml-1">Subscribe to Personal Science Week</a> to learn more.
          </p>
          <p className="text-xs text-gray-400">
            © 2025 <a href="https://personalscience.com" className="text-primary-400 hover:text-primary-300">personalscience.com</a>. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}