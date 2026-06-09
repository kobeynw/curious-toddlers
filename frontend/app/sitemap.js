const BASE_URL = 'https://www.curioustoddlers.com';

export default async function sitemap() {
  const now = new Date();

  const staticRoutes = [
    { url: `${BASE_URL}`, lastModified: now, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/activities`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/learn`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  let activityRoutes = [];
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/activities/index`);
    if (res.ok) {
      const { activities } = await res.json();
      activityRoutes = activities.map((a) => ({
        url: `${BASE_URL}/activities/${a.id}`,
        lastModified: a.updatedAt ? new Date(a.updatedAt) : now,
        changeFrequency: 'monthly',
        priority: 0.7,
      }));
    }
  } catch {
    // silently skip if backend is unreachable at build time
  }

  return [...staticRoutes, ...activityRoutes];
}
