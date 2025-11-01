import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(formData.email, formData.password)
      // Redirect based on user role
      if (response.user.role === 'seller') {
        navigate('/seller')
      } else {
        navigate('/buyer')
      }
    } catch (err) {
      setError(err.message || 'Login failed')
      toast.error(err.message || 'Wrong credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-cover bg-center scale-105 blur-[1px] opacity-70"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1542362567-b07e54358753?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-950/80" />
      <div className="relative z-10 card w-11/12 max-w-7xl md:max-w-7xl bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 text-white">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-white/20 to-white/10 rounded-2xl flex items-center justify-center shadow-lg">
                  <span className="text-white text-xl font-black">C</span>
                </div>
                <div>
                  <h2 className="text-xl font-black">CarMarket</h2>
                  <p className="text-xs text-blue-100">Premium Motors</p>
                </div>
              </div>
              <h1 className="text-4xl font-extrabold leading-tight">Welcome back</h1>
              <p className="mt-4 text-blue-100/90">Sign in to continue exploring cars for sale and rent, manage inquiries, and more.</p>
              <div className="mt-8 space-y-3 text-blue-100/90">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Secure authentication with session persistence</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Role-based access for buyers and sellers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Modern, responsive design</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-100/80">© {new Date().getFullYear()} CarMarket — All rights reserved.</div>
          </div>
          <div className="card-body p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Welcome Back
            </h1>
            <p className="text-base-content/70 text-lg">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="input input-bordered input-primary w-full"
                required
              />
            </div>
            
            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="input input-bordered input-primary w-full"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error">
                <svg className="w-6 h-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}
            
            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl text-base font-bold transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 w-full"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          {/* Registration Info */}
          <div className="bg-base-200/70 backdrop-blur-sm p-4 rounded-lg mt-4">
            <h3 className="font-semibold text-sm mb-2">New to Car Marketplace?</h3>
            <p className="text-xs text-base-content/70">
              Create an account to start buying/ renting  or selling cars in our marketplace.
            </p>
          </div>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-base-content/70">
              Don't have an account?{' '}
              <Link to="/register" className="link link-primary font-semibold">
                Create Account
              </Link>
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
