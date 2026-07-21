'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'

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
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <img
          src={object.imageUrl}
          alt={object.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      </CardHeader>
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2">{object.title}</CardTitle>
        <p className="text-sm text-gray-600 line-clamp-2">{object.description}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between">
        <Link href={`/object/${object.id}`}>
          <Button variant="outline" size="sm">View Details</Button>
        </Link>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(object.id)}
        >
          <span className="text-lg">🗑</span>
        </Button>
      </CardFooter>
    </Card>
  )
}