'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
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

export default function ObjectDetailClient({ id }: { id: string }) {
  const [object, setObject] = useState<Object | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true

    const fetchObject = async () => {
      try {
        console.log('📥 Fetching object:', id)
        setErrorMessage(null)
        const data = await ObjectsAPI.getOne(id)

        if (!isMounted) return

        console.log('✅ Object fetched:', data.title)
        console.log('📷 Image URL:', data.imageUrl)
        setImageError(false)
        setImageLoading(true)
        setObject(data)
      } catch (error) {
        if (!isMounted) return

        console.error('❌ Error fetching object:', error)

        if (axios.isAxiosError(error)) {
          const status = error.response?.status
          if (status === 400) {
            setErrorMessage('Invalid object id')
          } else if (status === 404) {
            setErrorMessage('Object not found')
          } else {
            setErrorMessage('Failed to fetch object. Please try again.')
          }
        } else {
          setErrorMessage('Failed to fetch object. Please try again.')
        }

        setObject(null)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchObject()

    return () => {
      isMounted = false
    }
  }, [id])

  const getSafeImageUrl = (url?: string) => {
    if (!url) return ''
    return /^https?:\/\//i.test(url) ? url : ''
  }

  const handleImageError = () => {
    console.error('❌ Failed to load image:', object?.imageUrl)
    setImageError(true)
    setImageLoading(false)
  }

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully')
    setImageLoading(false)
  }

  const getFallbackImage = () => {
    const title = object?.title || 'Image'
    return `https://via.placeholder.com/800x600/cccccc/666666?text=${encodeURIComponent(title)}`
  }

  const imageSrc = getSafeImageUrl(object?.imageUrl) || getFallbackImage()

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
        <p>{errorMessage || 'Object not found'}</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          ← Back to List
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button variant="ghost" onClick={() => router.push('/')} className="mb-4">
        ← Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{object.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100">
            {imageLoading && !imageError && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-pulse flex space-x-4">
                  <div className="h-12 w-12 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            )}

            {!imageError ? (
              <img
                src={imageSrc}
                alt={object.title}
                className={`w-full h-64 object-cover transition-opacity duration-300 ${
                  imageLoading ? 'opacity-0' : 'opacity-100'
                }`}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            ) : (
              <div className="w-full h-64 flex flex-col items-center justify-center bg-gray-100">
                <span className="text-gray-500 mb-2">Image not available</span>
                <img
                  src={getFallbackImage()}
                  alt={object.title}
                  className="w-full h-64 object-cover opacity-50"
                />
              </div>
            )}
          </div>

          <p className="text-gray-600">{object.description}</p>
          <p className="text-sm text-gray-400">
            Created: {new Date(object.createdAt).toLocaleDateString()}
          </p>

          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-500 overflow-hidden">
              <p>Debug - Image URL:</p>
              <p className="truncate">{object.imageUrl}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
