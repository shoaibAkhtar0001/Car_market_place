import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useBooking } from '../context/BookingContext'
import toast from 'react-hot-toast'

const BookingRequest = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, getAuthToken } = useAuth()
  const { cars } = useCarContext()
  const { createBooking, API_BASE } = useBooking()

  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [form, setForm] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    notes: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const local = cars.find(c => c.id === id)
        if (local) {
          setCar(local)
        } else {
          const res = await fetch(`${API_BASE}/api/cars/${id}`)
          if (res.ok) {
            const backendCar = await res.json()
            setCar({ ...backendCar, id: backendCar._id })
          }
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, cars, API_BASE])

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        buyerName: user.name || prev.buyerName,
        buyerEmail: user.email || prev.buyerEmail,
        buyerPhone: user.phone || prev.buyerPhone,
      }))
    }
  }, [user])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!user) return toast.error('Please log in to request a booking')
    if (!form.startDate || !form.endDate) return toast.error('Select start and end dates')
    if (new Date(form.startDate) >= new Date(form.endDate))
      return toast.error('End date must be after start date')

    try {
      setSubmitting(true)
      const token = getAuthToken()
      const carId = car?._id || car?.id || id
      await createBooking({
        token,
        carId,
        startDate: form.startDate,
        endDate: form.endDate,
        buyerName: form.buyerName,
        buyerEmail: form.buyerEmail,
        buyerPhone: form.buyerPhone,
        notes: form.notes,
      })
      toast.success('Booking request sent to the seller')
      navigate(`/car/${carId}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold">Preparing booking...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-3xl shadow-xl p-6">
          {/* Header */}
          <div className="flex items-start gap-4 mb-6">
            <img
              src={car.images?.[0]?.url || car.images?.[0] || ''}
              alt={car.title}
              className="w-24 h-20 object-cover rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-black text-blue-600">Request Booking</h1>
              <p className="text-sm text-gray-600">
                {car.title || `${car.year} ${car.make} ${car.model}`}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                Start Date
              </label>
              <div className="flex items-center border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 outline-none bg-transparent text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* End Date */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                End Date
              </label>
              <div className="flex items-center border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <input
                  type="date"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 outline-none bg-transparent text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* Buyer Name */}
            <div>
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                Your Name
              </label>
              <div className="flex items-center border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <input
                  type="text"
                  name="buyerName"
                  value={form.buyerName}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 outline-none bg-transparent text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                Email
              </label>
              <div className="flex items-center border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <input
                  type="email"
                  name="buyerEmail"
                  value={form.buyerEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 outline-none bg-transparent text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* Phone (+91 prefix) */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                Phone
              </label>
              <div className="flex items-center border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <span className="px-3 text-sm text-gray-500 select-none">+91</span>
                <input
                  type="tel"
                  name="buyerPhone"
                  value={form.buyerPhone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 outline-none bg-transparent text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-base-content dark:text-black mb-2">
                Notes for Seller
              </label>
              <div className="flex items-start border border-blue-500 rounded-xl bg-white overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 transition">
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Pickup time, delivery location, any special requests..."
                  className="w-full px-3 py-2 outline-none bg-transparent resize-none text-base-content dark:text-black"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="md:col-span-2 flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BookingRequest
