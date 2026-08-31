import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from './entities/inventory.entity';
import { PurchaseOrder } from './entities/purchase-order.entity';
import { StockReservation } from './entities/stock-reservation.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(PurchaseOrder)
    private purchaseOrderRepository: Repository<PurchaseOrder>,
    @InjectRepository(StockReservation)
    private stockReservationRepository: Repository<StockReservation>,
  ) {}

  async getInventory(variantId: string, warehouseId?: string): Promise<Inventory[]> {
    const query = this.inventoryRepository.createQueryBuilder('inv')
      .where('inv.variantId = :variantId', { variantId });
    
    if (warehouseId) {
      query.andWhere('inv.warehouseId = :warehouseId', { warehouseId });
    }

    return query.getMany();
  }

  async updateStock(variantId: string, quantity: number, warehouseId: string): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { variantId, warehouseId },
    });

    if (!inventory) {
      inventory = this.inventoryRepository.create({
        variantId,
        warehouseId,
        quantity,
        availableQuantity: quantity,
      });
    } else {
      inventory.quantity += quantity;
      inventory.availableQuantity = inventory.quantity - inventory.reservedQuantity;
    }

    return this.inventoryRepository.save(inventory);
  }

  async reserveStock(variantId: string, quantity: number, cartId?: string, orderId?: string): Promise<StockReservation> {
    const reservation = this.stockReservationRepository.create({
      variantId,
      quantity,
      cartId,
      orderId,
      status: 'reserved',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });

    return this.stockReservationRepository.save(reservation);
  }

  async releaseReservation(reservationId: string): Promise<void> {
    await this.stockReservationRepository.update(reservationId, { status: 'released' });
  }

  async createPurchaseOrder(poNumber: string, vendorId: string, items: any[], totalAmount: number): Promise<PurchaseOrder> {
    const po = this.purchaseOrderRepository.create({
      poNumber,
      vendorId,
      items,
      totalAmount,
      status: 'draft',
    });

    return this.purchaseOrderRepository.save(po);
  }

  async getPurchaseOrders(status?: string): Promise<PurchaseOrder[]> {
    const query = this.purchaseOrderRepository.createQueryBuilder('po');
    
    if (status) {
      query.where('po.status = :status', { status });
    }

    return query.getMany();
  }

  async updatePurchaseOrderStatus(poId: string, status: string): Promise<PurchaseOrder> {
    const po = await this.purchaseOrderRepository.findOneBy({ id: poId });
    
    if (!po) {
      throw new NotFoundException('Purchase order not found');
    }

    po.status = status;
    return this.purchaseOrderRepository.save(po);
  }
}
