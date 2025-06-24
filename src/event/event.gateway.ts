import {
  MessageBody,
  ConnectedSocket,
  WebSocketGateway,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { LocationDto } from './dto/location.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { error } from 'console';

@WebSocketGateway({
  transports: ['websocket'],
  connectTimeout: 10000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
})
export class EventGateway {
  constructor(private readonly eventService: EventService) {}


  @SubscribeMessage('current-route')
  emit(
    @MessageBody() location: LocationDto,
    @ConnectedSocket() driver: Socket,
  ) {
    return this.eventService.emitRoute(location, driver);
  }

  @SubscribeMessage('findOneEvent')
  findOne(@MessageBody() id: number) {
    return this.eventService.findOne(id);
  }

  @SubscribeMessage('updateEvent')
  update(@MessageBody() updateEventDto: UpdateEventDto) {
    if (!updateEventDto.id) throw error('ID is required');
    return this.eventService.update(updateEventDto.id, updateEventDto);
  }

  @SubscribeMessage('removeEvent')
  remove(@MessageBody() id: number) {
    return this.eventService.remove(id);
  }
}
