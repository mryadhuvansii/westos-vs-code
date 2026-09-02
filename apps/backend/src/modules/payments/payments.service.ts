import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Refund, RefundStatus } from './entities/refund.entity';
import { PaymentWebhook } from './entities/payment-webhook.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(PaymentWebhook)
    private webhookRepository: Repository<PaymentWebhook>,
  ) {}

  async createPayment(data: {
    orderId: string;
    method: PaymentMethod;
    amount: string;
    currency?: string;
    gatewayOrderId?: string;
    gatewayResponse?: Record<string, any>;
  }): Promise<Payment> {
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const payment = this.paymentRepository.create({
      ...data,
      paymentNumber,
      currency: data.currency || 'INR',
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['refunds', 'webhooks'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getPaymentByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { orderId },
      relations: ['refunds'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus,
    gatewayTransactionId?: string,
    gatewayResponse?: Record<string, any>,
    failureReason?: string,
  ): Promise<Payment> {
    const payment = await this.getPayment(paymentId);
    
    payment.status = status;
    if (gatewayTransactionId) payment.gatewayTransactionId = gatewayTransactionId;
    if (gatewayResponse) payment.gatewayResponse = gatewayResponse;
    if (failureReason) payment.failureReason = failureReason;
    
    if (status === PaymentStatus.COMPLETED) {
      payment.completedAt = new Date();
    } else if (status === PaymentStatus.FAILED) {
      payment.failedAt = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  async createRefund(data: {
    paymentId: string;
    orderId: string;
    amount: string;
    reason?: string;
  }): Promise<Refund> {
    const payment = await this.getPayment(data.paymentId);
    
    const refundNumber = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const refund = this.refundRepository.create({
      ...data,
      refundNumber,
      status: RefundStatus.PENDING,
    });

    return this.refundRepository.save(refund);
  }

  async getRefunds(paymentId: string): Promise<Refund[]> {
    return this.refundRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateRefundStatus(
    refundId: string,
    status: RefundStatus,
    gatewayRefundId?: string,
    gatewayResponse?: Record<string, any>,
  ): Promise<Refund> {
    const refund = await this.refundRepository.findOneBy({ id: refundId });
    
    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    refund.status = status;
    if (gatewayRefundId) refund.gatewayRefundId = gatewayRefundId;
    if (gatewayResponse) refund.gatewayResponse = gatewayResponse;
    
    if (status === RefundStatus.COMPLETED) {
      refund.completedAt = new Date();
    }

    return this.refundRepository.save(refund);
  }

  async handleWebhook(data: {
    paymentId?: string;
    eventType: string;
    payload: Record<string, any>;
    signature?: string;
  }): Promise<PaymentWebhook> {
    const webhook = this.webhookRepository.create({
      paymentId: data.paymentId,
      eventId: data.eventType + '-' + Date.now(),
      eventType: data.eventType,
      status: 'received' as any,
      payload: data.payload,
    });

    return this.webhookRepository.save(webhook);
  }

  async getWebhooks(paymentId: string): Promise<PaymentWebhook[]> {
    return this.webhookRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }
}