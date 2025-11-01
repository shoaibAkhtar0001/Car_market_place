import { useAuth } from '../context/AuthContext'
import { Users, CheckCircle, BarChart3, Settings, Shield, AlertTriangle, DollarSign, Car, UserPlus, TrendingUp } from 'lucide-react'

const AdminDashboard = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  const quickActions = [
    { title: 'User Management', icon: Users, description: 'Manage users and permissions', color: 'bg-primary' },
    { title: 'Approve Listings', icon: CheckCircle, description: 'Review and approve car listings', color: 'bg-success' },
    { title: 'View Reports', icon: BarChart3, description: 'Analytics and reports', color: 'bg-accent' },
    { title: 'System Settings', icon: Settings, description: 'Configure system settings', color: 'bg-warning' }
  ]

  const carImages = {
    'Tesla Model 3': 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop&crop=center',
    'Ford F-150': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=400&h=300&fit=crop&crop=center',
    'Audi A4': 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      {/* Header */}
      <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
        <div className="navbar-start">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-base-content/70">Welcome back, {user?.name}!</p>
            </div>
          </div>
        </div>
        <div className="navbar-end">
          <button onClick={handleLogout} className="btn btn-outline btn-primary">
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card bg-primary text-primary-content shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="bg-primary-content/20 p-4 rounded-full mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Users</p>
              <p className="text-4xl font-black my-2">2,847</p>
              <p className="text-sm opacity-80">Registered</p>
            </div>
          </div>

          <div className="card bg-accent text-accent-content shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="bg-accent-content/20 p-4 rounded-full mb-4">
                <Car className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Active Listings</p>
              <p className="text-4xl font-black my-2">1,247</p>
              <p className="text-sm opacity-80">Live now</p>
            </div>
          </div>

          <div className="card bg-warning text-warning-content shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="bg-warning-content/20 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Pending Approvals</p>
              <p className="text-4xl font-black my-2">23</p>
              <p className="text-sm opacity-80">Awaiting review</p>
            </div>
          </div>

          <div className="card bg-success text-success-content shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="card-body items-center text-center">
              <div className="bg-success-content/20 p-4 rounded-full mb-4">
                <DollarSign className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-90">Total Revenue</p>
              <p className="text-4xl font-black my-2">$1.2M</p>
              <p className="text-sm opacity-80">Platform fees</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <div
                  key={action.title}
                  className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105 border border-base-300"
                >
                  <div className="card-body items-center text-center">
                    <div className={`${action.color} text-white p-4 rounded-full mb-4`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="card-title text-lg">{action.title}</h3>
                    <p className="text-base-content/70 text-center">{action.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Pending Approvals
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow-xl border border-base-300">
              <figure className="px-4 pt-4">
                <img
                  src={carImages['Tesla Model 3']}
                  alt="Tesla Model 3"
                  className="rounded-xl w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">2023 Tesla Model 3</h3>
                <p className="text-sm text-base-content/70">Listed by: John Smith</p>
                <p className="text-2xl font-bold text-primary">$42,000</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-success btn-sm">Approve</button>
                  <button className="btn btn-error btn-sm">Reject</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <figure className="px-4 pt-4">
                <img
                  src={carImages['Ford F-150']}
                  alt="Ford F-150"
                  className="rounded-xl w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">2022 Ford F-150</h3>
                <p className="text-sm text-base-content/70">Listed by: Sarah Johnson</p>
                <p className="text-2xl font-bold text-primary">$38,500</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-success btn-sm">Approve</button>
                  <button className="btn btn-error btn-sm">Reject</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl border border-base-300">
              <figure className="px-4 pt-4">
                <img
                  src={carImages['Audi A4']}
                  alt="Audi A4"
                  className="rounded-xl w-full h-48 object-cover"
                />
              </figure>
              <div className="card-body">
                <h3 className="card-title">2021 Audi A4</h3>
                <p className="text-sm text-base-content/70">Listed by: Mike Davis</p>
                <p className="text-2xl font-bold text-primary">$34,900</p>
                <div className="card-actions justify-end mt-4">
                  <button className="btn btn-success btn-sm">Approve</button>
                  <button className="btn btn-error btn-sm">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card bg-base-100 shadow-xl border border-base-300">
          <div className="card-body">
            <h2 className="card-title text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
              Recent User Activity
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <span>New user registration: Alex Wilson</span>
                </div>
                <span className="text-sm text-base-content/70">30 minutes ago</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-accent" />
                  <span>New listing submitted: 2023 Honda Civic</span>
                </div>
                <span className="text-sm text-base-content/70">1 hour ago</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span>Transaction completed: $28,500</span>
                </div>
                <span className="text-sm text-base-content/70">2 hours ago</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-base-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  <span>Report submitted for listing #1247</span>
                </div>
                <span className="text-sm text-base-content/70">3 hours ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
