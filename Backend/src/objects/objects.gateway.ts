import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ObjectResponseDto } from './dto/object-response.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  namespace: '/', // Default namespace
})
export class ObjectsGateway {
  @WebSocketServer()
  server: Server;

  notifyObjectCreated(object: ObjectResponseDto) {
    this.server.emit('objectCreated', object);
  }

  notifyObjectDeleted(id: string) {
    this.server.emit('objectDeleted', id);
  }
}