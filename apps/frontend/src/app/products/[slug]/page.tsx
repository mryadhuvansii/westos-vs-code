'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productsApi } from '@/lib/endpoints-shop';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);


  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      try {
        const response = await productsApi.getProduct(slug);
        if (response.data.success) {
          setProduct(response.data.data);
          const firstVariant = response.data.data.variants.find(
            (v) => v.status === 'active' && v.stockQuantity > 0
          );
          if (firstVariant) {
            setSelectedVariant(firstVariant);
            setSelectedSize(firstVariant.size?.label || null);
            setSelectedColor(firstVariant.color?.displayName || null);
          }
          if (response.data.data.categories?.length > 0) {
            const categorySlug = response.data.data.categories[0].slug;
            const relatedResponse = await productsApi.getProducts({ category: categorySlug, limit: 4 });
            const related = relatedResponse.data.data.data.filter((p) => p.id !== response.data.data.id);
            setRelatedProducts(related);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.variants.find(
        (v) => v.size?.label === selectedSize && v.color?.displayName === selectedColor && v.status === 'active'
      );
      if (variant) {
        setSelectedVariant(variant);
      }
    }
  }, [product, selectedSize, selectedColor]);

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setAddingToCart(true);
    try {
      console.log('Add to cart:', { variantId: selectedVariant.id, quantity });
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to add to cart:', err);
    } finally {
      setAddingToCart(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const calculateDiscount = (mrp, sellingPrice) => {
    const mrpNum = Number(mrp);
    const spNum = Number(sellingPrice);
    if (mrpNum > spNum) {
      return Math.round((mrpNum - spNum) / mrpNum * 100);
    }
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-gray-200 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/2" />
                <div className="h-12 bg-gray-200 rounded" />
                <div className="h-12 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The product you\'re looking for doesn\'t exist.'}</p>
          <Link href="/products" className="text-blue-600 hover:text-blue-800 font-medium">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const activeVariants = product.variants.filter((v) => v.status === 'active');
  const colors = [...new Map(activeVariants.map((v) => [v.color?.name, v.color])).values()];
  const sizes = [...new Map(activeVariants.filter((v) => v.color?.name === selectedColor || !selectedColor).map((v) => [v.size?.label, v.size])).values()];

  const productImages = product.media?.filter((m) => m.type === 'image') || [];
  const primaryImage = productImages.find((m) => m.isPrimary) || productImages[0];

  return (
    <div className="min-h-screen bg-white">
      <nav className="bg-gray-50 border-b" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
            <li className="text-gray-400">/</li>
            <li><Link href="/products" className="text-gray-500 hover:text-gray-700">Shop</Link></li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium" aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative">
              {primaryImage ? (
                <Image src={primaryImage.url} alt={primaryImage.alt || product.name} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              {calculateDiscount(product.mrp, product.sellingPrice) > 0 && (
                <span className="absolute top-4 left-4 bg-red-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                  -{calculateDiscount(product.mrp, product.sellingPrice)}%
                </span>
              )}
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {productImages.map((image, index) => (
                  <button key={image.id} onClick={() => setActiveImageIndex(index)} className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${activeImageIndex === index ? 'border-blue-600' : 'border-transparent hover:border-gray-300'}`}>
                    <Image src={image.url} alt={image.alt || `${product.name} - Image ${index + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {product.categories?.[0] && <Link href={`/products?category=${product.categories[0].slug}`} className="hover:text-gray-900">{product.categories[0].name}</Link>}
              {product.categories?.[0] && <span>/</span>}
              {product.brand && <Link href={`/products?brand=${product.brand.slug}`} className="hover:text-gray-900 font-medium">{product.brand.name}</Link>}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.name}</h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-gray-900">{formatPrice(product.sellingPrice)}</span>
              {product.mrp && Number(product.mrp) > Number(product.sellingPrice) && <span className="text-xl text-gray-400 line-through">{formatPrice(product.mrp)}</span>}
            </div>
            {product.description && <div className="prose max-w-none text-gray-600"><p>{product.description}</p></div>}
            {colors.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button key={color.id} onClick={() => { setSelectedColor(color.displayName); setSelectedSize(null); setSelectedVariant(null); }} className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color.displayName ? 'border-blue-600 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`} style={{backgroundColor: color.hexCode || '#ccc'}} title={color.displayName} aria-label={`Select color ${color.displayName}`}>
                      {selectedColor === color.displayName && <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {sizes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => {
                    const hasStock = activeVariants.some((v) => v.size?.label === size.label && v.color?.name === selectedColor && v.stockQuantity > 0);
                    const isSelected = selectedSize === size.label;
                    return <button key={size.id} onClick={() => hasStock && setSelectedSize(size.label)} disabled={!hasStock} className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all min-w-[60px] ${isSelected ? 'border-blue-600 bg-blue-50 text-blue-600' : hasStock ? 'border-gray-200 bg-white hover:border-gray-400' : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'}`} aria-label={`Select size ${size.label} ${!hasStock ? '(out of stock)' : ''}`}>
                      {size.label}
                    </button>;
                  })}
                </div>
              </div>
            )}
            {selectedVariant && <div className={`flex items-center gap-2 text-sm ${selectedVariant.stockQuantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <span className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${selectedVariant.stockQuantity > 0 ? 'bg-green-500' : 'bg-red-500'}`} /> 
                {selectedVariant.stockQuantity > 0 ? `${selectedVariant.stockQuantity} in stock` : 'Out of stock'}
              </span>
            </div>}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1 || addingToCart} className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" aria-label="Decrease quantity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min={1} max={selectedVariant?.stockQuantity || 99} className="w-20 text-center" />
                <button onClick={() => setQuantity(Math.min(selectedVariant?.stockQuantity || 99, quantity + 1))} disabled={quantity >= (selectedVariant?.stockQuantity || 99) || addingToCart} className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50" aria-label="Increase quantity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
            <Button onClick={handleAddToCart} disabled={!selectedVariant || selectedVariant.stockQuantity <= 0 || addingToCart} className="w-full py-4 text-lg" size="lg">
              {addingToCart ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Adding...
                </span>
              ) : cartSuccess ? (
                <span className="flex items-center justify-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Added to Cart!
                </span>
              ) : (
                'Add to Cart'
              )}
            </Button>
            <div className="border-t pt-6">
              <div className="border-b border-gray-200">
                <nav className="flex gap-8 -mb-px" aria-label="Tabs">
                  <button className="py-3 px-1 border-b-2 border-blue-600 font-medium text-sm text-blue-600">Description</button>
                  <button className="py-3 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">Specifications</button>
                  <button className="py-3 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">Shipping & Returns</button>
                  <button className="py-3 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700">Reviews</button>
                </nav>
              </div>
              <div className="py-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Product Details</h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
                  {product.attributes?.map((attr) => (
                    <React.Fragment key={attr.id}>
                      <dt className="text-sm font-medium text-gray-500">{attr.key}</dt>
                      <dd className="text-sm text-gray-900">{attr.value}</dd>
                    </React.Fragment>
                  ))}
                  <dt className="text-sm font-medium text-gray-500">Fabric</dt>
                  <dd className="text-sm text-gray-900">{product.fabric?.name}</dd>
                  <dt className="text-sm font-medium text-gray-500">Fit</dt>
                  <dd className="text-sm text-gray-900">{product.fit?.name}</dd>
                  {product.careInstructions && (
                    <React.Fragment>
                      <dt className="text-sm font-medium text-gray-500">Care Instructions</dt>
                      <dd className="text-sm text-gray-900">{product.careInstructions}</dd>
                    </React.Fragment>
                  )}
                </dl>
              </div>
            </div>
          </div>
        </div>
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} href={`/products/${relatedProduct.slug}`} className="group">
                  <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden relative mb-3">
                    {relatedProduct.media?.[0]?.url && <Image src={relatedProduct.media[0].url} alt={relatedProduct.name} fill className="object-cover transition-transform duration-300 group-hover:scale-105" />}
                  </div>
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-1">{relatedProduct.name}</h3>
                  <p className="text-sm text-gray-500">{formatPrice(relatedProduct.sellingPrice || relatedProduct.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
})
