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
    let socketInstance: Socket | null = null;

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

        console.log('🔌 Connecting to Socket.IO at:', baseUrl);
        console.log('📱 Platform:', Platform.OS);

        // Create socket with better options
        socketInstance = io(baseUrl, {
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          timeout: 20000,
          forceNew: true,
          path: '/socket.io/',
          withCredentials: false,
          autoConnect: true,
          upgrade: true,
          rememberUpgrade: true,
        });

        // Connection events
        socketInstance.on('connect', () => {
          console.log('✅ Socket connected successfully!');
          console.log('📡 Socket ID:', socketInstance?.id);
          console.log('🔌 Transport:', socketInstance?.io.engine.transport.name);
          setIsConnected(true);
          reconnectAttempts.current = 0;
        });

        socketInstance.on('connect_error', (error) => {
          reconnectAttempts.current++;
          console.error(`❌ Socket connection error (attempt ${reconnectAttempts.current}):`, error.message);
          
          if (reconnectAttempts.current <= maxReconnectAttempts) {
            console.log(`🔄 Retrying connection... (${reconnectAttempts.current}/${maxReconnectAttempts})`);
          } else {
            console.warn('⚠️ Max reconnection attempts reached.');
            setIsConnected(false);
          }
        });

        socketInstance.on('disconnect', (reason) => {
          console.log('🔴 Socket disconnected:', reason);
          setIsConnected(false);
          
          if (reason === 'io server disconnect') {
            // Server disconnected us, try to reconnect
            console.log('🔄 Attempting to reconnect...');
            socketInstance?.connect();
          }
        });

        socketInstance.on('reconnect', (attemptNumber) => {
          console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
          setIsConnected(true);
        });

        socketInstance.on('reconnect_error', (error) => {
          console.error('❌ Reconnection error:', error.message);
        });

        socketInstance.on('reconnect_failed', () => {
          console.error('❌ Reconnection failed after all attempts');
        });

        socketInstance.on('error', (error) => {
          console.error('❌ Socket error:', error);
        });

        // Handle acknowledgment
        socketInstance.on('connection_ack', (data) => {
          console.log('📨 Connection acknowledgment:', data);
        });

        // Handle pong
        socketInstance.on('pong', (data) => {
          console.log('🏓 Pong received:', data);
        });

        // Log transport changes
        socketInstance.io.engine.on('upgrade', () => {
          console.log('🔌 Transport upgraded to:', socketInstance?.io.engine.transport.name);
        });

        // Store socket
        socketRef.current = socketInstance;
        
        if (isMounted) {
          setSocket(socketInstance);
        }

        // Connect if not already connected
        if (!socketInstance.connected) {
          console.log('🔌 Initiating connection...');
          socketInstance.connect();
        }

        return socketInstance;
      } catch (error) {
        console.error('❌ Failed to create socket:', error);
        return null;
      }
    };

    // Wait a moment before connecting
    const timer = setTimeout(() => {
      connectSocket();
    }, 1000);

    // Cleanup
    return () => {
      clearTimeout(timer);
      isMounted = false;
      if (socketRef.current) {
        console.log('🧹 Cleaning up socket');
        socketRef.current.disconnect();
        socketRef.current.close();
        socketRef.current = null;
      }
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance.close();
      }
    };
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