import { MetadataRoute } from 'next';
import { readMosqueDb } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://masjid.iain-manado.ac.id';

export default function sitemap(): MetadataRoute.Sitemap {
  const db = readMosqueDb();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/berita`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/rehabilitasi`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/mualaf-center`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ];

  const newsRoutes: MetadataRoute.Sitemap = db.news
    .filter((item) => item.status === 'PUBLISHED')
    .map((article) => ({
      url: `${BASE_URL}/berita/${article.slug}`,
      lastModified: new Date(article.publishedAt || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

  const pageRoutes: MetadataRoute.Sitemap = db.customPages
    .filter((page) => page.status === 'PUBLISHED')
    .map((page) => ({
      url: `${BASE_URL}/p/${page.slug}`,
      lastModified: new Date(page.updatedAt || Date.now()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }));

  return [...staticRoutes, ...newsRoutes, ...pageRoutes];
}
