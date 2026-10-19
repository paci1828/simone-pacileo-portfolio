import profile from '../data/profile.json'

export interface Repository {
  id: number; name: string; full_name: string; description: string | null;
  html_url: string; language: string | null; topics: string[]; stargazers_count: number;
  updated_at: string; default_branch: string; fork: boolean; homepage: string | null;
  parent?: Repository;
}
export interface Readme { content: string; encoding: string; path: string; sha: string }
export interface Result<T> { data: T; stale: boolean; partial?: boolean }
interface Cache<T> { saved: number; data: T }
export class GithubError extends Error {
  constructor(public status: number, public reset?: number) { super(`GitHub ${status}`) }
}
const TTL = 3 * 60 * 60 * 1000
const PREFIX = 'sp-github-v1:'
const memory = new Map<string, Cache<unknown>>()
const pending = new Map<string, Promise<Result<unknown>>>()
let blockedUntil = 0

function readCache<T>(key: string): Cache<T> | null {
  if (memory.has(key)) return memory.get(key) as Cache<T>
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + key) || 'null')
    if (value && typeof value.saved === 'number' && 'data' in value) {
      memory.set(key, value)
      return value
    }
  } catch { /* Corrupt or unavailable storage must not break navigation. */ }
  return null
}
function writeCache<T>(key: string, value: Cache<T>) {
  memory.set(key, value)
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)) } catch { /* Memory cache remains available. */ }
}

export async function request<T>(path: string): Promise<Result<T>> {
  const cached = readCache<T>(path)
  if (cached && Date.now() - cached.saved < TTL) return { data: cached.data, stale: false }
  if (pending.has(path)) return pending.get(path) as Promise<Result<T>>
  const job = (async (): Promise<Result<T>> => {
    try {
      if (Date.now() < blockedUntil) throw new GithubError(429, blockedUntil)
      const response = await fetch(`https://api.github.com${path}`, {
        headers: { Accept: 'application/vnd.github+json' }, signal: AbortSignal.timeout(15000),
      })
      if (!response.ok) {
        const reset = Number(response.headers.get('x-ratelimit-reset')) * 1000
        if (response.status === 429 || (response.status === 403 && response.headers.get('x-ratelimit-remaining') === '0')) {
          blockedUntil = reset > Date.now() ? reset : Date.now() + 60000
          throw new GithubError(429, blockedUntil)
        }
        throw new GithubError(response.status)
      }
      const data = await response.json() as T
      writeCache(path, { data, saved: Date.now() })
      return { data, stale: false }
    } catch (error) {
      // A 404 is authoritative: do not resurrect a deleted repository or README.
      if (cached && !(error instanceof GithubError && error.status === 404)) return { data: cached.data, stale: true }
      throw error
    }
  })()
  pending.set(path, job as Promise<Result<unknown>>)
  try { return await job } finally { pending.delete(path) }
}

const repoPath = (name: string) => `/repos/${profile.github}/${encodeURIComponent(name)}`
export const getRepository = (name: string) => request<Repository>(repoPath(name))
export const getReadme = (name: string) => request<Readme>(`${repoPath(name)}/readme`)
export const getLanguages = (name: string) => request<Record<string, number>>(`${repoPath(name)}/languages`)

export async function getRepositories(): Promise<Result<Repository[]>> {
  const repos: Repository[] = []
  let stale = false
  let partial = false
  for (let page = 1; ; page++) {
    let result: Result<Repository[]>
    try { result = await request<Repository[]>(`/users/${profile.github}/repos?per_page=100&sort=updated&page=${page}`) }
    catch (error) { if (!repos.length) throw error; partial = true; break }
    stale ||= result.stale
    repos.push(...result.data)
    if (result.data.length < 100) break
  }
  const included: Repository[] = []
  for (const repo of repos) {
    if (!repo.fork) { included.push(repo); continue }
    try {
      const detail = await getRepository(repo.name)
      const own = await getReadme(repo.name)
      stale ||= detail.stale || own.stale
      if (!detail.data.parent) { partial = true; continue }
      let upstream: Result<Readme>
      try { upstream = await request<Readme>(`/repos/${detail.data.parent.full_name}/readme`) }
      catch (error) {
        if (error instanceof GithubError && error.status === 404) { included.push(repo); continue }
        throw error
      }
      stale ||= upstream.stale
      if (own.data.sha !== upstream.data.sha) included.push(repo)
    } catch (error) {
      if (!(error instanceof GithubError && error.status === 404)) partial = true
    }
  }
  return { data: included.sort((a, b) => b.updated_at.localeCompare(a.updated_at)), stale, partial }
}

export function decodeReadme(readme: Readme) {
  if (readme.encoding !== 'base64') throw new Error('Unsupported README encoding')
  return new TextDecoder().decode(Uint8Array.from(atob(readme.content.replace(/\s/g, '')), c => c.charCodeAt(0)))
}

export function safeHttpUrl(url: string | null | undefined) {
  if (!url) return undefined
  try { const parsed = new URL(url); return ['https:', 'http:'].includes(parsed.protocol) ? parsed.href : undefined } catch { return undefined }
}

export function resolveReadmeUrl(url: string, repo: Repository, path: string, image: boolean): string {
  if (!url || url.startsWith('#')) return url
  if (/^(https?:\/\/|\/\/)/i.test(url)) return url
  if (!image && /^mailto:/i.test(url)) return url
  if (/^[a-z][a-z\d+.-]*:/i.test(url)) return ''
  const branch = encodeURIComponent(repo.default_branch)
  const directory = path.includes('/') ? path.slice(0, path.lastIndexOf('/') + 1) : ''
  const host = image ? 'raw.githubusercontent.com' : 'github.com'
  const segment = image ? '' : 'blob/'
  const base = `https://${host}/${repo.full_name}/${segment}${branch}/`
  // A leading slash is interpreted as relative to this repository's root.
  return new URL(url.replace(/^\//, ''), url.startsWith('/') ? base : base + directory).href
}

export function findDemo(markdown: string): string | undefined {
  const links = markdown.matchAll(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/gi)
  for (const [, label, url] of links) {
    if (/\b(demo|live|website|try it)\b/i.test(label)) return safeHttpUrl(url)
  }
  return undefined
}
