import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ShippingService } from './shipping.service';
import { Shipment, ShipmentStatus } from './entities/shipment.entity';
import { Carrier } from './entities/carrier.entity';
import { ShippingMethod } from './entities/shipping-method.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { PackingSlip } from './entities/packing-slip.entity';
import { Manifest } from './entities/manifest.entity';
import { DeliveryException } from './entities/delivery-exception.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Shipping')
@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post('shipments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new shipment' })
  @ApiResponse({ status: 201, description: 'Shipment created', type: Shipment })
  async createShipment(
    @Req() req: any,
    @Body() dto: {
      orderId: string;
      carrierId?: string;
      shippingAddress: Record<string, any>;
      shippingCost?: string;
      weight?: string;
      dimensions?: Record<string, any>;
    },
  ) {
    return this.shippingService.createShipment(dto);
  }

  @Get('shipments/:shipmentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipment details' })
  @ApiResponse({ status: 200, description: 'Shipment retrieved', type: Shipment })
  async getShipment(@Param('shipmentId') shipmentId: string) {
    return this.shippingService.getShipment(shipmentId);
  }

  @Get('orders/:orderId/shipments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipments for an order' })
  @ApiResponse({ status: 200, description: 'Shipments retrieved', type: [Shipment] })
  async getShipmentsByOrder(@Param('orderId') orderId: string) {
    return this.shippingService.getShipmentsByOrder(orderId);
  }

  @Patch('shipments/:shipmentId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update shipment status' })
  @ApiResponse({ status: 200, description: 'Shipment status updated', type: Shipment })
  async updateShipmentStatus(
    @Param('shipmentId') shipmentId: string,
    @Body() dto: {
      status: ShipmentStatus;
      trackingNumber?: string;
      trackingUrl?: string;
    },
  ) {
    return this.shippingService.updateShipmentStatus(
      shipmentId,
      dto.status,
      dto.trackingNumber,
      dto.trackingUrl,
    );
  }

  @Post('shipments/:shipmentId/tracking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add tracking event' })
  @ApiResponse({ status: 201, description: 'Tracking event added', type: TrackingEvent })
  async addTrackingEvent(
    @Param('shipmentId') shipmentId: string,
    @Body() dto: {
      status: ShipmentStatus;
      location?: string;
      description?: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.shippingService.addTrackingEvent({ ...dto, shipmentId });
  }

  @Get('shipments/:shipmentId/tracking')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get tracking events' })
  @ApiResponse({ status: 200, description: 'Tracking events retrieved', type: [TrackingEvent] })
  async getTrackingEvents(@Param('shipmentId') shipmentId: string) {
    return this.shippingService.getTrackingEvents(shipmentId);
  }

  @Post('carriers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create carrier' })
  @ApiResponse({ status: 201, description: 'Carrier created', type: Carrier })
  async createCarrier(
    @Body() dto: {
      name: string;
      code: string;
      trackingUrlTemplate?: string;
      isActive?: boolean;
    },
  ) {
    return this.shippingService.createCarrier(dto);
  }

  @Get('carriers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get carriers' })
  @ApiResponse({ status: 200, description: 'Carriers retrieved', type: [Carrier] })
  async getCarriers() {
    return this.shippingService.getCarriers();
  }

  @Post('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create shipping method' })
  @ApiResponse({ status: 201, description: 'Shipping method created', type: ShippingMethod })
  async createShippingMethod(
    @Body() dto: {
      name: string;
      code: string;
      carrierId: string;
      price: string;
      estimatedDaysMin: number;
      estimatedDaysMax: number;
      isActive?: boolean;
    },
  ) {
    return this.shippingService.createShippingMethod(dto);
  }

  @Get('methods')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get shipping methods' })
  @ApiResponse({ status: 200, description: 'Shipping methods retrieved', type: [ShippingMethod] })
  async getShippingMethods(@Query('carrierId') carrierId?: string) {
    return this.shippingService.getShippingMethods(carrierId);
  }

  @Post('packing-slips')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create packing slip' })
  @ApiResponse({ status: 201, description: 'Packing slip created', type: PackingSlip })
  async createPackingSlip(
    @Body() dto: {
      shipmentId: string;
      slipNumber: string;
      content: Record<string, any>;
    },
  ) {
    return this.shippingService.createPackingSlip(dto);
  }

  @Post('manifests')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create manifest' })
  @ApiResponse({ status: 201, description: 'Manifest created', type: Manifest })
  async createManifest(
    @Body() dto: {
      carrierId: string;
      manifestNumber: string;
      shipmentIds: string[];
    },
  ) {
    return this.shippingService.createManifest(dto);
  }

  @Post('exceptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create delivery exception' })
  @ApiResponse({ status: 201, description: 'Delivery exception created', type: DeliveryException })
  async createDeliveryException(
    @Body() dto: {
      shipmentId: string;
      exceptionType: string;
      description: string;
      metadata?: Record<string, any>;
    },
  ) {
    return this.shippingService.createDeliveryException(dto);
  }
}
