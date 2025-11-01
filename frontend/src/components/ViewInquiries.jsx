import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { useInquiryContext } from '../context/InquiryContext'
import { ArrowLeft, MessageCircle, Send, Phone, Mail, User, Car, Clock, Search, Filter, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import io from 'socket.io-client'

const ViewInquiries = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getCarsBySeller, refreshCarsFromStorage } = useCarContext()
  const { getInquiriesForSeller, addReply, markAsRead, inquiries: allInquiries } = useInquiryContext()
  const [inquiries, setInquiries] = useState([])
  const [selectedInquiry, setSelectedInquiry] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  // Offers state (backend)
  const [offers, setOffers] = useState([])
  const [offerLoading, setOfferLoading] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerSubmitting, setOfferSubmitting] = useState(false)
  const [socket, setSocket] = useState(null)

  const API_BASE = (import.meta.env.VITE_API_BASE || 'http://localhost:5000')

  // Fetch real inquiries from InquiryContext
  const fetchInquiries = () => {
    try {
      setLoading(true)
      if (user?.id) {
        const sellerInquiries = getInquiriesForSeller(user.id)
        setInquiries(sellerInquiries)
        console.log(`Loaded ${sellerInquiries.length} inquiries for seller ${user.id}`)
      } else {
        setInquiries([])
      }
    } catch (error) {
      console.error('Error fetching inquiries:', error)
      setInquiries([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.id) {
      fetchInquiries()
    }
  }, [user?.id])

  // Refresh inquiries when allInquiries changes (new messages received)
  useEffect(() => {
    if (user?.id) {
      fetchInquiries()
    }
  }, [allInquiries, user?.id])


  // Compute conversation id consistent with backend (sorted participants + carId)
  const conversationKey = (() => {
    if (!selectedInquiry?.buyerId || !selectedInquiry?.sellerId || !selectedInquiry?.carId) return null
    const a = String(selectedInquiry.buyerId)
    const b = String(selectedInquiry.sellerId)
    const sorted = [a, b].sort().join('-')
    return `${sorted}-${selectedInquiry.carId}`
  })()

  // Load offers thread when inquiry selected
  useEffect(() => {
    const loadOffers = async () => {
      if (!conversationKey) { setOffers([]); return }
      try {
        setOfferLoading(true)
        const token = localStorage.getItem('authToken')
        const res = await fetch(`${API_BASE}/api/offers/thread/${conversationKey}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        })
        if (res.ok) {
          const data = await res.json()
          setOffers(data)
          
          // Auto-create inquiry from first offer if no inquiry exists yet
          if (data.length > 0 && selectedInquiry && !selectedInquiry.replies?.length) {
            const firstOffer = data[0]
            // This creates a virtual inquiry entry if one doesn't exist
            // so the conversation shows up in the list
          }
        } else {
          setOffers([])
        }
      } catch (_) {
        setOffers([])
      } finally {
        setOfferLoading(false)
      }
    }
    loadOffers()
  }, [conversationKey, selectedInquiry])

  // Socket: join rooms and refresh on offer events
  useEffect(() => {
    if (!selectedInquiry) return
    const s = io(API_BASE, { transports: ['websocket'] })
    setSocket(s)
    const rooms = []
    if (user?.id) { rooms.push(`user:${user.id}`) }
    if (selectedInquiry.carId) { rooms.push(`car:${selectedInquiry.carId}`) }
    if (conversationKey) { rooms.push(`conversation:${conversationKey}`) }
    rooms.forEach(r => s.emit('join', r))
    const onCreated = () => {
      // re-load thread
      if (conversationKey) {
        fetch(`${API_BASE}/api/offers/thread/${conversationKey}`).then(r => r.ok ? r.json() : []).then(setOffers).catch(()=>{})
      }
    }
    const onUpdated = onCreated
    s.on('offer:created', onCreated)
    s.on('offer:updated', onUpdated)
    return () => {
      rooms.forEach(r => s.emit('leave', r))
      s.off('offer:created', onCreated)
      s.off('offer:updated', onUpdated)
      s.close()
    }
  }, [selectedInquiry?.id, conversationKey, user?.id])

  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = inquiry.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inquiry.carTitle.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

  const handleInquiryClick = (inquiry) => {
    setSelectedInquiry(inquiry)
    // Mark as read if it was unread
    if (inquiry.status === 'unread') {
      markAsRead(inquiry.id)
      // Update local state to reflect the change immediately
      setInquiries(prev => prev.map(inq => 
        inq.id === inquiry.id ? { ...inq, status: 'read' } : inq
      ))
    }
  }

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !selectedInquiry) return

    setSendingReply(true)
    const loadingToast = toast.loading('Sending reply...')
    
    try {
      const replyData = {
        sender: 'seller',
        senderName: user.name || user.email,
        message: replyMessage
      }

      // Add reply using InquiryContext
      addReply(selectedInquiry.id, replyData)

      // Update local state to reflect the change immediately
      const newReply = {
        id: `reply_${Date.now()}`,
        sender: 'seller',
        senderName: user.name || user.email,
        message: replyMessage,
        timestamp: new Date().toISOString()
      }

      setInquiries(prev => prev.map(inq => 
        inq.id === selectedInquiry.id 
          ? { 
              ...inq, 
              replies: [...(inq.replies || []), newReply],
              status: 'replied'
            }
          : inq
      ))

      setSelectedInquiry(prev => ({
        ...prev,
        replies: [...(prev.replies || []), newReply],
        status: 'replied'
      }))

      setReplyMessage('')
      toast.success('Reply sent successfully!', { id: loadingToast })
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply', { id: loadingToast })
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'unread':
        return <span className="badge badge-error">Unread</span>
      case 'read':
        return <span className="badge badge-warning">Read</span>
      case 'replied':
        return <span className="badge badge-success">Replied</span>
      default:
        return <span className="badge badge-ghost">Unknown</span>
    }
  }

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold">Loading inquiries...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="navbar-start">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-circle"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3 ml-4">
            <MessageCircle className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                View Inquiries
              </h1>
              <p className="text-base-content/70">Manage buyer messages and inquiries</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
          {/* Inquiries List */}
          <div className="lg:col-span-1">
            <div className="card bg-base-100 shadow-xl border border-base-300 h-full">
              <div className="card-body p-0">
                {/* Search and Filter */}
                <div className="p-4 border-b border-base-300">
                  <div className="form-control mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                      <input
                        type="text"
                        placeholder="Search inquiries..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input input-bordered w-full pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="form-control">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select select-bordered w-full"
                    >
                      <option value="all">All Status</option>
                      <option value="unread">Unread</option>
                      <option value="read">Read</option>
                      <option value="replied">Replied</option>
                    </select>
                  </div>
                </div>

                {/* Inquiries List */}
                <div className="overflow-y-auto flex-1">
                  {filteredInquiries.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageCircle className="w-12 h-12 text-base-content/30 mx-auto mb-4" />
                      <p className="text-base-content/70">No inquiries found</p>
                    </div>
                  ) : (
                    filteredInquiries.map((inquiry) => (
                      <div
                        key={inquiry.id}
                        onClick={() => handleInquiryClick(inquiry)}
                        className={`p-4 border-b border-base-300 cursor-pointer hover:bg-base-200 transition-colors ${
                          selectedInquiry?.id === inquiry.id ? 'bg-primary/10 border-l-4 border-l-primary' : ''
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-sm">{inquiry.buyerName}</h3>
                          {getStatusBadge(inquiry.status)}
                        </div>
                        
                        <p className="text-xs text-base-content/70 mb-1">{inquiry.carTitle}</p>
                        <p className="text-xs text-base-content/60 mb-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {typeof inquiry.carLocation === 'string' 
                            ? inquiry.carLocation 
                            : inquiry.carLocation?.city && inquiry.carLocation?.state 
                              ? `${inquiry.carLocation.city}, ${inquiry.carLocation.state}` 
                              : 'Location not specified'}
                        </p>
                        
                        <p className="text-sm text-base-content/80 line-clamp-2 mb-2">
                          {inquiry.message}
                        </p>
                        
                        <div className="flex items-center gap-1 text-xs text-base-content/60">
                          <Clock className="w-3 h-3" />
                          {formatTimestamp(inquiry.timestamp)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Inquiry Details */}
          <div className="lg:col-span-2">
            {selectedInquiry ? (
              <div className="card bg-base-100 shadow-xl border border-base-300 h-full">
                <div className="card-body p-0 flex flex-col">
                  {/* Header */}
                  <div className="p-6 border-b border-base-300">
                    <div className="flex items-start gap-4">
                      <img
                        src={selectedInquiry.carImage}
                        alt={selectedInquiry.carTitle}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h2 className="text-xl font-bold mb-1">{selectedInquiry.carTitle}</h2>
                        <div className="flex items-center gap-1 text-sm text-base-content/60 mb-2">
                          <MapPin className="w-4 h-4" />
                          {typeof selectedInquiry.carLocation === 'string' 
                            ? selectedInquiry.carLocation 
                            : selectedInquiry.carLocation?.city && selectedInquiry.carLocation?.state 
                              ? `${selectedInquiry.carLocation.city}, ${selectedInquiry.carLocation.state}` 
                              : 'Location not specified'}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-base-content/70">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {selectedInquiry.buyerName}
                          </div>
                          <div className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {selectedInquiry.buyerEmail}
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {selectedInquiry.buyerPhone}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(selectedInquiry.status)}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Original Message */}
                    <div className="chat chat-start">
                      <div className="chat-image avatar">
                        <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="chat-header">
                        {selectedInquiry.buyerName}
                        <time className="text-xs opacity-50 ml-2">
                          {formatTimestamp(selectedInquiry.timestamp)}
                        </time>
                      </div>
                      <div className="chat-bubble chat-bubble-primary">
                        {selectedInquiry.message}
                      </div>
                    </div>

                    {/* Replies */}
                    {(selectedInquiry.replies || []).map((reply) => (
                      <div
                        key={reply.id}
                        className={`chat ${reply.sender === 'seller' ? 'chat-end' : 'chat-start'}`}
                      >
                        <div className="chat-image avatar">
                          <div className={`w-10 rounded-full ${
                            reply.sender === 'seller' 
                              ? 'bg-secondary text-secondary-content' 
                              : 'bg-primary text-primary-content'
                          } flex items-center justify-center`}>
                            <User className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="chat-header">
                          {reply.sender === 'seller' ? 'You' : selectedInquiry.buyerName}
                          <time className="text-xs opacity-50 ml-2">
                            {formatTimestamp(reply.timestamp)}
                          </time>
                        </div>
                        <div className={`chat-bubble ${
                          reply.sender === 'seller' ? 'chat-bubble-secondary' : 'chat-bubble-primary'
                        }`}>
                          {reply.message}
                        </div>
                      </div>
                    ))}

                    {/* Offers Thread - Integrated as special message bubbles */}
                    {offers.map((o) => (
                      <div key={o._id} className={`chat ${String(o.sender) === String(user?.id) ? 'chat-end' : 'chat-start'}`}>
                        <div className="chat-image avatar">
                          <div className={`w-10 rounded-full ${String(o.sender) === String(user?.id) ? 'bg-secondary text-secondary-content' : 'bg-warning text-warning-content'} flex items-center justify-center`}>
                            <span className="text-lg">💰</span>
                          </div>
                        </div>
                        <div className="chat-header">
                          {String(o.sender) === String(user?.id) ? 'You' : selectedInquiry.buyerName} · {o.messageType}
                          <time className="text-xs opacity-50 ml-2">{new Date(o.createdAt).toLocaleString()}</time>
                        </div>
                        <div className={`chat-bubble ${String(o.sender) === String(user?.id) ? 'chat-bubble-secondary' : 'chat-bubble-warning'} font-semibold`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">💰</span>
                            <span className="text-xl">₹{Number(o.offer?.amount || 0).toLocaleString()}</span>
                            <span className={`badge badge-sm ${o.offer?.status === 'Pending' ? 'badge-warning' : o.offer?.status === 'Accepted' ? 'badge-success' : 'badge-error'}`}>
                              {o.offer?.status}
                            </span>
                          </div>
                          {o.offer?.terms && <div className="text-sm opacity-90 mt-2">📝 {o.offer.terms}</div>}
                          
                          {/* Quick actions for pending offers where you're the recipient */}
                          {o.offer?.status === 'Pending' && String(o.recipient) === String(user?.id) && (
                            <div className="flex gap-2 mt-3">
                              <button 
                                className="btn btn-success btn-xs" 
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('authToken')
                                    const res = await fetch(`${API_BASE}/api/offers/${o._id}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ status: 'Accepted' })
                                    })
                                    if (res.ok) {
                                      const updated = await res.json()
                                      setOffers(prev => prev.map(offer => offer._id === updated._id ? updated : offer))
                                      
                                      // Get full car details and mark as sold
                                      try {
                                        const carsData = JSON.parse(localStorage.getItem('carMarketplace_cars') || '[]')
                                        let carToSell = carsData.find(c => c.id === selectedInquiry.carId || c._id === selectedInquiry.carId)
                                        
                                        console.log('ViewInquiries - Accepting offer for carId:', selectedInquiry.carId)
                                        console.log('ViewInquiries - Car found:', !!carToSell)
                                        console.log('ViewInquiries - Buyer info from offer:', { sender: o.sender, senderEmail: o.senderEmail })
                                        console.log('ViewInquiries - Buyer info from inquiry:', { 
                                          buyerId: selectedInquiry.buyerId, 
                                          buyerName: selectedInquiry.buyerName, 
                                          buyerEmail: selectedInquiry.buyerEmail 
                                        })
                                        
                                        // Fallback: Create minimal car object from inquiry data if car not found
                                        if (!carToSell) {
                                          console.warn('ViewInquiries - Car not in localStorage, using inquiry data')
                                          carToSell = {
                                            id: selectedInquiry.carId,
                                            _id: selectedInquiry.carId,
                                            title: selectedInquiry.carTitle,
                                            year: selectedInquiry.carTitle?.match(/\d{4}/)?.[0] || new Date().getFullYear(),
                                            make: selectedInquiry.carTitle?.split(' ')[1] || 'Unknown',
                                            model: selectedInquiry.carTitle?.split(' ').slice(2).join(' ') || 'Unknown',
                                            price: selectedInquiry.carPrice || o.offer.amount,
                                            images: selectedInquiry.carImage ? [selectedInquiry.carImage] : [],
                                            location: {
                                              city: selectedInquiry.carLocation?.split(',')[0] || 'Unknown',
                                              state: selectedInquiry.carLocation?.split(',')[1]?.trim() || 'Unknown'
                                            }
                                          }
                                        }
                                        
                                        if (carToSell) {
                                          // Use inquiry buyerId as primary, offer sender as fallback
                                          const finalBuyerId = selectedInquiry.buyerId || o.sender
                                          
                                          // Update car status to sold with complete buyer info
                                          const updatedCars = carsData.map(c => 
                                            (c.id === selectedInquiry.carId || c._id === selectedInquiry.carId) 
                                              ? { 
                                                  ...c, 
                                                  status: 'sold', 
                                                  soldTo: finalBuyerId,
                                                  buyerId: finalBuyerId,
                                                  buyerName: selectedInquiry.buyerName,
                                                  buyerEmail: selectedInquiry.buyerEmail,
                                                  buyerPhone: selectedInquiry.buyerPhone,
                                                  soldPrice: o.offer.amount,
                                                  soldDate: new Date().toISOString(),
                                                  offerAccepted: true,
                                                  offerId: o._id
                                                }
                                              : c
                                          )
                                          localStorage.setItem('carMarketplace_cars', JSON.stringify(updatedCars))
                                          
                                          // Refresh CarContext to reflect the sold status
                                          refreshCarsFromStorage()
                                          
                                          // Save to buyer's bought cars list
                                          const boughtCars = JSON.parse(localStorage.getItem('carMarketplace_boughtCars') || '[]')
                                          
                                          // Check if this car is already in bought list
                                          const alreadyBought = boughtCars.some(bc => 
                                            (bc.carId === (carToSell.id || carToSell._id)) && 
                                            (bc.buyerId === o.sender || bc.buyerEmail === selectedInquiry.buyerEmail)
                                          )
                                          
                                          if (!alreadyBought) {
                                            // Use inquiry buyerId as primary, offer sender as fallback
                                            const finalBuyerId = selectedInquiry.buyerId || o.sender
                                            
                                            const boughtCar = {
                                              ...carToSell,
                                              carId: carToSell.id || carToSell._id,
                                              carTitle: carToSell.title || `${carToSell.year} ${carToSell.make} ${carToSell.model}`,
                                              carImage: typeof carToSell.images?.[0] === 'string' ? carToSell.images[0] : carToSell.images?.[0]?.url,
                                              carLocation: `${carToSell.location?.city || 'Unknown'}, ${carToSell.location?.state || 'Unknown'}`,
                                              carPrice: carToSell.price,
                                              boughtPrice: o.offer.amount,
                                              boughtDate: new Date().toISOString(),
                                              buyerId: finalBuyerId,
                                              buyerOfferId: o.sender, // Keep offer sender for reference
                                              buyerName: selectedInquiry.buyerName,
                                              buyerEmail: selectedInquiry.buyerEmail,
                                              buyerPhone: selectedInquiry.buyerPhone,
                                              sellerName: user?.name || user?.fullName,
                                              sellerEmail: user?.email,
                                              sellerPhone: user?.phone,
                                              sellerId: user?.id || user?._id
                                            }
                                            
                                            boughtCars.push(boughtCar)
                                            localStorage.setItem('carMarketplace_boughtCars', JSON.stringify(boughtCars))
                                            
                                            console.log('✅ ViewInquiries - Saved bought car with IDs:', {
                                              buyerId: boughtCar.buyerId,
                                              buyerOfferId: boughtCar.buyerOfferId,
                                              buyerEmail: boughtCar.buyerEmail,
                                              carTitle: boughtCar.carTitle
                                            })
                                            console.log('✅ ViewInquiries - All bought cars now:', boughtCars.length)
                                            
                                            // Show success with details
                                            toast.success(`✅ Offer Accepted! ${boughtCar.carTitle} sold for ₹${Number(boughtCar.boughtPrice).toLocaleString()}`, { duration: 5000 })
                                          } else {
                                            console.log('ViewInquiries - Car already in bought list')
                                            toast.success('Offer accepted! Car marked as sold.')
                                          }
                                        } else {
                                          // This should never happen now with fallback
                                          console.error('ViewInquiries - Critical: Could not process car data')
                                          toast('⚠️ Offer accepted, but car data incomplete. Check "Sold Cars" section.', { 
                                            duration: 6000,
                                            icon: '⚠️' 
                                          })
                                        }
                                      } catch (e) { 
                                        console.error('Failed to update car status', e) 
                                        toast.error('Offer accepted but failed to update car status')
                                      }
                                      
                                      // Trigger a storage event to update other tabs/components
                                      window.dispatchEvent(new Event('storage'))
                                    }
                                  } catch (_) { toast.error('Failed') }
                                }}
                              >
                                ✓ Accept
                              </button>
                              <button 
                                className="btn btn-error btn-xs"
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('authToken')
                                    const res = await fetch(`${API_BASE}/api/offers/${o._id}/status`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                      body: JSON.stringify({ status: 'Rejected' })
                                    })
                                    if (res.ok) {
                                      toast.success('Offer rejected')
                                      const updated = await res.json()
                                      setOffers(prev => prev.map(offer => offer._id === updated._id ? updated : offer))
                                    }
                                  } catch (_) { toast.error('Failed') }
                                }}
                              >
                                ✗ Reject
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div className="p-6 border-t border-base-300">
                    <div className="flex gap-4">
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply..."
                        className="textarea textarea-bordered flex-1 resize-none"
                        rows="3"
                      />
                      <button
                        onClick={handleSendReply}
                        disabled={!replyMessage.trim() || sendingReply}
                        className="btn btn-primary"
                      >
                        {sendingReply ? (
                          <span className="loading loading-spinner loading-sm"></span>
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {/* Make or Counter Offer */}
                    <div className="mt-4 border-t pt-4">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <span>💰</span> Make/Counter Offer
                      </h4>
                      <div className="flex items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-sm mb-1">Your Offer Amount (₹)</label>
                          <input type="number" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} className="input input-bordered w-full" placeholder="e.g., 25000" />
                        </div>
                        <button
                          className="btn btn-warning"
                          disabled={!offerAmount || offerSubmitting || !selectedInquiry}
                          onClick={async () => {
                            try {
                              if (!selectedInquiry) return
                              setOfferSubmitting(true)
                              const token = localStorage.getItem('authToken')
                              const res = await fetch(`${API_BASE}/api/offers`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                  carId: selectedInquiry.carId,
                                  recipientId: selectedInquiry.buyerId,
                                  amount: Number(offerAmount),
                                  terms: `Counter for ${selectedInquiry.carTitle}`
                                })
                              })
                              if (res.ok) {
                                toast.success('Counter-offer sent')
                                setOfferAmount('')
                                // refresh
                                if (conversationKey) {
                                  const d = await fetch(`${API_BASE}/api/offers/thread/${conversationKey}`)
                                  if (d.ok) setOffers(await d.json())
                                }
                              } else {
                                const e = await res.json().catch(()=>({}))
                                toast.error(e.message || 'Failed to send counter')
                              }
                            } catch (_) {
                              toast.error('Failed to send counter')
                            } finally {
                              setOfferSubmitting(false)
                            }
                          }}
                        >
                          {offerSubmitting ? 'Sending...' : offers.length > 0 ? '💰 Send Counter' : '💰 Send Offer'}
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card bg-base-100 shadow-xl border border-base-300 h-full">
                <div className="card-body flex items-center justify-center">
                  <MessageCircle className="w-16 h-16 text-base-content/30 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Select an Inquiry</h3>
                  <p className="text-base-content/70 text-center">
                    Choose an inquiry from the list to view details and respond to buyers
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewInquiries
