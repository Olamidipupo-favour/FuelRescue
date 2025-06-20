import { Order } from '@prisma/client';
import axios from 'axios';

import { PrismaService } from 'src/prisma/prisma.service';
export class Dispatch {
  constructor(private readonly prisma: PrismaService) {}

  async notifyDriver(data: Order, driverId: string, message: string) {
    // Fetch the driver user
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!driver || !driver.user) return;
    const { id, email, phone } = driver.user;
    const payload = {
      id,
      email,
      phone,
      type: 'SERVICE_REQUEST',
      title: 'You have a new delivery assignment',
      message: message,
      storeInDatabase: true,
      sendEmail: true,
      sendSMS: true,
      sendPush: true,
    };
    await axios.post('http://localhost:3000/notifications', payload, {
      withCredentials: true,
    });
  }

  async notifyCustomer(data: Order, message: string) {
    const { userId } = data;
    const customer = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        phone: true,
      },
    });
    if (!customer) return;
    const { email, phone, id } = customer;
    const payload = {
      id,
      email,
      phone,
      type: 'SERVICE_REQUEST',
      title: 'Your order has been placed',
      message: message,
      storeInDatabase: true,
      sendEmail: true,
      sendSMS: true,
      sendPush: true,
    };
    await axios.post('http://localhost:3000/notifications', payload, {
      withCredentials: true,
    });
  }

  async triggerTracking(){
    
  }
}
