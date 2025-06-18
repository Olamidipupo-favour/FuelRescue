export function determinePrice({
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
