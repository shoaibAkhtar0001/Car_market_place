import { useState } from 'react'
import { useCarContext } from '../context/CarContext'
import { useAuth } from '../context/AuthContext'
import { useInquiryContext } from '../context/InquiryContext'
import toast from 'react-hot-toast'
import { Car, Plus, Eye, Users, ArrowRight, CheckCircle, MessageCircle } from 'lucide-react'

const SystemDemo = () => {
  const { cars, getActiveCars, getCarsBySeller, addCar, clearAllCars, resetAllViews } = useCarContext()
  const { user } = useAuth()
  const { inquiries, sendInquiry, getInquiriesForSeller, clearAllInquiries } = useInquiryContext()
  const [showDemo, setShowDemo] = useState(false)

  const activeCars = getActiveCars()
  const sellerCars = getCarsBySeller(user?.id || 'seller_1')
  const sellerInquiries = getInquiriesForSeller(user?.id || 'seller_1')

  const addDemoCar = () => {
    const demoCar = {
      sellerId: user?.id || 'demo_seller',
      sellerName: user?.name || 'Demo Seller',
      sellerPhone: '+91 98765 43210',
      title: `2024 Demo Car ${Date.now()}`,
      make: 'Demo',
      model: 'TestCar',
      year: 2024,
      price: Math.floor(Math.random() * 1000000) + 500000,
      listingType: 'sale',
      condition: 'Excellent',
      mileage: Math.floor(Math.random() * 50000) + 5000,
      fuelType: 'Petrol',
      bodyType: 'Sedan',
      transmission: 'Automatic',
      color: 'Silver',
      description: 'Demo car added to show real-time system functionality',
      location: {
        city: 'Mumbai',
        state: 'Maharashtra',
        area: 'Demo Area',
        coordinates: { latitude: 19.2881, longitude: 72.8562 }
      },
      images: [
        { url: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop', isPrimary: true }
      ],
      features: ['Demo Feature', 'Test Feature']
    }

    const loadingToast = toast.loading('Adding demo car...')
    
    try {
      const newCar = addCar(demoCar)
      toast.success(
        `🚗 Demo car "${newCar.title}" added! Check the buyer dashboard to see it appear instantly.`,
        { 
          id: loadingToast,
          duration: 4000
        }
      )
    } catch (error) {
      toast.error('Failed to add demo car', { id: loadingToast })
    }
  }

  const addDemoInquiry = () => {
    if (activeCars.length === 0) {
      toast.error('Add a demo car first to create inquiries!')
      return
    }

    const randomCar = activeCars[Math.floor(Math.random() * activeCars.length)]
    const demoInquiry = {
      carId: randomCar.id,
      carTitle: randomCar.title,
      carImage: randomCar.images[0]?.url || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=600&h=400&fit=crop',
      carLocation: `${randomCar.location?.city || 'Unknown'}, ${randomCar.location?.state || 'Unknown'}`,
      carPrice: randomCar.price,
      sellerId: randomCar.sellerId,
      sellerName: randomCar.sellerName,
      sellerEmail: randomCar.sellerEmail || 'seller@demo.com',
      buyerId: 'demo_buyer_' + Date.now(),
      buyerName: 'Demo Buyer',
      buyerEmail: 'buyer@demo.com',
      buyerPhone: '+91 87654 32109',
      message: `Hi, I'm interested in your ${randomCar.make} ${randomCar.model}. Is it still available? Can we schedule a test drive?`
    }

    const loadingToast = toast.loading('Adding demo inquiry...')
    
    try {
      sendInquiry(demoInquiry)
      toast.success(
        `💬 Demo inquiry sent for "${randomCar.title}"! Check the seller inquiries page.`,
        { 
          id: loadingToast,
          duration: 4000
        }
      )
    } catch (error) {
      toast.error('Failed to add demo inquiry', { id: loadingToast })
    }
  }

  if (!showDemo) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDemo(true)}
          className="btn btn-primary btn-circle shadow-lg"
          title="Show System Demo"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <div className="card bg-base-100 shadow-2xl border border-primary/20">
        <div className="card-body p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="card-title text-sm flex items-center gap-2">
              <Car className="w-4 h-4 text-primary" />
              Live System Demo
            </h3>
            <button
              onClick={() => setShowDemo(false)}
              className="btn btn-ghost btn-xs"
            >
              ×
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* System Stats */}
            <div className="stats stats-vertical shadow-sm">
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Total Cars in System</div>
                <div className="stat-value text-lg text-primary">{cars.length}</div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Active for Buyers</div>
                <div className="stat-value text-lg text-accent">{activeCars.length}</div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Your Listings</div>
                <div className="stat-value text-lg text-secondary">{sellerCars.length}</div>
              </div>
              <div className="stat py-2 px-3">
                <div className="stat-title text-xs">Your Inquiries</div>
                <div className="stat-value text-lg text-info">{sellerInquiries.length}</div>
              </div>
            </div>

            {/* How it works */}
            <div className="bg-info/10 p-3 rounded-lg">
              <h4 className="font-semibold text-xs mb-2 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                How it works:
              </h4>
              <div className="space-y-1 text-xs text-base-content/80">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-primary" />
                  <span>Sellers upload → Cars added to system</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-accent" />
                  <span>Buyers see → Real-time car listings</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-secondary" />
                  <span>Updates → Instant across all users</span>
                </div>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3 h-3 text-info" />
                  <span>Buyers message → Sellers get inquiries</span>
                </div>
              </div>
            </div>

            {/* Demo Actions */}
            <div className="space-y-2">
              <button
                onClick={addDemoCar}
                className="btn btn-primary btn-sm w-full"
              >
                <Plus className="w-4 h-4" />
                Add Demo Car
              </button>
              
              <button
                onClick={addDemoInquiry}
                className="btn btn-info btn-sm w-full"
              >
                <MessageCircle className="w-4 h-4" />
                Add Demo Inquiry
              </button>
              
              {cars.length > 0 && (
                <>
                  <button
                    onClick={() => {
                      resetAllViews()
                      toast.success('🔄 All view counts reset to 0!')
                    }}
                    className="btn btn-warning btn-sm w-full"
                  >
                    Reset All Views
                  </button>
                  <button
                    onClick={() => {
                      clearAllCars()
                      toast.success('🗑️ All cars cleared from system!')
                    }}
                    className="btn btn-error btn-sm w-full"
                  >
                    Clear All Cars
                  </button>
                </>
              )}
              
              {inquiries.length > 0 && (
                <button
                  onClick={() => {
                    clearAllInquiries()
                    toast.success('🗑️ All inquiries cleared from system!')
                  }}
                  className="btn btn-error btn-sm w-full"
                >
                  Clear All Inquiries
                </button>
              )}
            </div>

            <div className="text-xs text-base-content/60 text-center">
              Try the messaging system: Add car → Add inquiry → Check seller inquiries!
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemDemo
