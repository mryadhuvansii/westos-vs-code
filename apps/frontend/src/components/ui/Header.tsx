'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Input } from '@/components/ui/Input';

export function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-secondary-200 dark:bg-secondary-900/95 dark:border-secondary-800">      <div className='hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8 h-10 bg-secondary-50 dark:bg-secondary-950 border-b border-secondary-200 dark:border-secondary-800 text-sm text-secondary-600 dark:text-secondary-400'>
        <div className='flex items-center gap-4'>
          <span className='flex items-center gap-1'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z' />
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 11a3 3 0 11-6 0 3 3 0 016 0z' />
            </svg>
            Free shipping on orders over ₹999
          </span>
          <span className='flex items-center gap-1'>
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8z' />
            </svg>
            30-day easy returns
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/track-order' className='hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>Track Order</Link>
          <Link href='/size-guide' className='hover:text-primary-600 dark:hover:text-primary-400 transition-colors'>Size Guide</Link>
        </div>
      </div>

      <nav className='px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between' aria-label='Main navigation'>
        <Link href='/' className='flex items-center gap-2' aria-label='Westos Home'>
          <svg className='w-8 h-8 text-primary-600 dark:text-primary-400' viewBox='0 0 32 32' fill='none' aria-hidden='true'>
            <rect width='32' height='32' rx='8' fill='currentColor' />
            <path d='M8 16L14 22L24 10' stroke='white' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' />
          </svg>
          <span className='font-display font-bold text-xl sm:text-2xl text-secondary-900 dark:text-white'>WESTOS</span>
        </Link>

        <div className='hidden md:flex items-center gap-8'>
          <Link href='/products' className='text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'>Shop</Link>
          <Link href='/products?category=jeans' className='text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'>Jeans</Link>
          <Link href='/products?category=cargos' className='text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'>Cargos</Link>
          <Link href='/products?category=accessories' className='text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'>Accessories</Link>
          <Link href='/sale' className='text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors'>Sale</Link>
        </div>

        <div className='flex items-center gap-4'>
          {/* Search */}
          <div className='relative hidden sm:block'>
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className='flex items-center gap-2 px-4 py-2 bg-secondary-100 dark:bg-secondary-800 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-200 dark:hover:bg-secondary-700 transition-colors'
              aria-label='Search'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
              </svg>
              <span className='hidden md:inline text-sm font-medium'>Search</span>
            </button>
            {isSearchOpen && (
              <div className='absolute right-0 top-full mt-2 w-72 bg-white dark:bg-secondary-900 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 p-3 animate-slide-down'>
                <form action='/products' method='GET'>
                  <Input
                    type='search'
                    name='search'
                    placeholder='Search products...'
                    className='w-full'
                    autoFocus
                    aria-label='Search products'
                  />
                </form>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className='md:hidden p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors'
            aria-label='Search'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
            </svg>
          </button>

          <Link href='/cart' className='relative p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors' aria-label='Shopping cart'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' />
            </svg>
            <span className='absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center'>
              0
            </span>
          </Link>

          {/* Account / Login */}
          <div className='relative'>
            {status === 'loading' ? (
              <div className='w-10 h-10 rounded-full bg-secondary-200 dark:bg-secondary-700 animate-pulse' />
            ) : session ? (
              <>
                <button
                  className='flex items-center gap-2 p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors'
                  aria-label='Account menu'
                >
                  <div className='w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center'>
                    <span className='text-primary-600 dark:text-primary-400 font-medium text-sm'>
                      {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                </button>
                <div className='absolute right-0 top-full mt-2 w-48 bg-white dark:bg-secondary-900 rounded-lg shadow-lg border border-secondary-200 dark:border-secondary-700 py-2 animate-slide-down z-50'>
                  <div className='px-4 py-2 border-b border-secondary-200 dark:border-secondary-700'>
                    <p className='text-sm font-medium text-secondary-900 dark:text-white'>{session.user?.name}</p>
                    <p className='text-xs text-secondary-500 dark:text-secondary-400 truncate'>{session.user?.email}</p>
                  </div>
                  <Link href='/account' className='block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'>My Account</Link>
                  <Link href='/account/orders' className='block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'>My Orders</Link>
                  <Link href='/account/wishlist' className='block px-4 py-2 text-sm text-secondary-700 dark:text-secondary-300 hover:bg-secondary-50 dark:hover:bg-secondary-800'>Wishlist</Link>
                  <hr className='my-2 border-secondary-200 dark:border-secondary-700' />
                  <button onClick={() => signOut({ callbackUrl: '/' })} className='w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-secondary-50 dark:hover:bg-secondary-800'>Sign Out</button>
                </div>
              </>
            ) : (
              <Link
                href='/login'
                className='flex items-center gap-2 px-4 py-2 text-secondary-700 dark:text-secondary-300 font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' />
                </svg>
                <span className='hidden sm:inline'>Account</span>
              </Link>
            )}
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className='md:hidden p-2 rounded-lg text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors'
            aria-label='Toggle menu'
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            ) : (
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className='md:hidden border-t border-secondary-200 dark:border-secondary-800 bg-white dark:bg-secondary-900 animate-slide-down'>
          <div className='px-4 py-4 space-y-4'>
            <Link href='/products' className='block py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium' onClick={() => setIsMobileMenuOpen(false)}>Shop</Link>
            <Link href='/products?category=jeans' className='block py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium' onClick={() => setIsMobileMenuOpen(false)}>Jeans</Link>
            <Link href='/products?category=cargos' className='block py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium' onClick={() => setIsMobileMenuOpen(false)}>Cargos</Link>
            <Link href='/products?category=accessories' className='block py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium' onClick={() => setIsMobileMenuOpen(false)}>Accessories</Link>
            <Link href='/sale' className='block py-2 text-secondary-700 dark:text-secondary-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium' onClick={() => setIsMobileMenuOpen(false)}>Sale</Link>
            <hr className='border-secondary-200 dark:border-secondary-700' />
            {status !== 'loading' && !session && (
              <Link href='/login' className='block w-full text-center py-3 px-4 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors' onClick={() => setIsMobileMenuOpen(false)}>Sign In / Register</Link>
            )}
          </div>
        </div>
      )}

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className='fixed inset-0 z-50 md:hidden bg-black/50 animate-fade-in' onClick={() => setIsSearchOpen(false)}>
          <div className='absolute top-20 left-4 right-4 bg-white dark:bg-secondary-900 rounded-lg shadow-lg p-4 animate-slide-down'>
            <form action='/products' method='GET' onSubmit={() => setIsSearchOpen(false)}>
              <Input
                type='search'
                name='search'
                placeholder='Search products...'
                className='w-full text-lg'
                autoFocus
                aria-label='Search products'
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
