'use client';

import Link from 'next/link';
import Image from 'next/image';

export interface CategoryCardProps {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
}

export function CategoryCard({ title, description, imageUrl, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group relative aspect-[4/5] rounded-xl overflow-hidden bg-secondary-100 dark:bg-secondary-800">
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-10" />
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <h3 className="text-xl font-semibold text-white mb-1">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
      <div className="absolute bottom-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="bg-white text-primary-600 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1">
          Shop Now
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
    </Link>
  );
}