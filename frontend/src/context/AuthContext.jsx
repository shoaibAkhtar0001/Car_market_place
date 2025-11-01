import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

// Backend API base URL
const API_BASE_URL = 'http://localhost:5000/api'

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user was logged in (for persistence)
    const savedUser = localStorage.getItem('currentUser')
    const savedToken = localStorage.getItem('authToken')
    
    if (savedUser && savedToken) {
      try {
        const userData = JSON.parse(savedUser)
        setUser(userData)
        console.log('Restored user session:', userData.name)
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('currentUser')
        localStorage.removeItem('authToken')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Save user and token to localStorage
      localStorage.setItem('currentUser', JSON.stringify(data.user))
      localStorage.setItem('authToken', data.token)
      
      setUser(data.user)
      console.log('Login successful:', data.user.name, data.user.role)
      
      return { user: data.user, token: data.token }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Don't auto-login after registration - user should login manually
      console.log('Registration successful:', data.user.name, data.user.role)
      
      return { user: data.user, token: data.token }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear user session and token
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    setUser(null)
    console.log('User logged out')
  }

  // Helper function to get auth token
  const getAuthToken = () => {
    return localStorage.getItem('authToken')
  }

  // Helper function to make authenticated API calls
  const makeAuthenticatedRequest = async (url, options = {}) => {
    const token = getAuthToken()
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    getAuthToken,
    makeAuthenticatedRequest
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
