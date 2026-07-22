'use client'

import { useState, useEffect } from 'react'
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
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const router = useRouter()

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

  // ... rest of the component (same as before)
}