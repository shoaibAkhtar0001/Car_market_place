// Diagnostic tools for debugging bought/sold cars issues

export const diagnoseBoughtCars = () => {
  console.log('\n========== BOUGHT CARS DIAGNOSTIC ==========\n')
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  const boughtCars = JSON.parse(localStorage.getItem('carMarketplace_boughtCars') || '[]')
  
  console.log('📋 Current User Info:')
  console.log('  - ID (local):', currentUser?.id)
  console.log('  - _ID (MongoDB):', currentUser?._id)
  console.log('  - Email:', currentUser?.email)
  console.log('  - Role:', currentUser?.role)
  
  console.log('\n📦 Bought Cars Storage:', boughtCars.length, 'total')
  
  if (boughtCars.length > 0) {
    console.log('\n📊 Bought Cars Analysis:')
    boughtCars.forEach((car, idx) => {
      console.log(`\n  Car #${idx + 1}: ${car.carTitle}`)
      console.log('    - buyerId:', car.buyerId)
      console.log('    - buyerOfferId:', car.buyerOfferId)
      console.log('    - buyerEmail:', car.buyerEmail)
      console.log('    - Matches current user:', 
        car.buyerId === currentUser?.id ||
        car.buyerId === currentUser?._id ||
        car.buyerOfferId === currentUser?.id ||
        car.buyerOfferId === currentUser?._id ||
        car.buyerEmail === currentUser?.email
      )
    })
  }
  
  console.log('\n============================================\n')
  
  return {
    user: currentUser,
    boughtCars,
    totalBought: boughtCars.length,
    matchingBought: boughtCars.filter(car =>
      car.buyerId === currentUser?.id ||
      car.buyerId === currentUser?._id ||
      car.buyerOfferId === currentUser?.id ||
      car.buyerOfferId === currentUser?._id ||
      car.buyerEmail === currentUser?.email
    ).length
  }
}

export const diagnoseSoldCars = () => {
  console.log('\n========== SOLD CARS DIAGNOSTIC ==========\n')
  
  const currentUser = JSON.parse(localStorage.getItem('currentUser'))
  const allCars = JSON.parse(localStorage.getItem('carMarketplace_cars') || '[]')
  const soldCars = allCars.filter(car => car.status === 'sold')
  
  console.log('📋 Current User Info:')
  console.log('  - ID (local):', currentUser?.id)
  console.log('  - _ID (MongoDB):', currentUser?._id)
  console.log('  - Email:', currentUser?.email)
  console.log('  - Role:', currentUser?.role)
  
  console.log('\n📦 All Cars:', allCars.length, 'total')
  console.log('📦 Sold Cars:', soldCars.length, 'total')
  
  if (soldCars.length > 0) {
    console.log('\n📊 Sold Cars Analysis:')
    soldCars.forEach((car, idx) => {
      console.log(`\n  Car #${idx + 1}: ${car.title || car.carTitle}`)
      console.log('    - sellerId:', car.sellerId)
      console.log('    - seller.id:', car.seller?.id)
      console.log('    - seller._id:', car.seller?._id)
      console.log('    - buyerId:', car.buyerId)
      console.log('    - soldTo:', car.soldTo)
      console.log('    - soldPrice:', car.soldPrice)
      console.log('    - soldDate:', car.soldDate)
      console.log('    - Matches current seller:', 
        car.sellerId === currentUser?.id ||
        car.sellerId === currentUser?._id ||
        car.seller?.id === currentUser?.id ||
        car.seller?._id === currentUser?._id
      )
    })
  }
  
  console.log('\n==========================================\n')
  
  return {
    user: currentUser,
    totalCars: allCars.length,
    soldCars,
    totalSold: soldCars.length,
    matchingSold: soldCars.filter(car =>
      car.sellerId === currentUser?.id ||
      car.sellerId === currentUser?._id ||
      car.seller?.id === currentUser?.id ||
      car.seller?._id === currentUser?._id
    ).length
  }
}

export const diagnoseAll = () => {
  const bought = diagnoseBoughtCars()
  const sold = diagnoseSoldCars()
  
  console.log('\n========== SUMMARY ==========')
  console.log('Bought Cars Matching User:', bought.matchingBought, '/', bought.totalBought)
  console.log('Sold Cars Matching User:', sold.matchingSold, '/', sold.totalSold)
  console.log('=============================\n')
  
  return { bought, sold }
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  window.diagnoseBoughtCars = diagnoseBoughtCars
  window.diagnoseSoldCars = diagnoseSoldCars
  window.diagnoseAll = diagnoseAll
}
