"use client"

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ProductCard } from '@/components/products'
import { productsApi } from '@/lib/endpoints-shop'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest" },
  { value: "name", label: "Name A-Z" },
  { value: "-name", label: "Name Z-A" },
  { value: "price", label: "Price Low to High" },
  { value: "-price", label: "Price High to Low" },
  { value: "-averageRating", label: "Top Rated" },
];

const LIMIT_OPTIONS = [
  { value: "12", label: "12 per page" },
  { value: "24", label: "24 per page" },
  { value: "48", label: "48 per page" },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const sort = searchParams.get('sort') || 'createdAt';
  const order = searchParams.get('order') || 'DESC';
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit, sort, order };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      const response = await productsApi.getProducts(params);
      setProducts(response.data.data?.data || []);
      setTotal(response.data.data?.total || 0);
      setTotalPages(response.data.data?.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getProducts({ limit: 100 });
      const products = response.data.data?.data || [];
      const cats = [...new Set(products.map((p) => p.category?.name).filter(Boolean))];
      setCategories(cats);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, limit, sort, order, category, search, minPrice, maxPrice]);

  const updateParams = (newParams) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value) => {
    const [field, dir] = value.startsWith("-") ? [value.slice(1), "DESC"] : [value, "ASC"];
    updateParams({ sort: field, order: dir });
  };

  const handleLimitChange = (value) => {
    updateParams({ limit: value });
  };

  const handleCategoryChange = (value) => {
    updateParams({ category: value || null });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get("search");
    updateParams({ search: searchValue || null });
  };

  const handlePriceFilter = () => {
    updateParams({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const clearFilters = () => {
    updateParams({ category: null, search: null, minPrice: null, maxPrice: null });
  };

  const hasActiveFilters = category || search || minPrice || maxPrice;

  return (
    <div className="min-h-screen bg-secondary-50 dark:bg-secondary-950">
      {/* Page Header */}
      <section className="bg-white dark:bg-secondary-900 border-b border-secondary-200 dark:border-secondary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-secondary-900 dark:text-white mb-2">
                Shop All Products
              </h1>
              <p className="text-secondary-600 dark:text-secondary-300">
                {total} product{total !== 1 ? "s" : ""} found
              </p>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} className="text-sm">
                Clear all filters
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="bg-white dark:bg-secondary-900 rounded-xl border border-secondary-200 dark:border-secondary-700 p-6 sticky top-24">
                {/* Search */}
                <form onSubmit={handleSearch} className="mb-6">
                  <label htmlFor="search" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-2">
                    Search
                  </label>
                  <Input
                    id="search"
                    name="search"
                    placeholder="Search products..."
                    value={search}
                  />
                </form>

                {/* Categories */}
                {categories.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-2">
                      Category
                  </label>
                  <Select
                    id="category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    options={[
                        { value: "", label: "All Categories" },
                        ...categories.map(cat => ({ value: cat, label: cat })),
                      ]}
                  />
                  </div>
                )}

                {/* Price Range */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-2">
                    Price Range
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => updateParams({ minPrice: e.target.value || null })}
                      className="w-full"
                    />
                    <span className="text-secondary-400">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => updateParams({ maxPrice: e.target.value || null })}
                      className="w-full"
                    />
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-2" onClick={handlePriceFilter}>
                    Apply
                  </Button>
                </div>

                {/* Sort */}
                <div className="mb-6">
                  <label htmlFor="sort" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-2">
                    Sort By
                  </label>
                  <Select
                    id="sort"
                    value={sort + (order === "DESC" ? "" : "-")}
                    onChange={(e) => handleSortChange(e.target.value)}
                    options={SORT_OPTIONS}
                  />
                </div>

                {/* Items per page */}
                <div>
                  <label htmlFor="limit" className="block text-sm font-medium text-secondary-700 dark:text-secondary-200 mb-2">
                    Items per page
                  </label>
                  <Select
                    id="limit"
                    value={limit.toString()}
                    onChange={(e) => handleLimitChange(e.target.value)}
                    options={LIMIT_OPTIONS}
                  />
                </div>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="text-secondary-600 dark:text-secondary-300">
                  Showing <span className="font-semibold">{products.length}</span> of <span className="font-semibold">{total}</span> products
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="aspect-[3/4] rounded-xl bg-secondary-100 dark:bg-secondary-800 animate-pulse" />
                  ))}
                </div>
              ) : products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} variant="grid" />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="mx-auto h-12 w-12 text-secondary-300 dark:text-secondary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10l-8 4m0-10L4 7v10l8 4" />
                  </svg>
                  <h3 className="mt-4 text-lg font-semibold text-secondary-900 dark:text-white">No products found</h3>
                  <p className="mt-2 text-secondary-500 dark:text-secondary-400">Try adjusting your filters or search terms</p>
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => updateParams({ page: String(page - 1) })}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "primary" : "outline"}
                          size="sm"
                          onClick={() => updateParams({ page: String(pageNum) })}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    onClick={() => updateParams({ page: String(page + 1) })}
                  >
                    Next
                  </Button>
                </nav>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}