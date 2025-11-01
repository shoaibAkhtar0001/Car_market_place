import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, UserCheck, Car, ShoppingCart, CheckCircle } from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: 'buyer'
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role: role
    })
  }

  const roleOptions = [
    {
      role: 'buyer',
      icon: ShoppingCart,
      title: 'Buyer',
      description: 'Browse & purchase cars at the best deals',
      color: 'text-blue-500'
    },
    {
      role: 'seller',
      icon: Car,
      title: 'Seller',
      description: 'List your cars & reach thousands of buyers',
      color: 'text-green-500'
    }
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    try {
      const response = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: formData.role
      })
      
      // Show success message and redirect to login after delay
      setSuccess(`Account created successfully! Welcome ${response.user.name}. Redirecting to login...`)
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Registration failed')
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
            "url('https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?q=80&w=2070&auto=format&fit=crop')",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/70 to-blue-950/80" />
      <div className="relative z-10 card w-11/12 max-w-7xl md:max-w-7xl bg-base-100/90 backdrop-blur-xl shadow-2xl border border-base-300 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Promo Panel */}
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
              <h1 className="text-4xl font-extrabold leading-tight">
                Create your account
              </h1>
              <p className="mt-4 text-blue-100/90">
                Join a modern marketplace to buy or sell cars with confidence. Secure,
                fast, and designed for you.
              </p>
              <div className="mt-8 space-y-3 text-blue-100/90">
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Browse real-time listings with transparent pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Secure messaging for inquiries and bookings</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-2 w-2 rounded-full bg-blue-200" />
                  <span>Smart location and powerful search filters</span>
                </div>
              </div>
            </div>
            <div className="text-sm text-blue-100/80">
              © {new Date().getFullYear()} CarMarket — All rights reserved.
            </div>
          </div>
          <div className="card-body p-6 md:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-base-content/70 text-lg">Join our car marketplace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="input input-bordered input-primary w-full pl-10"
                  required
                />
              </div>
            </div>
            
            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Email Address</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="input input-bordered input-primary w-full pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Phone Number</span>
              </label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="input input-bordered input-primary w-full pl-10"
                />
              </div>
            </div>
            
            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  className="input input-bordered input-primary w-full pl-10"
                  required
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Confirm Password</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="input input-bordered input-primary w-full pl-10"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Choose Your Role</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {roleOptions.map((option) => {
                  const IconComponent = option.icon
                  return (
                    <div
                      key={option.role}
                      onClick={() => handleRoleSelect(option.role)}
                      className={`card card-compact cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        formData.role === option.role 
                          ? 'bg-primary text-primary-content border-2 border-primary shadow-lg' 
                          : 'bg-base-200 hover:bg-base-300 border border-base-300'
                      }`}
                    >
                      <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`${formData.role === option.role ? 'text-primary-content' : option.color}`}>
                              <IconComponent className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-bold text-base">{option.title}</h3>
                              <p className={`text-sm ${
                                formData.role === option.role 
                                  ? 'text-primary-content/80' 
                                  : 'text-base-content/70'
                              }`}>
                                {option.description}
                              </p>
                            </div>
                          </div>
                          {formData.role === option.role && (
                            <div className="text-primary-content">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-base-200 p-3 rounded-lg text-sm">
              <p className="font-semibold mb-1">Password Requirements:</p>
              <ul className="text-xs space-y-1 text-base-content/70">
                <li>• At least 6 characters long</li>
                <li>• Use a mix of letters and numbers</li>
                <li>• Keep it secure and unique</li>
              </ul>
            </div>

            {/* Success Message */}
            {success && (
              <div className="alert alert-success">
                <CheckCircle className="w-6 h-6 shrink-0" />
                <span>{success}</span>
              </div>
            )}

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
              className="btn btn-primary w-full btn-lg"
            >
              {loading ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
          
          {/* Benefits */}
         

          {/* Login Link */}
          <div className="text-center mt-6">
            <p className="text-base-content/70">
              Already have an account?{' '}
              <Link to="/login" className="link link-primary font-semibold">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default Register
