import { Injectable } from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
export class PayloadDto {
  serviceRequestId: string | null;
  userId: string;
  driverId: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class Utils {
  constructor(private readonly prisma: PrismaService) {}
  determinePrice({
    basePrice,
    discountRate,
    quantity,
    serviceFee,
    urgencyFee,
    distanceFee,
    distance,
    discountThreshold,
  }) {
    // Base calculation
    let totalPrice = basePrice * quantity;

    // Apply volume discount if threshold is met
    if (discountThreshold && discountRate && quantity > discountThreshold) {
      totalPrice = totalPrice * (1 - discountRate);
    }

    // Add service fee
    if (serviceFee) {
      totalPrice += serviceFee;
    }

    // Add distance fee if applicable
    if (distanceFee && distance) {
      totalPrice += distanceFee * distance;
    }

    // Add urgency fee if applicable
    if (urgencyFee) {
      totalPrice += urgencyFee;
    }

    return totalPrice;
  }
  async generateOrderSummary(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: true,
        user: true,
        deliveryLocation: true,
      },
    });

    if (!order) return { message: 'Order not found', status: 404 };

    const {
      user,
      items,
      deliveryLocation,
      orderNumber,
      totalAmount,
      currency,
      scheduledFor,
    } = order;

    const itemsList = items
      .map(
        (item) =>
          `${item.quantity}x ${item.name} - ${currency}${item.totalPrice}`,
      )
      .join(', ');

    const deliveryAddress = deliveryLocation
      ? `${deliveryLocation.address}, ${deliveryLocation.city}, ${deliveryLocation.state}`
      : 'Address not specified';

    const scheduledTime = scheduledFor
      ? `Scheduled for: ${scheduledFor.toLocaleString()}`
      : 'Immediate delivery';

    return {
      message: `
        🚛 Fuel Delivery Order #${orderNumber}
        
        Customer: ${user.firstName} ${user.lastName}
        Phone: ${user.phone || 'Not provided'}
        
        Items: ${itemsList}
        Total Amount: ${currency}${totalAmount}
        
        Delivery Address: ${deliveryAddress}
        ${scheduledTime}
        
        Status: ${order.status}
          `.trim(),
      status: 200,
    };
  }

  // ... existing code ...
  // ... existing code ...
  async generatePaymentSummary(payload: PayloadDto) {
    if (!payload) return { message: 'Payment not found', status: 404 };

    const {
      serviceRequestId,
      userId,
      driverId,
      amount,
      currency,
      status,
      paymentMethod,
      transactionId,
      createdAt,
      updatedAt,
    } = payload;

    // Fetch service request details
    let serviceDetails = 'Service details not found';
    if (serviceRequestId) {
      const serviceRequest = await this.prisma.serviceRequest.findUnique({
        where: { id: serviceRequestId },
        include: { pickupLocation: true },
        // Add 'include' here if you want to fetch related data
      });
      if (serviceRequest) {
        serviceDetails = `
        Service Type: Order for ${serviceRequest.fuelType || 'N/A'}
        Fuel quantity: ${serviceRequest.fuelAmount || 'N/A'}
        Fuel Price: ${serviceRequest.totalPrice || 'N/A'}
        Location : ${serviceRequest.pickupLocation.address || 'N/A'}
        Scheduled For: ${serviceRequest.scheduledFor ? new Date(serviceRequest.scheduledFor).toLocaleString() : 'N/A'}
        Status: ${serviceRequest.status || 'N/A'}
              `.trim();
      }
    }

    return {
      message: `
        💳 Payment Summary

        Service Request ID: ${serviceRequestId || 'N/A'}
        User ID: ${userId || 'N/A'}
        Driver ID: ${driverId || 'N/A'}

        Amount: ${currency || ''}${amount}
        Status: ${status}
        Payment Method: ${paymentMethod || 'N/A'}
        Transaction ID: ${transactionId || 'N/A'}

        Created At: ${createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
        Updated At: ${updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}

        ${serviceDetails}
          `.trim(),
      status: 200,
    };
  }
}
