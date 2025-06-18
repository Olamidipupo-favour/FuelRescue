import { BullModule } from '@nestjs/bullmq';
import { Order } from '@prisma/client';
export async function queueJob({ jobName, order }:{jobName: string, order: Order}) {
  BullModule.registerQueue({
    name: jobName
  })
}
