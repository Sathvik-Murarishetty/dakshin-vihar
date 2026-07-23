import type { MetadataRoute } from 'next';


 

const BASE = 'https://dakshinvihar.com';


 

export default function sitemap(): MetadataRoute.Sitemap {

  const now = new Date();


 

  return [

    // ── High priority — changes daily ─────────────────────────

    {

      url:             `${BASE}/`,

      lastModified:    now,

      changeFrequency: 'daily',

      priority:        1.0,

    },

    {

      url:             `${BASE}/menu`,

      lastModified:    now,

      changeFrequency: 'daily',

      priority:        0.9,

    },

    {

      url:             `${BASE}/order`,

      lastModified:    now,

      changeFrequency: 'daily',

      priority:        0.9,

    },


 

    // ── Medium priority — changes occasionally ─────────────────

    {

      url:             `${BASE}/our-menu`,

      lastModified:    now,

      changeFrequency: 'weekly',

      priority:        0.8,

    },

    {

      url:             `${BASE}/subscribe`,

      lastModified:    now,

      changeFrequency: 'weekly',

      priority:        0.8,

    },


 

    // ── Low priority — legal pages ─────────────────────────────

    {

      url:             `${BASE}/terms`,

      lastModified:    now,

      changeFrequency: 'yearly',

      priority:        0.3,

    },

    {

      url:             `${BASE}/privacy`,

      lastModified:    now,

      changeFrequency: 'yearly',

      priority:        0.3,

    },

  ];

}