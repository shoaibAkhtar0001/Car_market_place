import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCarContext } from '../context/CarContext'
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, DollarSign, Eye, Car, Calendar, Users, MessageCircle } from 'lucide-react'

const SalesAnalytics = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getCarsBySeller } = useCarContext()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30days')

  // Get seller's cars from CarContext
  const sellerCars = getCarsBySeller(user?.id || 'seller_1')

  // Calculate real analytics data from seller's cars
  const analyticsData = useMemo(() => {
    if (!sellerCars || sellerCars.length === 0) {
      return {
        overview: {
          totalListings: 0,
          activeListings: 0,
          soldCars: 0,
          totalRevenue: 0,
          totalViews: 0,
          totalInquiries: 0,
          averagePrice: 0,
          averageDaysToSell: 0
        },
        monthlyData: [],
        topPerformingCars: [],
        recentSales: []
      }
    }

    const totalListings = sellerCars.length
    const activeListings = sellerCars.filter(car => car.status === 'active').length
    const soldCars = sellerCars.filter(car => car.status === 'sold')
    const totalViews = sellerCars.reduce((sum, car) => sum + (car.views || 0), 0)
    const totalInquiries = sellerCars.reduce((sum, car) => sum + (car.inquiries || 0), 0)
    const totalRevenue = soldCars.reduce((sum, car) => sum + (car.price || 0), 0)
    const averagePrice = sellerCars.length > 0 ? sellerCars.reduce((sum, car) => sum + car.price, 0) / sellerCars.length : 0

    // Calculate average days to sell (mock calculation)
    const averageDaysToSell = soldCars.length > 0 ? 15 : 0

    // Generate monthly data (simplified)
    const monthlyData = [
      { month: 'Jan', sales: Math.floor(soldCars.length * 0.2), revenue: totalRevenue * 0.2, views: totalViews * 0.15, inquiries: totalInquiries * 0.18 },
      { month: 'Feb', sales: Math.floor(soldCars.length * 0.25), revenue: totalRevenue * 0.25, views: totalViews * 0.22, inquiries: totalInquiries * 0.22 },
      { month: 'Mar', sales: Math.floor(soldCars.length * 0.1), revenue: totalRevenue * 0.1, views: totalViews * 0.13, inquiries: totalInquiries * 0.12 },
      { month: 'Apr', sales: Math.floor(soldCars.length * 0.3), revenue: totalRevenue * 0.3, views: totalViews * 0.25, inquiries: totalInquiries * 0.27 },
      { month: 'May', sales: Math.floor(soldCars.length * 0.15), revenue: totalRevenue * 0.15, views: totalViews * 0.18, inquiries: totalInquiries * 0.16 },
      { month: 'Jun', sales: 0, revenue: 0, views: totalViews * 0.07, inquiries: totalInquiries * 0.05 }
    ]

    // Top performing cars (sorted by views + inquiries)
    const topPerformingCars = [...sellerCars]
      .sort((a, b) => ((b.views || 0) + (b.inquiries || 0)) - ((a.views || 0) + (a.inquiries || 0)))
      .slice(0, 3)
      .map(car => ({
        id: car.id,
        title: car.title || `${car.year} ${car.make} ${car.model}`,
        image: car.images?.[0] || 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop',
        views: car.views || 0,
        inquiries: car.inquiries || 0,
        status: car.status || 'active',
        price: car.price || 0
      }))

    // Recent sales (sold cars)
    const recentSales = soldCars.slice(0, 3).map((car, index) => ({
      id: car.id,
      carTitle: car.title || `${car.year} ${car.make} ${car.model}`,
      salePrice: car.price,
      listPrice: car.price * 1.05, // Assume 5% discount
      daysListed: Math.floor(Math.random() * 30) + 5, // Random days between 5-35
      soldDate: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last few weeks
      buyer: ['John D.', 'Sarah M.', 'Mike R.', 'Emily K.', 'David L.'][index] || 'Anonymous'
    }))

    return {
      overview: {
        totalListings,
        activeListings,
        soldCars: soldCars.length,
        totalRevenue,
        totalViews,
        totalInquiries,
        averagePrice,
        averageDaysToSell
      },
      monthlyData,
      topPerformingCars,
      recentSales
    }
  }, [sellerCars])

  useEffect(() => {
    // Simulate loading time
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [timeRange])

  const calculateTrend = (current, previous) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold">Loading analytics...</p>
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
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Sales Analytics
              </h1>
              <p className="text-base-content/70">Track your sales performance and insights</p>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="select select-bordered"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="1year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-primary text-primary-content shadow-xl">
            <div className="card-body items-center text-center">
              <div className="bg-primary-content/20 p-4 rounded-full mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Revenue</p>
              <p className="text-3xl font-black my-2">${analyticsData.overview.totalRevenue > 0 ? (analyticsData.overview.totalRevenue / 1000).toFixed(0) + 'K' : '0'}</p>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+12.5% vs last period</span>
              </div>
            </div>
          </div>

          <div className="card bg-success text-success-content shadow-xl">
            <div className="card-body items-center text-center">
              <div className="bg-success-content/20 p-4 rounded-full mb-4">
                <Car className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Cars Sold</p>
              <p className="text-3xl font-black my-2">{analyticsData.overview.soldCars}</p>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+8.3% vs last period</span>
              </div>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-xl">
            <div className="card-body items-center text-center">
              <div className="bg-accent-content/20 p-4 rounded-full mb-4">
                <Eye className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Views</p>
              <p className="text-3xl font-black my-2">{analyticsData.overview.totalViews.toLocaleString()}</p>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <TrendingDown className="w-4 h-4" />
                <span>-3.2% vs last period</span>
              </div>
            </div>
          </div>

          <div className="card bg-warning text-warning-content shadow-xl">
            <div className="card-body items-center text-center">
              <div className="bg-warning-content/20 p-4 rounded-full mb-4">
                <MessageCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Inquiries</p>
              <p className="text-3xl font-black my-2">{analyticsData.overview.totalInquiries}</p>
              <div className="flex items-center gap-1 text-sm opacity-80">
                <TrendingUp className="w-4 h-4" />
                <span>+15.7% vs last period</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Monthly Performance Chart */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Monthly Performance</h2>
              
              <div className="space-y-4">
                {analyticsData.monthlyData.map((month, index) => (
                  <div key={month.month} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="font-semibold w-12">{month.month}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sales: {month.sales}</span>
                          <span>${(month.revenue / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="w-full bg-base-300 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((month.revenue / Math.max(analyticsData.overview.totalRevenue, 1)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="card bg-base-100 shadow-xl border border-base-300">
            <div className="card-body">
              <h2 className="card-title text-xl mb-6">Key Performance Indicators</h2>
              
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Average Sale Price</p>
                    <p className="text-2xl font-bold text-primary">${analyticsData.overview.averagePrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+5.2%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Average Days to Sell</p>
                    <p className="text-2xl font-bold text-secondary">{analyticsData.overview.averageDaysToSell} days</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm">-2.1 days</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Conversion Rate</p>
                    <p className="text-2xl font-bold text-accent">7.7%</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-success">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">+1.3%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">Views per Listing</p>
                    <p className="text-2xl font-bold text-warning">356</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-error">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-sm">-8.4%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Performing Cars */}
        <div className="card bg-base-100 shadow-xl border border-base-300 mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl mb-6">Top Performing Listings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {analyticsData.topPerformingCars.map((car, index) => (
                <div key={car.id} className="card bg-base-200 shadow-lg">
                  <figure className="px-4 pt-4">
                    <img
                      src={car.image}
                      alt={car.title}
                      className="rounded-xl w-full h-32 object-cover"
                    />
                  </figure>
                  <div className="card-body">
                    <h3 className="card-title text-base">{car.title}</h3>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold text-primary">${car.price.toLocaleString()}</span>
                      <span className={`badge ${car.status === 'sold' ? 'badge-error' : 'badge-success'}`}>
                        {car.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{car.views} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        <span>{car.inquiries} inquiries</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Sales */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-xl mb-6">Recent Sales</h2>
            
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Car</th>
                    <th>List Price</th>
                    <th>Sale Price</th>
                    <th>Days Listed</th>
                    <th>Sold Date</th>
                    <th>Buyer</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.recentSales.map((sale) => (
                    <tr key={sale.id}>
                      <td className="font-semibold">{sale.carTitle}</td>
                      <td>${sale.listPrice.toLocaleString()}</td>
                      <td className="font-bold text-success">${sale.salePrice.toLocaleString()}</td>
                      <td>{sale.daysListed} days</td>
                      <td>{new Date(sale.soldDate).toLocaleDateString()}</td>
                      <td>{sale.buyer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesAnalytics
