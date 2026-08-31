import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UserProfile } from '../auth/entities/user-profile.entity';
import { UserConsents } from '../auth/entities/user-consents.entity';
import { Address } from './entities/address.entity';
import { CreateAddressDto, UpdateAddressDto, UpdateProfileDto, UpdatePreferencesDto, UpdateAddressDto as UpdateAddressDtoType } from '../customers/dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private profileRepository: Repository<UserProfile>,
    @InjectRepository(UserConsents)
    private consentsRepository: Repository<UserConsents>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'consents', 'addresses'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    Object.assign(profile, dto);
    await this.profileRepository.save(profile);

    if (dto.marketingConsent !== undefined) {
      const consents = await this.consentsRepository.findOne({ where: { userId } });
      if (consents) {
        consents.marketingEmail = dto.marketingConsent;
        await this.consentsRepository.save(consents);
      }
    }

    return this.getProfile(userId);
  }

  async getAddresses(userId: string) {
    return this.addressRepository.find({
      where: { userId, deletedAt: null },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    // If this is set as default, unset other default addresses
    if (dto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false },
      );
    }

    const address = this.addressRepository.create({
      ...dto,
      userId,
    });
    return this.addressRepository.save(address);
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.addressRepository.update(
        { userId, isDefault: true, id: Not(addressId) },
        { isDefault: false },
      );
    }

    Object.assign(address, dto);
    return this.addressRepository.save(address);
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId, deletedAt: null },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.addressRepository.softDelete(addressId);
    return { message: 'Address deleted successfully' };
  }

  async getPreferences(userId: string) {
    const consents = await this.consentsRepository.findOne({ where: { userId } });
    if (!consents) {
      throw new NotFoundException('Preferences not found');
    }
    return consents;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    const consents = await this.consentsRepository.findOne({ where: { userId } });
    if (!consents) {
      throw new NotFoundException('Preferences not found');
    }

    Object.assign(consents, dto);
    consents.version += 1;
    return this.consentsRepository.save(consents);
  }

  async getDevices(userId: string) {
    // Implementation would go here
    return [];
  }

  async removeDevice(userId: string, deviceId: string) {
    // Implementation would go here
    return { message: 'Device removed successfully' };
  }

  async getOrders(userId: string, params: { page?: number; limit?: number; status?: string }) {
    // Implementation would go here
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
  }

  async getOrder(userId: string, orderId: string) {
    // Implementation would go here
    throw new NotFoundException('Order not found');
  }

  async getWishlist(userId: string) {
    // Implementation would go here
    return [];
  }

  async addToWishlist(userId: string, variantId: string) {
    // Implementation would go here
    return { message: 'Added to wishlist' };
  }

  async removeFromWishlist(userId: string, variantId: string) {
    // Implementation would go here
    return { message: 'Removed from wishlist' };
  }

  async getReviews(userId: string) {
    // Implementation would go here
    return [];
  }

  async createReview(userId: string, dto: any) {
    // Implementation would go here
    return { message: 'Review created successfully' };
  }

  async getBuybackEligibility(userId: string) {
    // Implementation would go here
    return { eligible: false };
  }

  async initiateBuyback(userId: string, dto: any) {
    // Implementation would go here
    return { message: 'Buyback initiated' };
  }
}