import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';
import { API_URL } from '@env';
import { Platform } from 'react-native';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  useEffect(() => {
    let isMounted = true;

    const connectSocket = () => {
      try {
        // Get the base URL
        const apiUrl = API_URL || 'http://localhost:3000/api';
        let baseUrl = apiUrl.replace('/api', '');
        
        // Platform-specific URL handling
        if (Platform.OS === 'web') {
          baseUrl = 'http://localhost:3000';
        } else if (Platform.OS === 'android' && baseUrl.includes('localhost')) {
          baseUrl = baseUrl.replace('localhost', '10.0.2.2');
        }

        console.log('🔌 Attempting Socket.IO connection to:', baseUrl);
        console.log('📱 Platform:', Platform.OS);

        // Create socket with minimal options for compatibility
        const newSocket = io(baseUrl, {
          transports: ['polling', 'websocket'], // Allow both
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 10000,
          forceNew: true,
          path: '/socket.io',
          withCredentials: false,
          autoConnect: true,
          // Let Socket.IO handle upgrade automatically
          upgrade: true,
          rememberUpgrade: true,
        });

        // Connection events
        newSocket.on('connect', () => {
          console.log('✅ Socket connected successfully!');
          console.log('📡 Socket ID:', newSocket.id);
          console.log('🔌 Transport:', newSocket.io.engine.transport.name);
          setIsConnected(true);
          reconnectAttempts.current = 0;
        });

        newSocket.on('connect_error', (error) => {
          reconnectAttempts.current++;
          console.error(`❌ Socket connection error (attempt ${reconnectAttempts.current}):`, error.message);
          
          if (reconnectAttempts.current <= maxReconnectAttempts) {
            console.log(`🔄 Retrying connection... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          } else {
            console.warn('⚠️ Max reconnection attempts reached.');
            setIsConnected(false);
          }
        });

        newSocket.on('disconnect', (reason) => {
          console.log('🔴 Socket disconnected:', reason);
          setIsConnected(false);
        });

        newSocket.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
        });

        newSocket.on('reconnect_error', (error) => {
          console.error('❌ Reconnection error:', error.message);
        });

        newSocket.on('reconnect_failed', () => {
          console.error('❌ Reconnection failed');
        });

        // Handle acknowledgment
        newSocket.on('connection_ack', (data) => {
          console.log('📨 Connection acknowledgment:', data);
        });

        // Handle pong
        newSocket.on('pong', (data) => {
          console.log('🏓 Pong received:', data);
        });

        // Log transport changes
        newSocket.io.engine.on('upgrade', () => {
          console.log('🔌 Transport upgraded to:', newSocket.io.engine.transport.name);
        });

        // Store socket
        socketRef.current = newSocket;
        
        if (isMounted) {
          setSocket(newSocket);
        }

        // Connect if not already connected
        if (!newSocket.connected) {
          newSocket.connect();
        }

        return newSocket;
      } catch (error) {
        console.error('❌ Failed to create socket:', error);
        return null;
      }
    };

    // Wait before connecting
    const timer = setTimeout(() => {
      const newSocket = connectSocket();
      
      return () => {
        isMounted = false;
        if (socketRef.current) {
          console.log('🧹 Cleaning up socket');
          socketRef.current.disconnect();
          socketRef.current.close();
          socketRef.current = null;
        }
        if (newSocket) {
          newSocket.disconnect();
          newSocket.close();
        }
      };
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Log connection status
  useEffect(() => {
    console.log(`📊 Socket status: ${isConnected ? 'Connected' : 'Disconnected'}`);
  }, [isConnected]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};