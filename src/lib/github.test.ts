import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Repository } from './github'
const makeRepo = (name: string, extra: Partial<Repository> = {}): Repository => ({
  id: 1, name, full_name: `paci1828/${name}`, description: null, html_url: `https://github.com/paci1828/${name}`,
  language: 'Java', topics: [], stargazers_count: 0, updated_at: '2026-01-01T12:00:00Z',
  default_branch: 'main', fork: false, homepage: null, ...extra,
})
let storage: Map<string, string>
const response = (data: unknown, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers })
beforeEach(() => {
  vi.resetModules()
  vi.restoreAllMocks()
  storage = new Map()
  vi.stubGlobal('localStorage', { getItem: (key: string) => storage.get(key) || null, setItem: (key: string, value: string) => storage.set(key, value) })
})

describe('README safety and paths', () => {
  it('decodes multibyte UTF-8 README text', async () => {
    const { decodeReadme } = await import('./github')
    const content = Buffer.from('Caffè, qualità e 日本語').toString('base64')
    expect(decodeReadme({ content, encoding: 'base64', path: 'README.md', sha: '1' })).toBe('Caffè, qualità e 日本語')
  })
  it('resolves nested README images against its directory and branch', async () => {
    const { resolveReadmeUrl } = await import('./github')
    const repo = makeRepo('demo', { default_branch: 'feature/docs' })
    expect(resolveReadmeUrl('../images/a.png?raw=1#part', repo, 'docs/README.md', true)).toBe('https://raw.githubusercontent.com/paci1828/demo/feature%2Fdocs/images/a.png?raw=1#part')
    expect(resolveReadmeUrl('/images/a.png', repo, 'docs/README.md', true)).toBe('https://raw.githubusercontent.com/paci1828/demo/feature%2Fdocs/images/a.png')
    expect(resolveReadmeUrl('./guide.md', repo, 'docs/README.md', false)).toBe('https://github.com/paci1828/demo/blob/feature%2Fdocs/docs/guide.md')
  })
  it('preserves absolute and anchor links and rejects executable protocols', async () => {
    const { resolveReadmeUrl, safeHttpUrl } = await import('./github')
    const repo = makeRepo('demo')
    for (const url of ['https://example.com/image.png', '//example.com/image.png', '#section']) expect(resolveReadmeUrl(url, repo, 'README.md', true)).toBe(url)
    expect(resolveReadmeUrl('mailto:hello@example.com', repo, 'README.md', false)).toBe('mailto:hello@example.com')
    for (const url of ['javascript:alert(1)', 'data:text/html,hello', 'vbscript:bad']) expect(resolveReadmeUrl(url, repo, 'README.md', false)).toBe('')
    expect(safeHttpUrl('javascript:alert(1)')).toBeUndefined()
  })
  it('extracts an explicitly labelled demo without guessing from arbitrary links', async () => {
    const { findDemo } = await import('./github')
    expect(findDemo('[Docs](https://docs.example.com) [Live demo](https://demo.example.com)')).toBe('https://demo.example.com/')
    expect(findDemo('[Repository](https://github.com/paci1828)')).toBeUndefined()
  })
})

describe('GitHub client', () => {
  it('deduplicates concurrent requests and uses fresh cache', async () => {
    const fetcher = vi.fn(async () => response({ value: 1 }))
    vi.stubGlobal('fetch', fetcher)
    const { request } = await import('./github')
    const [a, b] = await Promise.all([request('/test'), request('/test')])
    expect(a).toEqual(b)
    await request('/test')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('falls back to expired cache when offline', async () => {
    storage.set('sp-github-v1:/test', JSON.stringify({ saved: Date.now() - 4 * 3600000, data: ['cached'] }))
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')))
    const { request } = await import('./github')
    expect(await request('/test')).toEqual({ data: ['cached'], stale: true })
  })
  it('does not resurrect cached content after an authoritative 404', async () => {
    storage.set('sp-github-v1:/test', JSON.stringify({ saved: 1, data: ['deleted'] }))
    vi.stubGlobal('fetch', vi.fn(async () => response({}, 404)))
    const { request } = await import('./github')
    await expect(request('/test')).rejects.toMatchObject({ status: 404 })
  })
  it('reports the reset time and prevents more requests during rate limiting', async () => {
    const reset = Math.ceil(Date.now() / 1000) + 600
    const fetcher = vi.fn(async () => response({}, 403, { 'x-ratelimit-remaining': '0', 'x-ratelimit-reset': String(reset) }))
    vi.stubGlobal('fetch', fetcher)
    const { request } = await import('./github')
    await expect(request('/a')).rejects.toMatchObject({ status: 429, reset: reset * 1000 })
    await expect(request('/b')).rejects.toMatchObject({ status: 429 })
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('works with corrupt and unavailable persistent storage', async () => {
    storage.set('sp-github-v1:/test', '{invalid')
    vi.stubGlobal('fetch', vi.fn(async () => response(['ok'])))
    const { request } = await import('./github')
    expect((await request('/test')).data).toEqual(['ok'])
    vi.stubGlobal('localStorage', { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') } })
    expect((await request('/another')).data).toEqual(['ok'])
  })
  it('retrieves all pages and sorts by most recently updated', async () => {
    const first = Array.from({ length: 100 }, (_, i) => makeRepo(`repo${i}`, { id: i }))
    const fetcher = vi.fn(async (url: string) => response(url.includes('page=2') ? [makeRepo('latest', { id: 101, updated_at: '2026-10-01T00:00:00Z' })] : first))
    vi.stubGlobal('fetch', fetcher)
    const { getRepositories } = await import('./github')
    const result = await getRepositories()
    expect(result.data).toHaveLength(101)
    expect(result.data[0].name).toBe('latest')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('keeps received pages when pagination is interrupted', async () => {
    const first = Array.from({ length: 100 }, (_, i) => makeRepo(`repo${i}`, { id: i }))
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('page=2')) throw new Error('offline')
      return response(first)
    }))
    const { getRepositories } = await import('./github')
    const result = await getRepositories()
    expect(result.data).toHaveLength(100)
    expect(result.partial).toBe(true)
  })
  it('includes only forks with customized README content', async () => {
    const original = makeRepo('original')
    const same = makeRepo('same', { fork: true })
    const custom = makeRepo('custom', { fork: true })
    vi.stubGlobal('fetch', vi.fn(async (url: string) => {
      if (url.includes('/users/')) return response([original, same, custom])
      if (url.endsWith('/same')) return response({ ...same, parent: { full_name: 'upstream/same' } })
      if (url.endsWith('/custom')) return response({ ...custom, parent: { full_name: 'upstream/custom' } })
      return response({ sha: url.includes('/paci1828/custom/readme') ? 'changed' : 'base' })
    }))
    const { getRepositories } = await import('./github')
    expect((await getRepositories()).data.map(repo => repo.name)).toEqual(['original', 'custom'])
  })
  it('marks unavailable fork verification as partial while retaining originals', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url: string) => response(url.includes('/users/') ? [makeRepo('original'), makeRepo('fork', { fork: true })] : {}, url.includes('/users/') ? 200 : 500)))
    const { getRepositories } = await import('./github')
    expect(await getRepositories()).toMatchObject({ data: [expect.objectContaining({ name: 'original' })], partial: true })
  })
})
