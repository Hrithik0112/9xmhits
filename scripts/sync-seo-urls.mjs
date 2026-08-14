#!/usr/bin/env node
/**
 * Rewrites absolute SEO URLs after you set VITE_SITE_URL.
 * Run: VITE_SITE_URL=https://your.domain npm run seo:sync-url
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const site = (process.env.VITE_SITE_URL || 'https://9xmhits.workers.dev').replace(
  /\/$/,
  '',
)

const files = [
  'index.html',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/llms.txt',
]

// Match placeholders used in this repo
const pattern = /https:\/\/9xmhits\.(workers\.dev|pages\.dev|vercel\.app)/g

for (const rel of files) {
  const path = resolve(root, rel)
  const before = readFileSync(path, 'utf8')
  const after = before.replace(pattern, site)
  if (before !== after) {
    writeFileSync(path, after)
    console.log('updated', rel)
  } else {
    console.log('unchanged', rel)
  }
}

console.log('SITE_URL =', site)
