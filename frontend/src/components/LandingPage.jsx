import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Sparkles, ShieldCheck, MapPin, MessageCircle } from 'lucide-react'

export default function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleBrowse = () => {
    if (user) {
      navigate('/dashboard')
    } else {
      navigate('/login')
    }
  }

  const handleLearnMore = () => {
    navigate('/register')
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-[2px] opacity-70"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-950/80" />

      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white text-xl font-black">C</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black bg-gradient-to-r from-white via-blue-100 to-blue-300 bg-clip-text text-transparent">
                CarMarket
              </h1>
              <p className="text-xs text-blue-200/80 font-medium">Premium Motors</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="px-5 py-2.5 rounded-xl font-semibold text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28 lg:py-36 grid md:grid-cols-12 gap-10">
          <div className="md:col-span-7 lg:col-span-6">
            <div className="flex items-center gap-2 mb-3 text-blue-200">
              <Sparkles className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-wider">Discover</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
              Find Your Dream Car with <span className="text-blue-300">Car MarketPlace</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/90 leading-relaxed max-w-2xl">
              Browse verified listings, compare prices, schedule test drives, and get personalized recommendations.
              Start your journey to the ideal car—confidently and effortlessly.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-8 py-4 rounded-2xl text-base font-extrabold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105"
                onClick={handleBrowse}
              >
                Browse Cars Now
              </button>
              <button
                className="px-8 py-4 rounded-2xl font-extrabold transition-all text-white/90 hover:text-white border border-white/20 hover:bg-white/10"
                onClick={handleLearnMore}
              >
                Learn More
              </button>
            </div>
            <div className="mt-8 text-sm text-blue-200/80">
              Trusted marketplace experience with modern design and secure workflows.
            </div>
          </div>

          <div className="md:col-span-5 lg:col-span-6">
            <div className="relative h[340px] md:h[420px] lg:h[500px]">
              <div className="absolute inset-0 rounded-3xl bg-white/10 border border-white/10 backdrop-blur-xl shadow-2xl shadow-blue-950/40" />
              <div className="absolute inset-0 p-6 md:p-8 lg:p-10 flex flex-col justify-between">
                <div>
                  <div className="text-blue-100 font-semibold">Why Car Market</div>
                  <div className="mt-2 text-white text-2xl font-bold">All-in-one car marketplace</div>
                  <div className="mt-5 space-y-4 text-blue-100/90">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-blue-300" />
                      <span>Real-time listings, transparent pricing, and detailed specs.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-blue-300" />
                      <span>Secure buyer-seller messaging for inquiries and bookings.</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-blue-300" />
                      <span>Smart location support with distance-based search and maps.</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <button
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105"
                    onClick={handleBrowse}
                  >
                    Start Exploring
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
