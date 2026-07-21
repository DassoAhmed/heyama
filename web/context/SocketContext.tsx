'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import io, { Socket } from 'socket.io-client'

const SocketContext = createContext<Socket | null>(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'
    const baseUrl = API_URL.replace('/api', '')
    
    const newSocket = io(baseUrl, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 3,
    })
    
    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}