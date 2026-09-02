import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { Payment, PaymentMethod, PaymentStatus } from './entities/payment.entity';
import { Refund, RefundStatus } from './entities/refund.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new payment' })
  @ApiResponse({ status: 201, description: 'Payment created', type: Payment })
  async createPayment(
    @Req() req: any,
    @Body() dto: {
      orderId: string;
      method: PaymentMethod;
      amount: string;
      currency?: string;
      gatewayOrderId?: string;
      gatewayResponse?: Record<string, any>;
    },
  ) {
    return this.paymentsService.createPayment(dto);
  }

  @Get(':paymentId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment details' })
  @ApiResponse({ status: 200, description: 'Payment retrieved', type: Payment })
  async getPayment(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPayment(paymentId);
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payments for an order' })
  @ApiResponse({ status: 200, description: 'Payments retrieved', type: [Payment] })
  async getPaymentsByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Patch(':paymentId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update payment status' })
  @ApiResponse({ status: 200, description: 'Payment status updated', type: Payment })
  async updatePaymentStatus(
    @Param('paymentId') paymentId: string,
    @Body() dto: {
      status: PaymentStatus;
      gatewayTransactionId?: string;
      gatewayResponse?: Record<string, any>;
      failureReason?: string;
    },
  ) {
    return this.paymentsService.updatePaymentStatus(
      paymentId,
      dto.status,
      dto.gatewayTransactionId,
      dto.gatewayResponse,
      dto.failureReason,
    );
  }

  @Post(':paymentId/refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a refund' })
  @ApiResponse({ status: 201, description: 'Refund created', type: Refund })
  async createRefund(
    @Param('paymentId') paymentId: string,
    @Body() dto: {
      orderId: string;
      amount: string;
      reason?: string;
    },
  ) {
    return this.paymentsService.createRefund({ ...dto, paymentId });
  }

  @Get(':paymentId/refunds')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get refunds for a payment' })
  @ApiResponse({ status: 200, description: 'Refunds retrieved', type: [Refund] })
  async getRefunds(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getRefunds(paymentId);
  }

  @Patch('refunds/:refundId/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update refund status' })
  @ApiResponse({ status: 200, description: 'Refund status updated', type: Refund })
  async updateRefundStatus(
    @Param('refundId') refundId: string,
    @Body() dto: {
      status: RefundStatus;
      gatewayRefundId?: string;
      gatewayResponse?: Record<string, any>;
    },
  ) {
    return this.paymentsService.updateRefundStatus(
      refundId,
      dto.status,
      dto.gatewayRefundId,
      dto.gatewayResponse,
    );
  }

  @Post('webhooks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle payment webhook' })
  @ApiResponse({ status: 200, description: 'Webhook processed' })
  async handleWebhook(
    @Body() dto: {
      paymentId?: string;
      eventType: string;
      payload: Record<string, any>;
      signature?: string;
    },
  ) {
    return this.paymentsService.handleWebhook(dto);
  }
}