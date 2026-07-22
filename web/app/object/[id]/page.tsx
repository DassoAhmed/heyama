'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectsAPI } from '@/services/api'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

interface Object {
  id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

export default function ObjectDetailPage() {
  const [object, setObject] = useState<Object | null>(null)
  const [loading, setLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    fetchObject()
  }, [id])

  const fetchObject = async () => {
    try {
      console.log('📥 Fetching object:', id)
      const data = await ObjectsAPI.getOne(id)
      console.log('✅ Object fetched:', data.title)
      console.log('📷 Image URL:', data.imageUrl)
      setObject(data)
    } catch (error) {
      console.error('❌ Error fetching object:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageError = () => {
    console.error('❌ Failed to load image:', object?.imageUrl)
    setImageError(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <div className="h-8 w-3/4 bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-64 w-full bg-gray-200 animate-pulse rounded mb-4"></div>
          <div className="h-4 w-full bg-gray-200 animate-pulse rounded mb-2"></div>
          <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  if (!object) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Object not found</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          ← Back to List
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-4"
      >
        ← Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{object.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!imageError ? (
            <img
              src={object.imageUrl}
              alt={object.title}
              className="w-full h-64 object-cover rounded-lg"
              onError={handleImageError}
            />
          ) : (
            <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-lg">
              <span className="text-gray-500">Image not available</span>
            </div>
          )}
          <p className="text-gray-600">{object.description}</p>
          <p className="text-sm text-gray-400">
            Created: {new Date(object.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}