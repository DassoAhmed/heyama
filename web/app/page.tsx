'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSocket } from '@/context/SocketContext'
import { ObjectsAPI } from '@/services/api'
import { ObjectCard } from '@/components/ObjectCard'
import { Button } from '@/components/ui/Button'

interface Object {
  id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

export default function Home() {
  const [objects, setObjects] = useState<Object[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()
  const socket = useSocket()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    fetchObjects()

    if (socket) {
      socket.on('objectCreated', (newObject: Object) => {
        setObjects(prev => [newObject, ...prev])
      })

      socket.on('objectDeleted', (id: string) => {
        setObjects(prev => prev.filter(obj => obj.id !== id))
      })
    }

    return () => {
      if (socket) {
        socket.off('objectCreated')
        socket.off('objectDeleted')
      }
    }
  }, [socket])

  const fetchObjects = async () => {
    try {
      console.log('📥 Fetching objects...')
      const data = await ObjectsAPI.list()
      console.log('✅ Objects fetched:', data)
      setObjects(data || [])
      setError(null)
    } catch (error: any) {
      console.error('❌ Error fetching objects:', error)
      setError('Failed to load objects. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchObjects()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Objects</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
              <div className="h-48 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRetry} className="w-full sm:w-auto">
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Objects</h1>
        <Button 
          onClick={() => router.push('/create')}
          className="w-full sm:w-auto"
        >
          <span className="mr-2 text-lg">+</span> Create Object
        </Button>
      </div>
      
      {objects.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg mb-4">No objects found</p>
          <Button onClick={() => router.push('/create')}>
            Create your first object
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {objects.map((object) => (
            <ObjectCard
              key={object.id}
              object={object}
              onDelete={async (id: string) => {
                try {
                  await ObjectsAPI.delete(id)
                  setObjects(prev => prev.filter(obj => obj.id !== id))
                } catch (error) {
                  console.error('Error deleting object:', error)
                }
              }}
            />
          ))}
        </div>
      )}
    </main>
  )
}