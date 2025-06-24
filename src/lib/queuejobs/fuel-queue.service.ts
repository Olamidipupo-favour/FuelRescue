import { Order } from '@prisma/client';
import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Dispatch } from '../dispatch';
import { Utils } from '../utils';

@Processor('fuel-orders')
export class FuelOrderProcessor extends WorkerHost {
  constructor(
    private readonly notify: Dispatch,
    private readonly utils: Utils,
  ) {
    super();
  }
  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }

  async process(job: Job<{ order: Order }>) {
    switch (job.name) {
      case 'delivery': {
        const data = job.data.order;
        const { id } = data;
        //Assign driver
        const driverId = '';
        //Generate message
        const response = await this.utils.generateOrderSummary(id);
        // Process the job here
        try {
          await this.notify.notifyDriver(data, driverId, response.message);
        } catch (error) {
          console.error(`Failed to notify driver: ${error}`);
        }

        try {
          await this.notify.notifyCustomer(data, response.message);
        } catch (error) {
          console.error('Failed to notify customer:', error);
        }
      }
    }

    // Add your processing logic
  }
}
