'use client'

import React, { createContext, useContext, useMemo } from 'react'
import io, { Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useMemo(() => {
    const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '')
    const baseUrl = normalizedApiUrl.endsWith('/api')
      ? normalizedApiUrl.slice(0, -4)
      : normalizedApiUrl

    return io(baseUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 3,
    })
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
