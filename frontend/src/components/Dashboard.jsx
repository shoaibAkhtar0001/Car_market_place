import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Car Marketplace Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info">
          <h2>Welcome, {user?.name}!</h2>
          <div className="user-details">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
            <p><strong>User ID:</strong> {user?.id}</p>
          </div>
        </div>
        
        <div className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {user?.role === 'seller' && (
              <button className="action-btn">List a Car</button>
            )}
            {user?.role === 'buyer' && (
              <button className="action-btn">Browse Cars</button>
            )}
            {user?.role === 'admin' && (
              <button className="action-btn">Admin Panel</button>
            )}
            <button className="action-btn">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
