import { createContext, useContext, useState, useEffect } from 'react'

const InquiryContext = createContext()

export const useInquiryContext = () => {
  const context = useContext(InquiryContext)
  if (!context) {
    throw new Error('useInquiryContext must be used within an InquiryProvider')
  }
  return context
}

export const InquiryProvider = ({ children }) => {
  const [inquiries, setInquiries] = useState([])
  const [loading, setLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load inquiries from localStorage on initialization
  useEffect(() => {
    try {
      const savedInquiries = localStorage.getItem('carMarketplace_inquiries')
      if (savedInquiries) {
        const parsedInquiries = JSON.parse(savedInquiries)
        setInquiries(parsedInquiries)
        console.log(`InquiryContext initialized - loaded ${parsedInquiries.length} inquiries from storage`)
      } else {
        console.log('InquiryContext initialized - no saved inquiries found, starting fresh')
      }
    } catch (error) {
      console.error('Error loading inquiries from localStorage:', error)
      setInquiries([])
    } finally {
      setIsInitialized(true)
    }
  }, [])

  // Save inquiries to localStorage whenever inquiries array changes
  useEffect(() => {
    if (!isInitialized) return // Don't save during initial load
    
    try {
      localStorage.setItem('carMarketplace_inquiries', JSON.stringify(inquiries))
      console.log(`Saved ${inquiries.length} inquiries to localStorage`)
    } catch (error) {
      console.error('Error saving inquiries to localStorage:', error)
    }
  }, [inquiries, isInitialized])

  // Send a new inquiry from buyer to seller
  const sendInquiry = (inquiryData) => {
    const newInquiry = {
      id: `inquiry_${Date.now()}`,
      carId: inquiryData.carId,
      carTitle: inquiryData.carTitle,
      carImage: inquiryData.carImage,
      carLocation: inquiryData.carLocation,
      carPrice: inquiryData.carPrice,
      sellerId: inquiryData.sellerId,
      sellerName: inquiryData.sellerName,
      sellerEmail: inquiryData.sellerEmail,
      buyerId: inquiryData.buyerId,
      buyerName: inquiryData.buyerName,
      buyerEmail: inquiryData.buyerEmail,
      buyerPhone: inquiryData.buyerPhone,
      message: inquiryData.message,
      status: 'unread',
      timestamp: new Date().toISOString(),
      replies: []
    }
    
    setInquiries(prevInquiries => [newInquiry, ...prevInquiries])
    console.log('New inquiry sent:', newInquiry)
    return newInquiry
  }

  // Add a reply to an existing inquiry
  const addReply = (inquiryId, replyData) => {
    const newReply = {
      id: `reply_${Date.now()}`,
      sender: replyData.sender, // 'buyer' or 'seller'
      senderName: replyData.senderName,
      message: replyData.message,
      timestamp: new Date().toISOString()
    }

    setInquiries(prevInquiries => 
      prevInquiries.map(inquiry => 
        inquiry.id === inquiryId 
          ? { 
              ...inquiry, 
              replies: [...(inquiry.replies || []), newReply],
              status: replyData.sender === 'seller' ? 'replied' : 'read'
            }
          : inquiry
      )
    )

    console.log('Reply added to inquiry:', inquiryId)
    return newReply
  }

  // Mark inquiry as read
  const markAsRead = (inquiryId) => {
    setInquiries(prevInquiries => 
      prevInquiries.map(inquiry => 
        inquiry.id === inquiryId && inquiry.status === 'unread'
          ? { ...inquiry, status: 'read' }
          : inquiry
      )
    )
  }

  // Get inquiries for a specific seller
  const getInquiriesForSeller = (sellerId) => {
    return inquiries.filter(inquiry => inquiry.sellerId === sellerId)
  }

  // Get inquiries for a specific buyer
  const getInquiriesForBuyer = (buyerId) => {
    return inquiries.filter(inquiry => inquiry.buyerId === buyerId)
  }

  // Get inquiries for a specific car
  const getInquiriesForCar = (carId) => {
    return inquiries.filter(inquiry => inquiry.carId === carId)
  }

  // Delete an inquiry
  const deleteInquiry = (inquiryId) => {
    setInquiries(prevInquiries => 
      prevInquiries.filter(inquiry => inquiry.id !== inquiryId)
    )
  }

  // Clear all inquiries (for debugging/reset)
  const clearAllInquiries = () => {
    setInquiries([])
    localStorage.removeItem('carMarketplace_inquiries')
    console.log('All inquiries cleared from system and localStorage')
  }

  // Get inquiry statistics for seller
  const getSellerStats = (sellerId) => {
    const sellerInquiries = getInquiriesForSeller(sellerId)
    return {
      total: sellerInquiries.length,
      unread: sellerInquiries.filter(inq => inq.status === 'unread').length,
      read: sellerInquiries.filter(inq => inq.status === 'read').length,
      replied: sellerInquiries.filter(inq => inq.status === 'replied').length
    }
  }

  const value = {
    inquiries,
    loading,
    setLoading,
    sendInquiry,
    addReply,
    markAsRead,
    getInquiriesForSeller,
    getInquiriesForBuyer,
    getInquiriesForCar,
    deleteInquiry,
    clearAllInquiries,
    getSellerStats
  }

  return (
    <InquiryContext.Provider value={value}>
      {children}
    </InquiryContext.Provider>
  )
}
