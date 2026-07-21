'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ObjectsAPI } from '@/services/api'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft } from 'lucide-react'

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
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  useEffect(() => {
    fetchObject()
  }, [id])

  const fetchObject = async () => {
    try {
      const data = await ObjectsAPI.getOne(id)
      setObject(data)
    } catch (error) {
      console.error('Error fetching object:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 max-w-2xl">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!object) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Object not found</p>
        <Button onClick={() => router.push('/')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
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
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{object.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <img
            src={object.imageUrl}
            alt={object.title}
            className="w-full h-64 object-cover rounded-lg"
          />
          <p className="text-gray-600">{object.description}</p>
          <p className="text-sm text-gray-400">
            Created: {new Date(object.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}