import axios from 'axios'

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
const API_URL = rawApiUrl.replace(/\/+$/, '')

console.log('🌐 Web API_URL:', API_URL)

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
})

// Add request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log('📤 Making request to:', config.url)
    console.log('📤 Method:', config.method)
    
    if (config.data instanceof FormData) {
      console.log('📤 FormData being sent')
      // @ts-ignore
      if (config.data._parts) {
        // @ts-ignore
        for (let pair of config.data._parts) {
          const value = pair[1]
          if (value && typeof value === 'object') {
            console.log('  -', pair[0], ':', value.name || value.uri || value)
          } else {
            console.log('  -', pair[0], ':', value)
          }
        }
      }
    }
    return config
  },
  (error) => {
    console.error('❌ Request error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    console.log('✅ Response received:', response.status)
    return response
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status)
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2))
    }
    if (error.code === 'ECONNABORTED') {
      console.error('⚠️ Request timeout - check if server is running')
    }
    if (!error.response) {
      console.error('⚠️ Network error - check if API URL is correct:', API_URL)
      console.error('   Make sure the API server is running on the correct port')
    }
    return Promise.reject(error)
  }
)

export const ObjectsAPI = {
  create: async (formData: FormData) => {
    console.log('🔄 Creating object...')
    
    // Log FormData contents for debugging
    console.log('📤 FormData entries:')
    // @ts-ignore
    if (formData._parts) {
      // @ts-ignore
      for (let pair of formData._parts) {
        console.log('  -', pair[0], ':', pair[1]?.name || pair[1]?.uri || pair[1])
      }
    }
    
    try {
      const response = await api.post('/objects', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        timeout: 60000, // Increase timeout for uploads
      })
      
      console.log('✅ Object created successfully:', response.data)
      return response.data
    } catch (error: any) {
      console.error('❌ Error in create API call:', error)
      
      // Re-throw with more context
      if (error.response) {
        throw new Error(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`)
      } else if (error.request) {
        throw new Error('Network error - Could not reach the server. Make sure the API is running.')
      } else {
        throw error
      }
    }
  },

  list: async () => {
    console.log('🔄 Fetching objects...')
    try {
      const response = await api.get('/objects')
      console.log('✅ Objects fetched:', response.data?.length || 0)
      console.log('📦 First object:', response.data?.[0]?.title || 'No objects')
      return response.data || []
    } catch (error) {
      console.error('❌ Error in list API call:', error)
      throw error
    }
  },

  getOne: async (id: string) => {
    console.log('🔄 Fetching object:', id)
    try {
      const response = await api.get(`/objects/${id}`)
      console.log('✅ Object fetched:', response.data.title)
      return response.data
    } catch (error) {
      console.error('❌ Error in getOne API call:', error)
      throw error
    }
  },

  delete: async (id: string) => {
    console.log('🔄 Deleting object:', id)
    try {
      const response = await api.delete(`/objects/${id}`)
      console.log('✅ Object deleted:', id)
      return response.data
    } catch (error) {
      console.error('❌ Error in delete API call:', error)
      throw error
    }
  },
}

export default api