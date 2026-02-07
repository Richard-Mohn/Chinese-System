import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/owner/',
          '/driver/',
          '/customer/',
          '/login/',
          '/logout/',
          '/register/',
          '/signup/',
          '/onboarding/',
        ],
      },
    ],
    sitemap: 'https://mohnmenu.com/sitemap.xml',
  };
}
