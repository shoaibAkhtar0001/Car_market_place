const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'primary',
  className = '' 
}) => {
  const colorClasses = {
    primary: 'bg-primary text-primary-content',
    secondary: 'bg-secondary text-secondary-content',
    accent: 'bg-accent text-accent-content',
    success: 'bg-success text-success-content',
    warning: 'bg-warning text-warning-content',
    error: 'bg-error text-error-content'
  }

  return (
    <div className={`card ${colorClasses[color]} shadow-xl hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="card-body items-center text-center">
        {Icon && (
          <div className="bg-base-content/20 p-4 rounded-full mb-4">
            <Icon className="w-8 h-8" />
          </div>
        )}
        <p className="text-sm font-semibold uppercase tracking-wider opacity-90">
          {title}
        </p>
        <p className="text-4xl font-black my-2">{value}</p>
        {subtitle && (
          <p className="text-sm opacity-80">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

export default StatsCard
