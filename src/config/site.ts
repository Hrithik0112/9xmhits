/** Canonical site config for SEO / social / sitemap. Override with VITE_SITE_URL. */
export const SITE_URL = (
  import.meta.env.VITE_SITE_URL || 'https://9xmhits.workers.dev'
).replace(/\/$/, '')

export const SITE = {
  name: '9XM Morning Hits',
  shortName: '9XM Hits',
  tagline: 'The Bollywood bangers that woke up a generation',
  description:
    'Free nostalgia web radio of 9XM morning hits — classic Bollywood songs from the 2000s and 2010s. Stream Kal Ho Naa Ho, Jab We Met, Yeh Jawaani Hai Deewani and more, best between 6–10 AM.',
  keywords: [
    '9XM morning hits',
    '9XM hits',
    'Bollywood morning songs',
    '2000s Bollywood hits',
    '2010s Bollywood songs',
    'nostalgia radio',
    'Bollywood web radio',
    'Kal Ho Naa Ho',
    'Yeh Jawaani Hai Deewani songs',
    'Jab We Met songs',
    'Bade Chote',
    'morning Bollywood playlist',
  ],
  locale: 'en_IN',
  language: 'en-IN',
  creator: 'Hrithik Dutta',
  creatorUrl: 'https://www.hrithikdutta.me/',
  twitterHandle: '',
  ogImage: '/og-image.jpg',
  themeColor: '#0a0a0a',
} as const
