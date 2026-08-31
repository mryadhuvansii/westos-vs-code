'use client';

import { SVGProps } from 'react';

export function TruckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10.086a1 1 0 00.274.731A1 1 0 004.828 18h9.336a1 1 0 00.73-.273 1 1 0 01.273-.731V7a1 1 0 011-1h9a1 1 0 011 1v9.586a1 1 0 00.293.707l3 3a1 1 0 001.414 0l2.586-2.586a1 1 0 000-1.414z" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 011.417 2.974c.049.06.098.123.147.187.144.196.24.417.28.66.02.112.028.227.028.342 0 .723-.401 1.333-.992 1.333h-1.5v4a1 1 0 01-1 1h-1a1 1 0 01-1-1v-1a1 1 0 00-1-1H7a1 1 0 01-1-1V7a1 1 0 011-1h.009a5.002 5.002 0 012.59-2.715c.115-.079.23-.148.347-.213A12.06 12.06 0 0112 3.835a11.955 11.955 0 01.99-.55z" />
    </svg>
  );
}

export function RotateIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.001 8.001 0 00-15.357-2m0 0A9.003 9.003 0 0015 12.582m0 0H9" />
    </svg>
  );
}