import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { LocationDto } from './dto/location.dto';

@Injectable()
export class EventService {


  emitRoute(location:LocationDto, socket: Socket) {
    return socket.emit('track-route', location)
  }

  findOne(id: number) {
    return `This action returns a #${id} event`;
  }

  update(id: string, updateEventDto: UpdateEventDto) {
    return `This action updates a #${id} event`;
  }

  remove(id: number) {
    return `This action removes a #${id} event`;
  }
}
