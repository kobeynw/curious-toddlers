const BASE_URL = 'https://www.curioustoddlers.com';

export default function sitemap() {
  const lastModified = new Date();
  return [
    { url: `${BASE_URL}`, lastModified, changeFrequency: 'monthly', priority: 1 },
    { url: `${BASE_URL}/activities`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${BASE_URL}/learn`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
