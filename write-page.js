const fs = require("fs");
const content = `'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ProductCard } from '@/components/products';
import { productsApi } from '@/lib/endpoints-shop';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';

const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name A-Z' },
  { value: '-name', label: 'Name Z-A' },
  { value: 'price', label: 'Price Low to High' },
  { value: '-price', label: 'Price High to Low' },
  { value: '-averageRating', label: 'Top Rated' },
];

const LIMIT_OPTIONS = [
  { value: '12', label: '12 per page' },
  { value: '24', label: '24 per page' },
  { value: '48', label: '48 per page' },
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
      const params: any = { page, limit, sort, order };
      if (category) params.category = category;
      if (search) params.search = search;
      if (minPrice) params.minPrice = parseFloat(minPrice);
      if (maxPrice) params.maxPrice = parseFloat(maxPrice);

      const response = await productsApi.getProducts(params);
      setProducts(response.data.data?.data || []);
      setTotal(response.data.data?.total || 0);
      setTotalPages(response.data.data?.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await productsApi.getProducts({ limit: 100 });
      const products = response.data.data?.data || [];
      const cats = [...new Set(products.map((p: any) => p.category?.name).filter(Boolean))];
      setCategories(cats);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, limit, sort, order, category, search, minPrice, maxPrice]);

  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    params.set('page', '1');
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const [field, dir] = value.startsWith('-') ? [value.slice(1), 'DESC'] : [value, 'ASC'];
    updateParams({ sort: field, order: dir });
  };

  const handleLimitChange = (value: string) => {
    updateParams({ limit: value });
  };

  const handleCategoryChange = (value: string) => {
    updateParams({ category: value || null });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const searchValue = formData.get('search') as string;
    updateParams({ search: searchValue || null });
  };

  const handlePriceFilter = () => {
    updateParams({ minPrice: minPrice || null, maxPrice: maxPrice || null });
  };

  const clearFilters = () => {
    updateParams({ category: null, search: null, minPrice: null, maxPrice: null });
  };

  const hasActiveFilters = category || search || minPrice || maxPrice;
