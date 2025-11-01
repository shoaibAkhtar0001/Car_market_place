// Fallback version without Framer Motion - install framer-motion for enhanced animations
// import { motion } from 'framer-motion'

const RoleCard = ({ role, icon, title, description, isSelected, onClick }) => {
  return (
    <div
      className={`role-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <div className="role-card-content">
        <div className="role-icon">
          {icon}
        </div>
        <h3 className="role-title">{title}</h3>
        <p className="role-description">{description}</p>
        <div className={`selection-indicator ${isSelected ? 'active' : ''}`}>
          <div className="checkmark" style={{ opacity: isSelected ? 1 : 0 }}>
            ✓
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleCard
