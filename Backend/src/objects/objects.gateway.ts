import { 
  WebSocketGateway, 
  WebSocketServer, 
  OnGatewayConnection, 
  OnGatewayDisconnect,
  OnGatewayInit 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { ObjectResponseDto } from './dto/object-response.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  transports: ['polling', 'websocket'],
  namespace: '/',
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  serveClient: true,
})
export class ObjectsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(ObjectsGateway.name);
  private clients: Map<string, Socket> = new Map();

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    this.logger.log('🔌 Socket.IO Server initialized');
    this.logger.log(`📡 WebSocket endpoint: ws://localhost:3000`);
    this.logger.log('✅ Gateway ready for connections');
    
    // Log when server is ready
    server.on('connection', (socket) => {
      this.logger.log(`📡 New connection: ${socket.id}`);
    });
  }

  handleConnection(client: Socket) {
    this.logger.log(`✅ Client connected: ${client.id}`);
    this.logger.log(`📱 Client address: ${client.handshake.address}`);
    this.logger.log(`🔌 Transport: ${client.conn.transport.name}`);
    
    this.clients.set(client.id, client);
    
    // Send connection acknowledgment
    client.emit('connection_ack', { 
      status: 'connected', 
      id: client.id,
      timestamp: new Date().toISOString(),
      message: 'Connected to Heyama Socket Server'
    });

    // Handle ping from client
    client.on('ping', (data) => {
      this.logger.log(`📥 Received ping from ${client.id}`);
      client.emit('pong', { 
        message: 'pong', 
        timestamp: new Date().toISOString(),
        data: data 
      });
    });

    // Handle custom events
    client.on('custom_event', (data) => {
      this.logger.log(`📥 Custom event from ${client.id}:`, data);
      client.emit('custom_response', { 
        status: 'received', 
        data: data,
        timestamp: new Date().toISOString()
      });
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`❌ Client disconnected: ${client.id}`);
    this.logger.log(`📊 Clients remaining: ${this.clients.size - 1}`);
    this.clients.delete(client.id);
  }

  notifyObjectCreated(object: ObjectResponseDto) {
    this.logger.log(`📤 Emitting objectCreated event for: ${object.title}`);
    
    if (this.clients.size > 0 && this.server) {
      this.server.emit('objectCreated', object);
      this.logger.log(`✅ objectCreated emitted to ${this.clients.size} clients`);
    } else {
      if (this.clients.size === 0) {
        this.logger.warn('⚠️ No clients connected to receive objectCreated event');
      }
      if (!this.server) {
        this.logger.warn('⚠️ Server not initialized');
      }
    }
  }

  notifyObjectDeleted(id: string) {
    this.logger.log(`📤 Emitting objectDeleted event for: ${id}`);
    
    if (this.clients.size > 0 && this.server) {
      this.server.emit('objectDeleted', id);
      this.logger.log(`✅ objectDeleted emitted to ${this.clients.size} clients`);
    } else {
      if (this.clients.size === 0) {
        this.logger.warn('⚠️ No clients connected to receive objectDeleted event');
      }
      if (!this.server) {
        this.logger.warn('⚠️ Server not initialized');
      }
    }
  }
}