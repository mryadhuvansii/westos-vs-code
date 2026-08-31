import { Injectable, NotFoundException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { ProductMedia } from './entities/product-media.entity';
import { ProductAttribute } from './entities/product-attribute.entity';
import { Category } from './entities/category.entity';
import { Brand } from './entities/brand.entity';
import { Collection } from './entities/collection.entity';
import { Fabric } from './entities/fabric.entity';
import { Fit } from './entities/fit.entity';
import { Size } from './entities/size.entity';
import { Color } from './entities/color.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantRepository: Repository<ProductVariant>,
    @InjectRepository(ProductMedia)
    private mediaRepository: Repository<ProductMedia>,
    @InjectRepository(ProductAttribute)
    private attributeRepository: Repository<ProductAttribute>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Brand)
    private brandRepository: Repository<Brand>,
    @InjectRepository(Collection)
    private collectionRepository: Repository<Collection>,
    @InjectRepository(Fabric)
    private fabricRepository: Repository<Fabric>,
    @InjectRepository(Fit)
    private fitRepository: Repository<Fit>,
    @InjectRepository(Size)
    private sizeRepository: Repository<Size>,
    @InjectRepository(Color)
    private colorRepository: Repository<Color>,
  ) {
  }

  async getProducts(params: any) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'categories')
      .leftJoinAndSelect('product.variants', 'variants')
      .leftJoinAndSelect('variants.size', 'size')
      .leftJoinAndSelect('variants.color', 'color')
      .where('product.deletedAt IS NULL');

    if (params.category) {
      query.andWhere('categories.slug = :category', { category: params.category });
    }
    if (params.brand) {
      query.andWhere('brand.slug = :brand', { brand: params.brand });
    }
    if (params.search) {
      query.andWhere('(product.name ILIKE :search OR product.description ILIKE :search)', { search: `%${params.search}%` });
    }
    if (params.minPrice) {
      query.andWhere('variant.sellingPrice >= :minPrice', { minPrice: params.minPrice });
    }
    if (params.maxPrice) {
      query.andWhere('variant.sellingPrice <= :maxPrice', { maxPrice: params.maxPrice });
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    query.skip((page - 1) * limit).take(limit);

    if (params.sort) {
      const order = params.order === 'desc' ? 'DESC' : 'ASC';
      query.orderBy(`product.${params.sort}`, order);
    } else {
      query.orderBy('product.createdAt', 'DESC');
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProduct(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug, deletedAt: null },
      relations: ['brand', 'categories', 'variants', 'variants.size', 'variants.color', 'media', 'attributes', 'fit', 'fabric', 'collections'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async getVariants(productId: string) {
    return this.variantRepository.find({
      where: { product: { id: productId }, deletedAt: null },
      relations: ['size', 'color'],
    });
  }

  async getMedia(productId: string) {
    return this.mediaRepository.find({
      where: { productId },
      order: { sortOrder: 'ASC' },
    });
  }

  async findById(id: string) {
    const product = await this.productRepository.findOne({
      where: { id, deletedAt: null },
      relations: ['brand', 'categories', 'variants', 'media', 'attributes', 'fit', 'fabric'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async findAllAdmin(params: any) {
    const query = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.brand', 'brand')
      .leftJoinAndSelect('product.categories', 'categories')
      .where('product.deletedAt IS NULL');

    if (params.search) {
      query.andWhere('(product.name ILIKE :search OR product.articleCode ILIKE :search)', { search: `%${params.search}%` });
    }
    if (params.status) {
      query.andWhere('product.status = :status', { status: params.status });
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    query.skip((page - 1) * limit).take(limit);
    query.orderBy('product.createdAt', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async create(dto: any) {
    return { message: 'Product creation endpoint - implementation pending' };
  }

  async update(id: string, dto: any) {
    const product = await this.findById(id);
    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async delete(id: string) {
    const product = await this.findById(id);
    product.deletedAt = new Date();
    await this.productRepository.save(product);
  }

  async publish(id: string) {
    const product = await this.findById(id);
    product.status = 'published';
    product.publishedAt = new Date();
    return this.productRepository.save(product);
  }

  async unpublish(id: string) {
    const product = await this.findById(id);
    product.status = 'unpublished';
    product.publishedAt = null;
    return this.productRepository.save(product);
  }
}