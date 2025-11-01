import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import BuyerDashboard from './components/BuyerDashboard'
import BuyerInquiries from './components/BuyerInquiries'
import BuyerBookings from './components/BuyerBookings'
import BoughtCars from './components/BoughtCars'
import SellerDashboard from './components/SellerDashboard'
import SoldCars from './components/SoldCars'
import AdminDashboard from './components/AdminDashboard'
import CarDetails from './components/CarDetails'
import BookingRequest from './components/BookingRequest'
import AddCarListing from './components/AddCarListing'
import ManageListings from './components/ManageListings'
import ViewInquiries from './components/ViewInquiries'
import SalesAnalytics from './components/SalesAnalytics'
import SellerBookings from './components/SellerBookings'
import LandingPage from './components/LandingPage'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CarProvider } from './context/CarContext'
import { WishlistProvider } from './context/WishlistContext'
import { InquiryProvider } from './context/InquiryContext'
import { Toaster } from 'react-hot-toast'
import { BookingProvider } from './context/BookingContext'
import './App.css'
import './utils/diagnosticTools' // Load diagnostic tools globally

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-lg font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Loading your dashboard...
          </p>
        </div>
      </div>
    )
  }

  const getRoleDashboard = () => {
    if (!user) return null
    
    switch (user.role) {
      case 'buyer':
        return <BuyerDashboard />
      case 'seller':
        return <SellerDashboard />
      case 'admin':
        return <AdminDashboard />
      default:
        return <Dashboard />
    }
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/dashboard" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/dashboard" /> : <Register />} 
      />
      <Route 
        path="/dashboard" 
        element={user ? getRoleDashboard() : <Navigate to="/login" />} 
      />
      <Route 
        path="/car/:id" 
        element={user ? <CarDetails /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/book/:id" 
        element={user ? <BookingRequest /> : <Navigate to="/login" />} 
      />
      {/* Seller Routes */}
      <Route 
        path="/seller/add-listing" 
        element={user && user.role === 'seller' ? <AddCarListing /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/seller/manage-listings" 
        element={user && user.role === 'seller' ? <ManageListings /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/seller/inquiries" 
        element={user && user.role === 'seller' ? <ViewInquiries /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/seller/bookings" 
        element={user && user.role === 'seller' ? <SellerBookings /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/seller/analytics" 
        element={user && user.role === 'seller' ? <SalesAnalytics /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/seller/sold-cars" 
        element={user && user.role === 'seller' ? <SoldCars /> : <Navigate to="/login" />} 
      />
      {/* Buyer Routes */}
      <Route 
        path="/buyer/inquiries" 
        element={user && user.role === 'buyer' ? <BuyerInquiries /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/buyer/bookings" 
        element={user && user.role === 'buyer' ? <BuyerBookings /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/buyer/purchased" 
        element={user && user.role === 'buyer' ? <BoughtCars /> : <Navigate to="/login" />} 
      />
      {/* Direct role-based routes */}
      <Route 
        path="/seller" 
        element={user && user.role === 'seller' ? <SellerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/buyer" 
        element={user && user.role === 'buyer' ? <BuyerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/"
        element={<LandingPage />}
      />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <CarProvider>
        <WishlistProvider>
          <InquiryProvider>
            <BookingProvider>
              <Router>
                <div className="app min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
                  <AppRoutes />
                  <Toaster 
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: '#363636',
                        color: '#fff',
                      },
                      success: {
                        duration: 3000,
                        iconTheme: {
                          primary: '#4ade80',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        duration: 4000,
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </BookingProvider>
          </InquiryProvider>
        </WishlistProvider>
      </CarProvider>
    </AuthProvider>
  )
}

export default App
