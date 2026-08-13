import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private server: Server | null = null;

  init(server: Server) {
    this.server = server;
  }

  emitTo(room: string, event: string, payload: unknown) {
    this.server?.to(room).emit(event, payload);
  }

  emitAll(event: string, payload: unknown) {
    this.server?.emit(event, payload);
  }
}
