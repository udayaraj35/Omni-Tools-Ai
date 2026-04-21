import { MetadataRoute } from 'next';
 
const tools = [
  '/cv-builder',
  '/visa-builder',
  '/text-converter',
  '/social-writer',
  '/background-remover',
  '/translation',
  '/all-tools',
  '/pdf-tools',
  '/personal-assistant',
  '/omni-ai',
  '/image-generator',
  '/story-designer',
  '/resignation-letter',
  '/fancy-font-generator',
  '/company-documents',
  '/dummy-ticket',
  '/invoice-generator',
  '/media-processor',
  '/temporary-residence-permit',
  '/currency-converter',
  '/bs-ad-converter',
  '/tax-clearance',
  '/profile',
  '/story-generator',
  '/goldify-ai',
  '/omnihumanizer',
  '/mantra-generator',
  '/proposal-generator',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://omnitoolsai.fun';

  const toolPages = tools.map((tool) => ({
    url: `${baseUrl}${tool}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...toolPages,
  ];
}
