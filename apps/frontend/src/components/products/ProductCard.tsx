'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    price?: number;
    salePrice?: number;
    images?: { url: string; alt?: string }[];
    category?: { name: string };
    brand?: { name: string };
    averageRating?: number;
    reviewCount?: number;
  };
  variant?: 'grid' | 'list';
}

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const price = product.salePrice ?? product.price ?? 0;
  const hasSale = product.salePrice && product.price && product.salePrice < product.price;
  const discountPercent = hasSale && product.price ? Math.round((1 - product.salePrice / product.price) * 100) : 0;
if (variant === 'list') {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="group flex gap-6 p-4 bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
      >
        <div className="relative w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden bg-secondary-100 dark:bg-secondary-800">
          <Image
            src={product.images?.[0]?.url || '/images/categories/default.jpg'}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="192px"
          />
          {hasSale && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
              -${discountPercent}%
            </span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-xs font-medium text-primary-600 dark:text-primary-400 mb-1">
              {product.category?.name || product.brand?.name || 'Product'}
            </p>
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2">
              {product.name}
            </h3>
            <p className="text-secondary-500 dark:text-secondary-400 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
            <div className="flex items-center gap-2">
              {product.averageRating && (
                <span className="flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364 1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  {product.averageRating.toFixed(1)}
                  {product.reviewCount && `(${product.reviewCount})`}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-secondary-200 dark:border-secondary-700">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-secondary-900 dark:text-white">
                \u20b9{price.toLocaleString('en-IN')}
              </span>
              {hasSale && (
                <span className="text-lg text-secondary-500 dark:text-secondary-400 line-through">
                  \u20b9{product.price!.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <Button variant="outline" size="sm" className="group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30">
              View Details
            </Button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 z-0">
        <Image
          src={product.images?.[0]?.url || '/images/categories/default.jpg'}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      {hasSale && (
        <span className="absolute top-2 left-2 z-10 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
          -${discountPercent}%
        </span>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <p className="text-xs font-medium text-primary-100 dark:text-primary-400 mb-1">
          {product.category?.name || product.brand?.name || 'Product'}
        </p>
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-white">
              \u20b9{price.toLocaleString('en-IN')}
            </span>
            {hasSale && (
              <span className="text-sm text-secondary-300 line-through">
                \u20b9{product.price!.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          {product.averageRating && (
            <span className="flex items-center gap-1 text-xs text-amber-300">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364 1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
              {product.averageRating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}