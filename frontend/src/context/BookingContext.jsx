import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import io from 'socket.io-client'

const BookingContext = createContext()

export const useBooking = () => {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used within BookingProvider')
  return ctx
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export const BookingProvider = ({ children }) => {
  const [bookingsByCar, setBookingsByCar] = useState({}) // carId -> bookings[]
  const socketRef = useRef(null)

  useEffect(() => {
    // init socket
    const socket = io(API_BASE, { transports: ['websocket'] })
    socketRef.current = socket
    return () => { socket.close() }
  }, [])

  // Load bookings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('carMarketplace_bookings')
      if (saved) {
        const parsed = JSON.parse(saved)
        console.log('BookingContext - Loaded bookings from localStorage:', parsed)
        setBookingsByCar(parsed)
      } else {
        console.log('BookingContext - No bookings found in localStorage')
      }
    } catch (e) {
      console.error('BookingContext - Error loading from localStorage:', e)
    }
  }, [])

  // Persist bookings to localStorage
  useEffect(() => {
    try {
      console.log('BookingContext - Saving bookings to localStorage:', bookingsByCar)
      localStorage.setItem('carMarketplace_bookings', JSON.stringify(bookingsByCar))
    } catch (e) {
      console.error('BookingContext - Error saving to localStorage:', e)
    }
  }, [bookingsByCar])

  const joinRoom = (room) => {
    socketRef.current?.emit('join', room)
  }
  const leaveRoom = (room) => {
    socketRef.current?.emit('leave', room)
  }

  // Load current buyer bookings and populate cache per car
  const getMyBookings = async (token) => {
    console.log('BookingContext - getMyBookings called with token:', !!token)
    if (!token) {
      console.log('BookingContext - No token provided, returning empty array')
      return []
    }
    try {
      const res = await fetch(`${API_BASE}/api/bookings/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      console.log('BookingContext - getMyBookings response status:', res.status)
      if (!res.ok) {
        console.error('BookingContext - getMyBookings failed:', await res.text())
        return []
      }
      const data = await res.json()
      console.log('BookingContext - getMyBookings received data:', data)
      const normalized = data.map(b => ({ ...b, status: (b.status === 'declined' || b.status === 'cancelled') ? 'rejected' : b.status }))
      // Merge into bookingsByCar buckets
      setBookingsByCar(prev => {
        const next = { ...prev }
        for (const b of normalized) {
          const list = next[b.carId] || []
          // upsert by _id
          const idx = list.findIndex(x => x._id === b._id)
          if (idx >= 0) list[idx] = b
          else list.unshift(b)
          next[b.carId] = list
        }
        console.log('BookingContext - Updated bookingsByCar after getMyBookings:', next)
        return next
      })
      return normalized
    } catch (err) {
      console.error('BookingContext - getMyBookings error:', err)
      return []
    }
  }

  // subscribe to global booking events and update caches
  useEffect(() => {
    const socket = socketRef.current
    if (!socket) return
    const normalize = (b) => ({
      ...b,
      status: b.status === 'declined' || b.status === 'cancelled' ? 'rejected' : b.status
    })
    const onCreated = (booking) => {
      setBookingsByCar(prev => {
        const b = normalize(booking)
        const list = prev[b.carId] || []
        return { ...prev, [b.carId]: [b, ...list] }
      })
    }
    const onUpdated = (booking) => {
      setBookingsByCar(prev => {
        const b = normalize(booking)
        const list = prev[b.carId] || []
        const next = list.map(x => x._id === b._id ? b : x)
        return { ...prev, [b.carId]: next }
      })
    }
    socket.on('booking:created', onCreated)
    socket.on('booking:updated', onUpdated)
    return () => {
      socket.off('booking:created', onCreated)
      socket.off('booking:updated', onUpdated)
    }
  }, [socketRef.current])

  const isObjectId = (val) => typeof val === 'string' && /^[a-fA-F0-9]{24}$/.test(val)

  const createLocalBooking = ({ carId, startDate, endDate, buyerName, buyerEmail, buyerPhone, notes }) => {
    const booking = {
      _id: `local_${Date.now()}`,
      carId,
      startDate,
      endDate,
      status: 'pending',
      source: 'local',
      createdAt: new Date().toISOString(),
      buyerName: buyerName || '',
      buyerEmail: buyerEmail || '',
      buyerPhone: buyerPhone || '',
      notes: notes || '',
    }
    setBookingsByCar(prev => {
      const list = prev[carId] || []
      return { ...prev, [carId]: [booking, ...list] }
    })
    return booking
  }

  const datesOverlap = (aStart, aEnd, bStart, bEnd) => {
    const as = new Date(aStart).getTime()
    const ae = new Date(aEnd).getTime()
    const bs = new Date(bStart).getTime()
    const be = new Date(bEnd).getTime()
    if (Number.isNaN(as) || Number.isNaN(ae) || Number.isNaN(bs) || Number.isNaN(be)) return false
    // overlap if ranges intersect (inclusive)
    return as <= be && bs <= ae
  }

  const getCarBookings = async (carId) => {
    // If we have a backend id, try backend; otherwise return local
    if (isObjectId(carId)) {
      const res = await fetch(`${API_BASE}/api/bookings/car/${carId}`)
      if (!res.ok) {
        // fallback to local cache
        return bookingsByCar[carId] || []
      }
      const data = await res.json()
      const normalized = data.map(b => ({ ...b, status: (b.status === 'declined' || b.status === 'cancelled') ? 'rejected' : b.status }))
      setBookingsByCar(prev => ({ ...prev, [carId]: normalized }))
      return normalized
    }
    return bookingsByCar[carId] || []
  }

  const createBooking = async ({ token, carId, startDate, endDate, buyerName, buyerEmail, buyerPhone, notes }) => {
    console.log('BookingContext - Creating booking:', { carId, startDate, endDate, buyerName, buyerEmail, buyerPhone })
    
    // Basic local conflict check first (fast feedback)
    const existing = bookingsByCar[carId] || []
    const hasClash = existing.some(b => (b.status === 'pending' || b.status === 'confirmed') && datesOverlap(startDate, endDate, b.startDate, b.endDate))
    if (hasClash) {
      throw new Error('Selected dates are unavailable for this car')
    }
    
    // If backend id and token provided, try backend first
    if (isObjectId(carId) && token) {
      console.log('BookingContext - Sending to backend API')
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ carId, startDate, endDate, buyerName, buyerEmail, buyerPhone, notes })
      })
      if (res.ok) {
        const booking = await res.json()
        console.log('BookingContext - Backend booking created:', booking)
        setBookingsByCar(prev => {
          const list = prev[carId] || []
          const updated = { ...prev, [carId]: [booking, ...list] }
          console.log('BookingContext - Updated bookingsByCar:', updated)
          return updated
        })
        return booking
      } else {
        console.error('BookingContext - Backend booking failed:', res.status, await res.text())
      }
      // if backend fails, gracefully fall back to local booking
    }
    
    // Local fallback booking (basic and logical)
    console.log('BookingContext - Creating local booking')
    const localBooking = createLocalBooking({ carId, startDate, endDate, buyerName, buyerEmail, buyerPhone, notes })
    console.log('BookingContext - Local booking created:', localBooking)
    return localBooking
  }

  const updateBookingStatus = async ({ token, carId, bookingId, status }) => {
    // backend first if looks like ObjectId
    if (isObjectId(bookingId) && token) {
      try {
        // Map outgoing status to backend values
        const outgoing = status === 'rejected' ? 'declined' : status
        const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/status`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status: outgoing })
        })
        if (res.ok) {
          const updated = await res.json()
          setBookingsByCar(prev => {
            const list = prev[carId] || []
            const normalized = { ...updated, status: (updated.status === 'declined' || updated.status === 'cancelled') ? 'rejected' : updated.status }
            const next = list.map(b => b._id === bookingId ? { ...b, ...normalized } : b)
            return { ...prev, [carId]: next }
          })
          return updated
        }
      } catch (_) {
        // fall back
      }
    }
    // local update fallback
    setBookingsByCar(prev => {
      const list = prev[carId] || []
      const next = list.map(b => b._id === bookingId ? { ...b, status } : b)
      return { ...prev, [carId]: next }
    })
    return { _id: bookingId, status }
  }

  const value = useMemo(() => ({
    bookingsByCar,
    getCarBookings,
    getMyBookings,
    createBooking,
    updateBookingStatus,
    joinRoom,
    leaveRoom,
    API_BASE,
  }), [bookingsByCar])

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}
