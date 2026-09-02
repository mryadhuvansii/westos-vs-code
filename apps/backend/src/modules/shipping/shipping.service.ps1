import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import { Carrier } from './entities/carrier.entity';
import { ShipmentItem } from './entities/shipment-item.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { PackingSlip } from './entities/packing-slip.entity';
import { Manifest } from './entities/manifest.entity';
import { DeliveryException } from './entities/delivery-exception.entity';
import { ShippingMethod } from './entities/shipping-method.entity';

@Injectable()
export class ShippingService {
  constructor(
    @InjectRepository(Shipment)
    private shipmentRepository: Repository<Shipment>,
    @InjectRepository(Carrier)
    private carrierRepository: Repository<Carrier>,
    @InjectRepository(ShipmentItem)
    private shipmentItemRepository: Repository<ShipmentItem>,
    @InjectRepository(TrackingEvent)
    private trackingEventRepository: Repository<TrackingEvent>,
    @InjectRepository(PackingSlip)
    private packingSlipRepository: Repository<PackingSlip>,
    @InjectRepository(Manifest)
    private manifestRepository: Repository<Manifest>,
    @InjectRepository(DeliveryException)
    private deliveryExceptionRepository: Repository<DeliveryException>,
    @InjectRepository(ShippingMethod)
    private shippingMethodRepository: Repository<ShippingMethod>,
  ) {}

  async createShipment(data: {
    orderId: string;
    carrierId?: string;
    shippingAddress: Record<string, any>;
    shippingCost?: string;
    weight?: string;
    dimensions?: Record<string, any>;
  }): Promise<Shipment> {
    const shipmentNumber = 'SHIP-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    const shipment = this.shipmentRepository.create({
      ...data,
      shipmentNumber,
      status: ShipmentStatus.PENDING,
      shippingCost: data.shippingCost || '0',
      weight: data.weight || '0',
    });

    return this.shipmentRepository.save(shipment);
  }

  async getShipment(shipmentId: string): Promise<Shipment> {
    const shipment = await this.shipmentRepository.findOne({
      where: { id: shipmentId },
      relations: ['items', 'trackingEvents', 'carrier', 'order']
    });

    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    return shipment;
  }

  async getShipmentsByOrder(orderId: string): Promise<Shipment[]> {
    return this.shipmentRepository.find({
      where: { orderId },
      relations: ['items', 'trackingEvents', 'carrier'],
      order: { createdAt: 'DESC' }
    });
  }

  async updateShipmentStatus(
    shipmentId: string,
    status: ShipmentStatus,
    trackingNumber?: string,
    trackingUrl?: string,
  ): Promise<Shipment> {
    const shipment = await this.getShipment(shipmentId);
    
    shipment.status = status;
    if (trackingNumber) shipment.trackingNumber = trackingNumber;
    if (trackingUrl) shipment.trackingUrl = trackingUrl;
    
    const now = new Date();
    switch (status) {
      case ShipmentStatus.PICKED:
        shipment.pickedAt = now;
        break;
      case ShipmentStatus.PACKED:
        shipment.packedAt = now;
        break;
      case ShipmentStatus.LABELED:
        shipment.labeledAt = now;
        break;
      case ShipmentStatus.HANDOVER:
        shipment.handedOverAt = now;
        break;
      case ShipmentStatus.DELIVERED:
        shipment.deliveredAt = now;
        break;
    }

    return this.shipmentRepository.save(shipment);
  }

  async addTrackingEvent(data: {
    shipmentId: string;
    status: ShipmentStatus;
    location?: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<TrackingEvent> {
    await this.getShipment(data.shipmentId);
    
    const event = this.trackingEventRepository.create({
      ...data,
      timestamp: new Date(),
    });

    return this.trackingEventRepository.save(event);
  }

  async getTrackingEvents(shipmentId: string): Promise<TrackingEvent[]> {
    return this.trackingEventRepository.find({
      where: { shipmentId },
      order: { timestamp: 'ASC' }
    });
  }

  async createCarrier(data: {
    name: string;
    code: string;
    trackingUrlTemplate?: string;
    isActive?: boolean;
  }): Promise<Carrier> {
    const carrier = this.carrierRepository.create({
      ...data,
      isActive: data.isActive ?? true,
    });
    return this.carrierRepository.save(carrier);
  }

  async getCarriers(): Promise<Carrier[]> {
    return this.carrierRepository.find({ where: { isActive: true } });
  }

  async createShippingMethod(data: {
    name: string;
    code: string;
    carrierId: string;
    price: string;
    estimatedDaysMin: number;
    estimatedDaysMax: number;
    isActive?: boolean;
  }): Promise<ShippingMethod> {
    const method = this.shippingMethodRepository.create({
      ...data,
      isActive: data.isActive ?? true,
    });
    return this.shippingMethodRepository.save(method);
  }

  async getShippingMethods(carrierId?: string): Promise<ShippingMethod[]> {
    return this.shippingMethodRepository.find({
      where: carrierId ? { carrierId, isActive: true } : { isActive: true },
      relations: ['carrier']
    });
  }

  async createPackingSlip(data: {
    shipmentId: string;
    slipNumber: string;
    content: Record<string, any>;
  }): Promise<PackingSlip> {
    await this.getShipment(data.shipmentId);
    const slip = this.packingSlipRepository.create(data);
    return this.packingSlipRepository.save(slip);
  }

  async createManifest(data: {
    carrierId: string;
    manifestNumber: string;
    shipmentIds: string[];
  }): Promise<Manifest> {
    const manifest = this.manifestRepository.create({
      ...data,
      generatedAt: new Date(),
    });
    return this.manifestRepository.save(manifest);
  }

  async createDeliveryException(data: {
    shipmentId: string;
    exceptionType: string;
    description: string;
    metadata?: Record<string, any>;
  }): Promise<DeliveryException> {
    await this.getShipment(data.shipmentId);
    const exception = this.deliveryExceptionRepository.create({
      ...data,
      occurredAt: new Date(),
    });
    return this.deliveryExceptionRepository.save(exception);
  }
}
