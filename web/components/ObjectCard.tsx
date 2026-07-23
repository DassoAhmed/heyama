'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { useState } from 'react'

interface Object {
  id: string
  title: string
  description: string
  imageUrl: string
  createdAt: string
}

interface ObjectCardProps {
  object: Object
  onDelete: (id: string) => void
}

export function ObjectCard({ object, onDelete }: ObjectCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <Card className="hover:shadow-lg transition-shadow overflow-hidden">
      <CardHeader className="p-0">
        <div className="relative w-full pt-[56.25%] bg-gray-100">
          {!imageError ? (
            <img
              src={object.imageUrl || 'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image'}
              alt={object.title}
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <span className="text-gray-400 text-sm">No image</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-base sm:text-lg mb-2 line-clamp-1">{object.title}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{object.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between">
        <Link href={`/object/${object.id}`} className="w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            View Details
          </Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(object.id)}
          className="w-full sm:w-auto"
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  )
}