#!/usr/bin/env ts-node
// Seed script for WestOS Platform

import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// Load environment variables
dotenv.config({ path: '../../.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  username: process.env.DATABASE_USERNAME || 'westos',
  password: process.env.DATABASE_PASSWORD || 'westos_dev_password',
  database: process.env.DATABASE_NAME || 'westos_dev',
  synchronize: false,
  logging: true,
});

async function seed() {
  console.log('🌱 Starting database seed...');
  
  await AppDataSource.initialize();
  console.log('✅ Database connected');

  const queryRunner = AppDataSource.createQueryRunner();

  try {
    // ============================================
    // BRANDS
    // ============================================
    console.log('\n📦 Seeding brands...');
    const brandIds: Record<string, string> = {};
    
    const brands = [
      { name: 'Levi\'s', slug: 'levis', logo_url: 'https://example.com/levis-logo.png', description: 'Iconic American denim brand' },
      { name: 'Nike', slug: 'nike', logo_url: 'https://example.com/nike-logo.png', description: 'Just Do It' },
      { name: 'Adidas', slug: 'adidas', logo_url: 'https://example.com/adidas-logo.png', description: 'Impossible is Nothing' },
      { name: 'Zara', slug: 'zara', logo_url: 'https://example.com/zara-logo.png', description: 'Fast fashion from Spain' },
      { name: 'H&M', slug: 'hm', logo_url: 'https://example.com/hm-logo.png', description: 'Fashion and quality at the best price' },
    ];

    for (const brand of brands) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO brands (id, name, slug, logo_url, description, status)
        VALUES ($1, $2, $3, $4, $5, 'active')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [id, brand.name, brand.slug, brand.logo_url, brand.description]);
    }
    
    // Fetch all brand IDs (handles both new and existing)
    const brandRows = await queryRunner.query('SELECT id, slug FROM brands');
    for (const row of brandRows) {
      brandIds[row.slug] = row.id;
    }
    console.log(`✅ ${brands.length} brands seeded (${brandRows.length} total in DB)`);

    // ============================================
    // FABRICS
    // ============================================
    console.log('\n🧵 Seeding fabrics...');
    const fabricIds: Record<string, string> = {};
    
    const fabrics = [
      { name: 'Denim', composition: '100% Cotton', stretch: 'None', weight: 'Heavy', feel: 'Rugged', care_instructions: 'Machine wash cold' },
      { name: 'Cotton', composition: '100% Cotton', stretch: 'Low', weight: 'Light', feel: 'Soft', care_instructions: 'Machine wash warm' },
      { name: 'Polyester', composition: '100% Polyester', stretch: 'Medium', weight: 'Light', feel: 'Smooth', care_instructions: 'Machine wash cold' },
      { name: 'Cotton Blend', composition: '95% Cotton, 5% Elastane', stretch: 'High', weight: 'Medium', feel: 'Stretchy', care_instructions: 'Machine wash cold' },
      { name: 'Linen', composition: '100% Linen', stretch: 'None', weight: 'Light', feel: 'Breathable', care_instructions: 'Hand wash cold' },
    ];

    for (const fabric of fabrics) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO fabrics (id, name, composition, stretch, weight, feel, care_instructions)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (name) DO UPDATE SET composition = EXCLUDED.composition
      `, [id, fabric.name, fabric.composition, fabric.stretch, fabric.weight, fabric.feel, fabric.care_instructions]);
    }
    
    // Fetch all fabric IDs
    const fabricRows = await queryRunner.query('SELECT id, name FROM fabrics');
    for (const row of fabricRows) {
      fabricIds[row.name] = row.id;
    }
    console.log(`✅ ${fabrics.length} fabrics seeded (${fabricRows.length} total in DB)`);

    // ============================================
    // COLORS
    // ============================================
    console.log('\n🎨 Seeding colors...');
    const colorIds: Record<string, string> = {};
    
    const colors = [
      { name: 'black', display_name: 'Black', hex_code: '#000000' },
      { name: 'white', display_name: 'White', hex_code: '#FFFFFF' },
      { name: 'blue', display_name: 'Blue', hex_code: '#0000FF' },
      { name: 'navy', display_name: 'Navy', hex_code: '#000080' },
      { name: 'red', display_name: 'Red', hex_code: '#FF0000' },
      { name: 'green', display_name: 'Green', hex_code: '#008000' },
      { name: 'grey', display_name: 'Grey', hex_code: '#808080' },
      { name: 'beige', display_name: 'Beige', hex_code: '#F5F5DC' },
    ];

    for (const color of colors) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO colors (id, name, display_name, hex_code, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT (name) DO UPDATE SET display_name = EXCLUDED.display_name
      `, [id, color.name, color.display_name, color.hex_code]);
    }
    
    // Fetch all color IDs
    const colorRows = await queryRunner.query('SELECT id, name FROM colors');
    for (const row of colorRows) {
      colorIds[row.name] = row.id;
    }
    console.log(`✅ ${colors.length} colors seeded (${colorRows.length} total in DB)`);

    // ============================================
    // SIZES
    // ============================================
    console.log('\n📏 Seeding sizes...');
    const sizeIds: Record<string, string> = {};
    
    const sizes = [
      { label: 'XS', value: 'XS', display_order: 1 },
      { label: 'S', value: 'S', display_order: 2 },
      { label: 'M', value: 'M', display_order: 3 },
      { label: 'L', value: 'L', display_order: 4 },
      { label: 'XL', value: 'XL', display_order: 5 },
      { label: 'XXL', value: 'XXL', display_order: 6 },
      { label: '28', value: '28', display_order: 10 },
      { label: '30', value: '30', display_order: 11 },
      { label: '32', value: '32', display_order: 12 },
      { label: '34', value: '34', display_order: 13 },
      { label: '36', value: '36', display_order: 14 },
      { label: '38', value: '38', display_order: 15 },
    ];

    for (const size of sizes) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO sizes (id, label, value, display_order, status)
        VALUES ($1, $2, $3, $4, 'active')
        ON CONFLICT DO NOTHING
      `, [id, size.label, size.value, size.display_order]);
    }
    
    // Fetch all size IDs
    const sizeRows = await queryRunner.query('SELECT id, label FROM sizes');
    for (const row of sizeRows) {
      sizeIds[row.label] = row.id;
    }
    console.log(`✅ ${sizes.length} sizes seeded (${sizeRows.length} total in DB)`);

    // ============================================
    // CATEGORIES
    // ============================================
    console.log('\n📂 Seeding categories...');
    const categoryIds: Record<string, string> = {};
    
    const categories = [
      { name: 'Men', slug: 'men', description: 'Men\'s fashion', parent_id: null, sort_order: 1, image_url: 'https://example.com/men.jpg' },
      { name: 'Women', slug: 'women', description: 'Women\'s fashion', parent_id: null, sort_order: 2, image_url: 'https://example.com/women.jpg' },
      { name: 'Kids', slug: 'kids', description: 'Kids\' fashion', parent_id: null, sort_order: 3, image_url: 'https://example.com/kids.jpg' },
    ];

    for (const cat of categories) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO categories (id, name, slug, description, parent_id, image_url, sort_order, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [id, cat.name, cat.slug, cat.description, cat.parent_id, cat.image_url, cat.sort_order]);
    }

    // Sub-categories
    const subCategories = [
      { name: 'Jeans', slug: 'men-jeans', parent: 'men', sort_order: 1, image_url: 'https://example.com/men-jeans.jpg' },
      { name: 'T-Shirts', slug: 'men-tshirts', parent: 'men', sort_order: 2, image_url: 'https://example.com/men-tshirts.jpg' },
      { name: 'Shirts', slug: 'men-shirts', parent: 'men', sort_order: 3, image_url: 'https://example.com/men-shirts.jpg' },
      { name: 'Jackets', slug: 'men-jackets', parent: 'men', sort_order: 4, image_url: 'https://example.com/men-jackets.jpg' },
      { name: 'Dresses', slug: 'women-dresses', parent: 'women', sort_order: 1, image_url: 'https://example.com/women-dresses.jpg' },
      { name: 'Tops', slug: 'women-tops', parent: 'women', sort_order: 2, image_url: 'https://example.com/women-tops.jpg' },
      { name: 'Skirts', slug: 'women-skirts', parent: 'women', sort_order: 3, image_url: 'https://example.com/women-skirts.jpg' },
      { name: 'Jeans', slug: 'women-jeans', parent: 'women', sort_order: 4, image_url: 'https://example.com/women-jeans.jpg' },
      { name: 'Boys', slug: 'kids-boys', parent: 'kids', sort_order: 1, image_url: 'https://example.com/kids-boys.jpg' },
      { name: 'Girls', slug: 'kids-girls', parent: 'kids', sort_order: 2, image_url: 'https://example.com/kids-girls.jpg' },
    ];

    for (const cat of subCategories) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO categories (id, name, slug, description, parent_id, image_url, sort_order, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [id, cat.name, cat.slug, `${cat.name} for ${cat.parent}`, categoryIds[cat.parent], cat.image_url, cat.sort_order]);
    }
    
    // Fetch all category IDs
    const categoryRows = await queryRunner.query('SELECT id, slug FROM categories');
    for (const row of categoryRows) {
      categoryIds[row.slug] = row.id;
    }
    console.log(`✅ ${categories.length + subCategories.length} categories seeded (${categoryRows.length} total in DB)`);

    // ============================================
    // WAREHOUSES
    // ============================================
    console.log('\n🏭 Seeding warehouses...');
    const warehouseIds: Record<string, string> = {};
    const locationIds: Record<string, string> = {};
    
    const warehouses = [
      { name: 'Main Warehouse', code: 'WH-001', address: '123 Industrial Blvd', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    ];

    for (const wh of warehouses) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO warehouses (id, name, code, address, city, state, country, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
        ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name
      `, [id, wh.name, wh.code, wh.address, wh.city, wh.state, wh.country]);
    }
    
    // Fetch warehouse IDs
    const warehouseRows = await queryRunner.query('SELECT id, code FROM warehouses');
    for (const row of warehouseRows) {
      warehouseIds[row.code] = row.id;
    }

    // Create default location for each warehouse
    for (const wh of warehouses) {
      const locId = uuidv4();
      await queryRunner.query(`
        INSERT INTO warehouse_locations (id, warehouse_id, code, aisle, rack, shelf, bin, is_pickable)
        VALUES ($1, $2, 'A-01-01', 'A', '01', '01', '01', true)
        ON CONFLICT (warehouse_id, code) DO UPDATE SET code = EXCLUDED.code
      `, [locId, warehouseIds[wh.code]]);
    }
    
    // Fetch location IDs
    const locationRows = await queryRunner.query(`
      SELECT wl.id, w.code as warehouse_code
      FROM warehouse_locations wl
      JOIN warehouses w ON wl.warehouse_id = w.id
      WHERE wl.code = 'A-01-01'
    `);
    for (const row of locationRows) {
      locationIds[row.warehouse_code] = row.id;
    }
    console.log(`✅ ${warehouses.length} warehouses seeded`);

    // ============================================
    // FITS (already inserted via migration, just verify)
    // ============================================
    console.log('\n👖 Verifying fits...');
    const fitsResult = await queryRunner.query('SELECT id, name FROM fits WHERE status = \'active\'');
    const fitIds: Record<string, string> = {};
    for (const fit of fitsResult) {
      fitIds[fit.name.toLowerCase()] = fit.id;
    }
    console.log(`✅ ${fitsResult.length} fits found`);

    // ============================================
    // PRODUCTS
    // ============================================
    console.log('\n👕 Seeding products...');
    const productIds: Record<string, string> = {};
    
    const products = [
      {
        article_code: 'LEV-501-001',
        name: 'Classic 501 Jeans',
        slug: 'classic-501-jeans',
        description: 'The original blue jean since 1873. A straight fit with a signature button fly.',
        brand_id: brandIds['levis'],
        fit_id: fitIds['straight'],
        fabric_id: fabricIds['Denim'],
        status: 'published',
        care_instructions: 'Machine wash cold, tumble dry low',
        published_at: new Date(),
      },
      {
        article_code: 'LEV-511-002',
        name: '511 Slim Fit Jeans',
        slug: '511-slim-fit-jeans',
        description: 'Slim through hip and thigh with a narrow leg opening.',
        brand_id: brandIds['levis'],
        fit_id: fitIds['slim'],
        fabric_id: fabricIds['Cotton Blend'],
        status: 'published',
        care_instructions: 'Machine wash cold, tumble dry low',
        published_at: new Date(),
      },
      {
        article_code: 'NIKE-AIR-001',
        name: 'Air Max 270',
        slug: 'air-max-270',
        description: 'Nike\'s first lifestyle Air Max with a large window and soft foam.',
        brand_id: brandIds['nike'],
        fit_id: fitIds['comfort fit'],
        fabric_id: fabricIds['Polyester'],
        status: 'published',
        care_instructions: 'Spot clean only',
        published_at: new Date(),
      },
      {
        article_code: 'ADI-ULTRA-001',
        name: 'Ultraboost 22',
        slug: 'ultraboost-22',
        description: 'Responsive running shoes with Boost midsole and Primeknit upper.',
        brand_id: brandIds['adidas'],
        fit_id: fitIds['comfort fit'],
        fabric_id: fabricIds['Polyester'],
        status: 'published',
        care_instructions: 'Machine wash cold, air dry',
        published_at: new Date(),
      },
      {
        article_code: 'ZARA-SHIRT-001',
        name: 'Oversized Linen Shirt',
        slug: 'oversized-linen-shirt',
        description: 'Relaxed fit linen shirt with camp collar.',
        brand_id: brandIds['zara'],
        fit_id: fitIds['relaxed'],
        fabric_id: fabricIds['Linen'],
        status: 'published',
        care_instructions: 'Hand wash cold, line dry',
        published_at: new Date(),
      },
      {
        article_code: 'HM-DRESS-001',
        name: 'Floral Midi Dress',
        slug: 'floral-midi-dress',
        description: 'Flowy midi dress with floral print and adjustable straps.',
        brand_id: brandIds['hm'],
        fit_id: fitIds['relaxed'],
        fabric_id: fabricIds['Cotton'],
        status: 'published',
        care_instructions: 'Machine wash cold, tumble dry low',
        published_at: new Date(),
      },
    ];

    for (const product of products) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO products (id, article_code, name, slug, description, brand_id, fit_id, fabric_id, status, care_instructions, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [id, product.article_code, product.name, product.slug, product.description, product.brand_id, product.fit_id, product.fabric_id, product.status, product.care_instructions, product.published_at]);
    }
    
    // Fetch all product IDs
    const productRows = await queryRunner.query('SELECT id, slug FROM products');
    for (const row of productRows) {
      productIds[row.slug] = row.id;
    }
    console.log(`✅ ${products.length} products seeded (${productRows.length} total in DB)`);

    // ============================================
    // PRODUCT CATEGORIES
    // ============================================
    console.log('\n🔗 Linking products to categories...');
    const productCategories = [
      { product: 'classic-501-jeans', category: 'men-jeans' },
      { product: '511-slim-fit-jeans', category: 'men-jeans' },
      { product: 'air-max-270', category: 'men-tshirts' },
      { product: 'ultraboost-22', category: 'men-tshirts' },
      { product: 'oversized-linen-shirt', category: 'men-shirts' },
      { product: 'floral-midi-dress', category: 'women-dresses' },
    ];

    for (const pc of productCategories) {
      await queryRunner.query(`
        INSERT INTO product_categories (product_id, category_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [productIds[pc.product], categoryIds[pc.category]]);
    }
    console.log(`✅ Product-category links created`);

    // ============================================
    // PRODUCT VARIANTS (size/color combinations with stock)
    // ============================================
    console.log('\n📦 Seeding product variants with stock...');
    
    const variantData = [
      // Classic 501 Jeans - Blue/Dark Blue
      { product: 'classic-501-jeans', color: 'blue', sizes: ['28', '30', '32', '34', '36'], mrp: 5999, selling: 4799, stock: 50 },
      { product: 'classic-501-jeans', color: 'black', sizes: ['28', '30', '32', '34', '36'], mrp: 5999, selling: 4799, stock: 30 },
      
      // 511 Slim Fit Jeans
      { product: '511-slim-fit-jeans', color: 'blue', sizes: ['28', '30', '32', '34', '36'], mrp: 5499, selling: 4399, stock: 40 },
      { product: '511-slim-fit-jeans', color: 'black', sizes: ['28', '30', '32', '34'], mrp: 5499, selling: 4399, stock: 25 },
      
      // Air Max 270
      { product: 'air-max-270', color: 'black', sizes: ['7', '8', '9', '10', '11'], mrp: 12999, selling: 10999, stock: 20 },
      { product: 'air-max-270', color: 'white', sizes: ['7', '8', '9', '10', '11'], mrp: 12999, selling: 10999, stock: 15 },
      { product: 'air-max-270', color: 'red', sizes: ['8', '9', '10'], mrp: 12999, selling: 10999, stock: 10 },
      
      // Ultraboost 22
      { product: 'ultraboost-22', color: 'black', sizes: ['7', '8', '9', '10', '11'], mrp: 17999, selling: 15999, stock: 25 },
      { product: 'ultraboost-22', color: 'blue', sizes: ['7', '8', '9', '10'], mrp: 17999, selling: 15999, stock: 15 },
      
      // Oversized Linen Shirt
      { product: 'oversized-linen-shirt', color: 'white', sizes: ['S', 'M', 'L', 'XL'], mrp: 2999, selling: 2399, stock: 35 },
      { product: 'oversized-linen-shirt', color: 'beige', sizes: ['S', 'M', 'L', 'XL'], mrp: 2999, selling: 2399, stock: 28 },
      { product: 'oversized-linen-shirt', color: 'blue', sizes: ['S', 'M', 'L'], mrp: 2999, selling: 2399, stock: 20 },
      
      // Floral Midi Dress
      { product: 'floral-midi-dress', color: 'blue', sizes: ['XS', 'S', 'M', 'L'], mrp: 3499, selling: 2799, stock: 30 },
      { product: 'floral-midi-dress', color: 'red', sizes: ['XS', 'S', 'M', 'L'], mrp: 3499, selling: 2799, stock: 22 },
      { product: 'floral-midi-dress', color: 'green', sizes: ['XS', 'S', 'M'], mrp: 3499, selling: 2799, stock: 15 },
    ];

    let variantCount = 0;
    for (const vd of variantData) {
      const productId = productIds[vd.product];
      const colorId = colorIds[vd.color];
      
      for (const sizeLabel of vd.sizes) {
        const sizeId = sizeIds[sizeLabel];
        if (!sizeId) {
          console.log(`⚠️  Size ${sizeLabel} not found, skipping`);
          continue;
        }
        
        const variantId = uuidv4();
        const sku = `${vd.product}-${vd.color}-${sizeLabel}`.toUpperCase();
        
        await queryRunner.query(`
          INSERT INTO product_variants (id, product_id, sku, size_id, color_id, mrp, selling_price, cost_price, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active')
          ON CONFLICT (sku) DO UPDATE SET mrp = EXCLUDED.mrp, selling_price = EXCLUDED.selling_price, cost_price = EXCLUDED.cost_price
        `, [variantId, productId, sku, sizeId, colorId, vd.mrp, vd.selling, Math.round(vd.selling * 0.4)]);

        // Get the actual variant ID (in case of conflict)
        const variantRow = await queryRunner.query('SELECT id FROM product_variants WHERE sku = $1', [sku]);
        const actualVariantId = variantRow[0]?.id || variantId;

        // Add inventory
        await queryRunner.query(`
          INSERT INTO inventory (id, variant_id, warehouse_id, location_id, on_hand, reserved, incoming, damaged, unavailable)
          VALUES ($1, $2, $3, $4, $5, 0, 0, 0, 0)
          ON CONFLICT (variant_id, warehouse_id, location_id) DO UPDATE SET on_hand = EXCLUDED.on_hand
        `, [uuidv4(), actualVariantId, warehouseIds['WH-001'], locationIds['WH-001'], vd.stock]);
        
        variantCount++;
      }
    }
    console.log(`✅ ${variantCount} product variants with inventory seeded`);

    // ============================================
    // PRODUCT MEDIA (images)
    // ============================================
    console.log('\n🖼️  Seeding product images...');
    const productImages = [
      { product: 'classic-501-jeans', images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800',
        'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800',
        'https://images.unsplash.com/photo-1604176354204-926873740b8f?w=800',
      ]},
      { product: '511-slim-fit-jeans', images: [
        'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=800',
        'https://images.unsplash.com/photo-1604176354204-926873740b8f?w=800',
      ]},
      { product: 'air-max-270', images: [
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
        'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800',
      ]},
      { product: 'ultraboost-22', images: [
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800',
      ]},
      { product: 'oversized-linen-shirt', images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      ]},
      { product: 'floral-midi-dress', images: [
        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800',
        'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=800',
      ]},
    ];

    let mediaCount = 0;
    for (const pi of productImages) {
      const productId = productIds[pi.product];
      for (let i = 0; i < pi.images.length; i++) {
        await queryRunner.query(`
          INSERT INTO product_media (id, product_id, type, url, alt_text, sort_order, is_primary, processing_status)
          VALUES ($1, $2, 'image', $3, $4, $5, $6, 'ready')
        `, [uuidv4(), productId, pi.images[i], `${pi.product} image ${i + 1}`, i, i === 0]);
        mediaCount++;
      }
    }
    console.log(`✅ ${mediaCount} product images seeded`);

    // ============================================
    // PRODUCT ATTRIBUTES
    // ============================================
    console.log('\n📋 Seeding product attributes...');
    const attributes = [
      { product: 'classic-501-jeans', attrs: [
        { key: 'Fit', value: 'Straight' },
        { key: 'Rise', value: 'Mid' },
        { key: 'Leg Opening', value: '16.5"' },
        { key: 'Closure', value: 'Button Fly' },
        { key: 'Pockets', value: '5-pocket styling' },
      ]},
      { product: '511-slim-fit-jeans', attrs: [
        { key: 'Fit', value: 'Slim' },
        { key: 'Rise', value: 'Mid' },
        { key: 'Leg Opening', value: '14.5"' },
        { key: 'Closure', value: 'Zip Fly' },
        { key: 'Stretch', value: '1% Elastane' },
      ]},
      { product: 'air-max-270', attrs: [
        { key: 'Cushioning', value: 'Max Air' },
        { key: 'Upper', value: 'Mesh' },
        { key: 'Sole', value: 'Rubber' },
        { key: 'Drop', value: '8mm' },
      ]},
      { product: 'ultraboost-22', attrs: [
        { key: 'Cushioning', value: 'Boost' },
        { key: 'Upper', value: 'Primeknit' },
        { key: 'Sole', value: 'Continental Rubber' },
        { key: 'Drop', value: '10mm' },
      ]},
      { product: 'oversized-linen-shirt', attrs: [
        { key: 'Fit', value: 'Oversized' },
        { key: 'Collar', value: 'Camp Collar' },
        { key: 'Sleeve', value: 'Short' },
        { key: 'Material', value: '100% Linen' },
      ]},
      { product: 'floral-midi-dress', attrs: [
        { key: 'Length', value: 'Midi' },
        { key: 'Fit', value: 'Relaxed' },
        { key: 'Straps', value: 'Adjustable' },
        { key: 'Print', value: 'Floral' },
      ]},
    ];

    let attrCount = 0;
    for (const pa of attributes) {
      const productId = productIds[pa.product];
      for (let i = 0; i < pa.attrs.length; i++) {
        await queryRunner.query(`
          INSERT INTO product_attributes (id, product_id, key, value, display_order)
          VALUES ($1, $2, $3, $4, $5)
        `, [uuidv4(), productId, pa.attrs[i].key, pa.attrs[i].value, i]);
        attrCount++;
      }
    }
    console.log(`✅ ${attrCount} product attributes seeded`);

    // ============================================
    // COLLECTIONS
    // ============================================
    console.log('\n📚 Seeding collections...');
    const collectionIds: Record<string, string> = {};
    
    const collections = [
      { name: 'Summer Essentials', slug: 'summer-essentials', description: 'Lightweight pieces for warm weather', status: 'active', image_url: 'https://example.com/summer.jpg' },
      { name: 'Denim Classics', slug: 'denim-classics', description: 'Timeless denim styles', status: 'active', image_url: 'https://example.com/denim.jpg' },
      { name: 'Athleisure', slug: 'athleisure', description: 'Sporty meets stylish', status: 'active', image_url: 'https://example.com/athleisure.jpg' },
    ];

    for (const coll of collections) {
      const id = uuidv4();
      await queryRunner.query(`
        INSERT INTO collections (id, name, slug, description, image_url, status, start_date)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE)
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
      `, [id, coll.name, coll.slug, coll.description, coll.image_url, coll.status]);
    }
    
    // Fetch collection IDs
    const collectionRows = await queryRunner.query('SELECT id, slug FROM collections');
    for (const row of collectionRows) {
      collectionIds[row.slug] = row.id;
    }

    // Link products to collections
    const productCollections = [
      { product: 'classic-501-jeans', collection: 'denim-classics' },
      { product: '511-slim-fit-jeans', collection: 'denim-classics' },
      { product: 'air-max-270', collection: 'athleisure' },
      { product: 'ultraboost-22', collection: 'athleisure' },
      { product: 'oversized-linen-shirt', collection: 'summer-essentials' },
      { product: 'floral-midi-dress', collection: 'summer-essentials' },
    ];

    for (const pc of productCollections) {
      await queryRunner.query(`
        INSERT INTO product_collections (product_id, collection_id)
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
      `, [productIds[pc.product], collectionIds[pc.collection]]);
    }
    console.log(`✅ ${collections.length} collections seeded with product links`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Brands: ${brands.length}`);
    console.log(`   Fabrics: ${fabrics.length}`);
    console.log(`   Colors: ${colors.length}`);
    console.log(`   Sizes: ${sizes.length}`);
    console.log(`   Categories: ${categories.length + subCategories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Variants: ${variantCount}`);
    console.log(`   Images: ${mediaCount}`);
    console.log(`   Attributes: ${attrCount}`);
    console.log(`   Collections: ${collections.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });