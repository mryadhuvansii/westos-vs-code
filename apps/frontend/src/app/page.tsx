import Link from 'next/link';
import Image from 'next/image';
import { FeatureCard, CategoryCard, TruckIcon, ShieldIcon, RotateIcon } from '@/components/home';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary-50 to-white dark:from-secondary-900 dark:to-secondary-950">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] bg-primary-100/50 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/2 w-[600px] h-[600px] bg-primary-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold text-secondary-900 dark:text-white mb-6 leading-tight">
              BE YOUR <span className="text-primary-600">BEST</span>
            </h1>
            <p className="text-xl sm:text-2xl text-secondary-600 dark:text-secondary-300 max-w-3xl mx-auto mb-10 font-light">
              Premium jeans and fashion crafted for those who demand quality without compromise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Shop Collection
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-600 bg-primary-50 dark:bg-primary-900/30 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-secondary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-secondary-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TruckIcon />}
              title="Free Shipping"
              description="Free shipping on orders above ₹999. Easy returns within 30 days."
            />
            <FeatureCard
              icon={<ShieldIcon />}
              title="Quality Guaranteed"
              description="Premium fabrics, precision stitching, and rigorous quality checks on every piece."
            />
            <FeatureCard
              icon={<RotateIcon />}
              title="30-Day Returns"
              description="Not satisfied? Return within 30 days for a full refund or exchange."
            />
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-20 bg-secondary-50 dark:bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-secondary-900 dark:text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-secondary-600 dark:text-secondary-300 max-w-2xl mx-auto">
              Discover our curated collection of premium jeans and fashion essentials.
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard
              title="Men's Jeans"
              description="Slim, Straight, Relaxed, Baggy fits"
              imageUrl="/images/categories/mens-jeans.jpg"
              href="/products?category=mens-jeans"
            />
            <CategoryCard
              title="Men's Cargos"
              description="Utility, Tactical, Slim fits"
              imageUrl="/images/categories/mens-cargos.jpg"
              href="/products?category=mens-cargos"
            />
            <CategoryCard
              title="Women's Jeans"
              description="Skinny, Straight, Mom, Wide leg"
              imageUrl="/images/categories/womens-jeans.jpg"
              href="/products?category=womens-jeans"
            />
            <CategoryCard
              title="Accessories"
              description="Belts, Wallets, Caps & more"
              imageUrl="/images/categories/accessories.jpg"
              href="/products?category=accessories"
            />
          </div>
        </div>
      </section>
    </main>
  );
}