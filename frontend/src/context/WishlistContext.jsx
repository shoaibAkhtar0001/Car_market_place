import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

const WishlistContext = createContext()

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth()
  const [wishlist, setWishlist] = useState(new Set())
  const [isInitialized, setIsInitialized] = useState(false)

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id}`)
      if (savedWishlist) {
        try {
          const wishlistArray = JSON.parse(savedWishlist)
          setWishlist(new Set(wishlistArray))
        } catch (error) {
          console.error('Error loading wishlist from localStorage:', error)
          setWishlist(new Set())
        }
      }
    } else {
      setWishlist(new Set())
    }
    setIsInitialized(true)
  }, [user])

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized && user) {
      const wishlistArray = Array.from(wishlist)
      localStorage.setItem(`wishlist_${user.id}`, JSON.stringify(wishlistArray))
    }
  }, [wishlist, user, isInitialized])

  const addToWishlist = (carId) => {
    setWishlist(prev => new Set([...prev, carId]))
  }

  const removeFromWishlist = (carId) => {
    setWishlist(prev => {
      const newSet = new Set(prev)
      newSet.delete(carId)
      return newSet
    })
  }

  const toggleWishlist = (carId) => {
    if (wishlist.has(carId)) {
      removeFromWishlist(carId)
      return false // removed
    } else {
      addToWishlist(carId)
      return true // added
    }
  }

  const isInWishlist = (carId) => {
    return wishlist.has(carId)
  }

  const getWishlistItems = () => {
    return Array.from(wishlist)
  }

  const clearWishlist = () => {
    setWishlist(new Set())
  }

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    getWishlistItems,
    clearWishlist,
    wishlistCount: wishlist.size
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}
