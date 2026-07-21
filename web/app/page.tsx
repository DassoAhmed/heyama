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
  const router = useRouter()
  const socket = useSocket()

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
      const data = await ObjectsAPI.list()
      setObjects(data)
    } catch (error) {
      console.error('Error fetching objects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await ObjectsAPI.delete(id)
      setObjects(prev => prev.filter(obj => obj.id !== id))
    } catch (error) {
      console.error('Error deleting object:', error)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Objects</h1>
          <div className="h-10 w-32 bg-gray-200 animate-pulse rounded"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="h-48 w-full bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 animate-pulse rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Objects</h1>
        <Button onClick={() => router.push('/create')}>
          <span className="mr-2 text-lg">+</span> Create Object
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objects.map((object) => (
          <ObjectCard
            key={object.id}
            object={object}
            onDelete={handleDelete}
          />
        ))}
        {objects.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500">
            No objects found. Create your first object!
          </div>
        )}
      </div>
    </main>
  )
}