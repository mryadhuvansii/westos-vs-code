import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShippingService } from './shipping.service';
import { ShippingController } from './shipping.controller';
import { Shipment } from './entities/shipment.entity';
import { Carrier } from './entities/carrier.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { PackingSlip } from './entities/packing-slip.entity';
import { Manifest } from './entities/manifest.entity';
import { DeliveryException } from './entities/delivery-exception.entity';
import { ShippingMethod } from './entities/shipping-method.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Shipment,
      Carrier,
      ShipmentItem,
      TrackingEvent,
      PackingSlip,
      Manifest,
      DeliveryException,
      ShippingMethod,
    ]),
  ],
  controllers: [ShippingController],
  providers: [ShippingService],
  exports: [ShippingService],
})
export class ShippingModule {}
