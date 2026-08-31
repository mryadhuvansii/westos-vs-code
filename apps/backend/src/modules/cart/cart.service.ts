import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
  ) {}

  async getOrCreateCart(userId: string | undefined, sessionId: string | undefined): Promise<Cart> {
    let cart: Cart | null = null;

    if (userId) {
      cart = await this.cartRepository.findOne({
        where: { userId, deletedAt: null },
        relations: ['items', 'items.variant', 'items.variant.size', 'items.variant.color', 'items.variant.product', 'items.variant.product.brand', 'items.variant.product.category'],
      });
    }

    if (!cart && sessionId) {
      cart = await this.cartRepository.findOne({
        where: { sessionId, deletedAt: null },
        relations: ['items', 'items.variant', 'items.variant.size', 'items.variant.color', 'items.variant.product', 'items.variant.product.brand', 'items.variant.product.category'],
      });
    }

    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        sessionId,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
      await this.cartRepository.save(cart);
    }

    if (userId && cart.sessionId && !cart.userId) {
      cart.userId = userId;
      cart.sessionId = null;
      await this.cartRepository.save(cart);
    }

    return cart;
  }

  async getCart(userId: string | undefined, sessionId: string | undefined): Promise<Cart | null> {
    if (userId) {
      return this.cartRepository.findOne({
        where: { userId, deletedAt: null },
        relations: ['items', 'items.variant', 'items.variant.size', 'items.variant.color', 'items.variant.product', 'items.variant.product.brand', 'items.variant.product.category'],
      });
    }
    if (sessionId) {
      return this.cartRepository.findOne({
        where: { sessionId, deletedAt: null },
        relations: ['items', 'items.variant', 'items.variant.size', 'items.variant.color', 'items.variant.product', 'items.variant.product.brand', 'items.variant.product.category'],
      });
    }
    return null;
  }

  async addToCart(userId: string | undefined, sessionId: string | undefined, variantId: string, quantity: number = 1): Promise<Cart> {
    const variant = await this.variantRepository.findOne({
      where: { id: variantId, deletedAt: null },
      relations: ['product'],
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (variant.stockQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const cart = await this.getOrCreateCart(userId, sessionId);

    let cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, variantId },
    });

    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        variantId,
        quantity,
      });
    }

    await this.cartItemRepository.save(cartItem);

    return this.getOrCreateCart(userId, sessionId);
  }

  async updateQuantity(userId: string | undefined, sessionId: string | undefined, variantId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId, sessionId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, variantId },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not in cart');
    }

    const variant = await this.variantRepository.findOne({
      where: { id: variantId, deletedAt: null },
    });

    if (!variant) {
      throw new NotFoundException('Product variant not found');
    }

    if (quantity <= 0) {
      await this.cartItemRepository.remove(cartItem);
    } else {
      if (variant.stockQuantity < quantity) {
        throw new BadRequestException('Insufficient stock');
      }
      cartItem.quantity = quantity;
      await this.cartItemRepository.save(cartItem);
    }

    return this.getOrCreateCart(userId, sessionId);
  }

  async removeFromCart(userId: string | undefined, sessionId: string | undefined, variantId: string): Promise<Cart> {
    const cart = await this.getCart(userId, sessionId);
    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { cartId: cart.id, variantId },
    });

    if (!cartItem) {
      throw new NotFoundException('Item not in cart');
    }

    await this.cartItemRepository.remove(cartItem);

    return this.getOrCreateCart(userId, sessionId);
  }

  async clearCart(userId: string | undefined, sessionId: string | undefined): Promise<void> {
    const cart = await this.getCart(userId, sessionId);
    if (cart) {
      await this.cartItemRepository.delete({ cartId: cart.id });
    }
  }

  async getCartSummary(userId: string | undefined, sessionId: string | undefined): Promise<{
    itemCount: number;
    subtotal: number;
    items: Array<{
      id: string;
      variantId: string;
      quantity: number;
      name: string;
      sku: string;
      price: number;
      image?: string;
      size?: string;
      color?: string;
      stock: number;
    }>;
  }> {
    const cart = await this.getCart(userId, sessionId);
    
    if (!cart || !cart.items || cart.items.length === 0) {
      return { itemCount: 0, subtotal: 0, items: [] };
    }

    const items = cart.items.map(item => ({
      id: item.id,
      variantId: item.variantId,
      quantity: item.quantity,
      name: item.variant?.product?.name || 'Unknown Product',
      sku: item.variant?.sku || '',
      price: Number(item.variant?.prices?.[0]?.amount || 0),
      image: item.variant?.product?.media?.[0]?.url,
      size: item.variant?.size?.label,
      color: item.variant?.color?.name,
      stock: item.variant?.stockQuantity || 0,
    }));

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return { itemCount, subtotal, items };
  }
}