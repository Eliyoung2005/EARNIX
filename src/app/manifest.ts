import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'EARNIX - SoftLife & Stress-free Earnings',
    short_name: 'EARNIX',
    description: 'EARNIX is the ultimate platform for SoftLife and Stress-free Earnings. Get paid for sponsored tasks and referrals.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0f',
    theme_color: '#0a5bff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
