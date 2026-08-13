import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Server, Socket } from 'socket.io';
import { Repository } from 'typeorm';
import { Ticket } from '../entities';
import { RealtimeService } from './realtime.service';

@WebSocketGateway({
  cors: { origin: ['http://127.0.0.1:5173', 'http://localhost:5173'], credentials: true },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly realtime: RealtimeService,
    @InjectRepository(Ticket) private readonly ticketRepo: Repository<Ticket>,
  ) {}

  afterInit(server: Server) {
    this.realtime.init(server);
  }

  handleConnection(client: Socket) {
    try {
      const user = this.jwt.verify(client.handshake.auth?.token);
      client.data.user = user;
      if (user.role !== 'customer') client.join('staff-room');
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // 无需额外处理
  }

  @SubscribeMessage('joinTicket')
  async joinTicket(@ConnectedSocket() client: Socket, @MessageBody() ticketId: number) {
    const user = client.data.user;
    if (!user) return;
    const ticket = await this.ticketRepo.findOne({ where: { id: ticketId } });
    if (!ticket) return;
    if (user.role === 'customer' && ticket.customerId !== user.sub) return;
    if (user.role === 'staff' && ticket.staffId !== user.sub) return;
    client.join(`ticket:${ticketId}`);
    client.data.ticketId = ticketId;
  }

  @SubscribeMessage('leaveTicket')
  leaveTicket(@ConnectedSocket() client: Socket) {
    if (client.data.ticketId) client.leave(`ticket:${client.data.ticketId}`);
    client.data.ticketId = null;
  }
}
