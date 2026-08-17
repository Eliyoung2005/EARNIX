import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard/', '/admin/', '/api/', '/maintenance'],
      },
    ],
    sitemap: 'https://earnix.online/sitemap.xml',
  }
}
