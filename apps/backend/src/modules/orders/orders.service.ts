import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { CreditNote } from './entities/credit-note.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    @InjectRepository(CreditNote)
    private creditNoteRepository: Repository<CreditNote>,
  ) {}

  async getOrders(userId: string, page: number = 1, limit: number = 10): Promise<any> {
    const offset = (page - 1) * limit;
    return {
      data: [],
      total: 0,
      page,
      limit,
    };
  }

  async getOrder(orderId: string): Promise<any> {
    return { id: orderId };
  }

  async createOrder(userId: string, items: any[], totalAmount: number): Promise<any> {
    return {
      id: 'new-order-id',
      userId,
      items,
      totalAmount,
      status: 'pending',
    };
  }

  async updateOrderStatus(orderId: string, status: string): Promise<any> {
    return { id: orderId, status };
  }

  async createInvoice(orderId: string, totalAmount: number, items: any[]): Promise<Invoice> {
    const invoiceNumber = `INV-${Date.now()}`;
    
    const invoice = this.invoiceRepository.create({
      orderId,
      invoiceNumber,
      totalAmount,
      items,
      status: 'draft',
      issuedAt: new Date(),
    });

    return this.invoiceRepository.save(invoice);
  }

  async getInvoice(invoiceId: string): Promise<Invoice> {
    const invoice = await this.invoiceRepository.findOneBy({ id: invoiceId });
    
    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return invoice;
  }

  async createCreditNote(orderId: string, invoiceNumber: string, totalAmount: number, reason: string): Promise<CreditNote> {
    const creditNoteNumber = `CN-${Date.now()}`;
    
    const creditNote = this.creditNoteRepository.create({
      orderId,
      creditNoteNumber,
      invoiceNumber,
      totalAmount,
      reason,
      status: 'draft',
      issuedAt: new Date(),
    });

    return this.creditNoteRepository.save(creditNote);
  }

  async getCreditNotes(orderId: string): Promise<CreditNote[]> {
    return this.creditNoteRepository.find({
      where: { orderId },
      order: { createdAt: 'DESC' },
    });
  }
}
