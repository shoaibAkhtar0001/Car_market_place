const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api' 
  : '/api'

export const api = {
  async request(method, path, body, auth = false) {
    const headers = { 'Content-Type': 'application/json' }
    if (auth) {
      const token = localStorage.getItem('token')
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    })
    
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      const msg = data?.message || `Request failed with ${res.status}`
      throw new Error(msg)
    }
    return data
  },
  
  get(path, auth = false) {
    return this.request('GET', path, undefined, auth)
  },
  
  post(path, body, auth = false) {
    return this.request('POST', path, body, auth)
  },
  
  delete(path, auth = false) {
    return this.request('DELETE', path, undefined, auth)
  },
  
  put(path, body, auth = false) {
    return this.request('PUT', path, body, auth)
  }
}

// Cars API
export const carsAPI = {
  async getCars(params = {}) {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        queryParams.append(key, value)
      }
    })
    const query = queryParams.toString()
    return api.get(`/cars${query ? `?${query}` : ''}`)
  },
  
  async getCar(id) {
    return api.get(`/cars/${id}`)
  },
  
  async searchCars(searchQuery, filters = {}) {
    const params = {
      search: searchQuery,
      ...filters,
      limit: 20
    }
    return this.getCars(params)
  }
}

// Wishlist API
export const wishlistAPI = {
  async getWishlist() {
    return api.get('/wishlist', true)
  },
  
  async addToWishlist(carId, notes = '') {
    return api.post('/wishlist', { carId, notes }, true)
  },
  
  async removeFromWishlist(carId) {
    return api.delete(`/wishlist/${carId}`, true)
  },
  
  async isInWishlist(carId) {
    return api.get(`/wishlist/check/${carId}`, true)
  },
  
  async updateWishlistItem(carId, updates) {
    return api.put(`/wishlist/${carId}`, updates, true)
  }
}
