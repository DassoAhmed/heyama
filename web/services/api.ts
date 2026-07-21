import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
})

export const ObjectsAPI = {
  create: async (formData: FormData) => {
    const response = await api.post('/objects', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  list: async () => {
    const response = await api.get('/objects')
    return response.data
  },

  getOne: async (id: string) => {
    const response = await api.get(`/objects/${id}`)
    return response.data
  },

  delete: async (id: string) => {
    const response = await api.delete(`/objects/${id}`)
    return response.data
  },
}

export default api