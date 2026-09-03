import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Stitch & Time — Bespoke Atelier',
    short_name: 'Stitch & Time',
    description: 'Editorial fitting & bespoke tailoring companion for on-the-go garment designers.',
    start_url: '/',
    display: 'standalone',
    background_color: '#141312',
    theme_color: '#141312',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
