import { PrismaService } from 'src/prisma/prisma.service';
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

    if (!order) return 'Order not found';

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

    return `
  🚛 Fuel Delivery Order #${orderNumber}
  
  Customer: ${user.firstName} ${user.lastName}
  Phone: ${user.phone || 'Not provided'}
  
  Items: ${itemsList}
  Total Amount: ${currency}${totalAmount}
  
  Delivery Address: ${deliveryAddress}
  ${scheduledTime}
  
  Status: ${order.status}
    `.trim();
  }
}
