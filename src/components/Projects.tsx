import { Github } from './BrandIcons'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, ArrowRight, BookOpen, Search, SlidersHorizontal, Star, RotateCcw } from 'lucide-react'
import { getRepositories, GithubError } from '../lib/github'
import { useLoad } from '../hooks/useLoad'
import profile from '../data/profile.json'
import s from '../App.module.css'

export function ApiNotice({ error, fallback }: { error: unknown; fallback: string }) {
  const { t, i18n } = useTranslation()
  return <p>{error instanceof GithubError && error.status === 429 && error.reset ? t('projects.rate', { time: new Date(error.reset).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) }) : fallback}</p>
}

export default function Projects() {
  const { t, i18n } = useTranslation()
  const { data, error, loading, retry } = useLoad('repositories', getRepositories)
  const [query, setQuery] = useState('')
  const [technology, setTechnology] = useState('')
  const repos = data?.data || []
  const technologies = [...new Set(repos.flatMap(repo => [repo.language, ...(repo.topics || [])]).filter((value): value is string => !!value))].sort()
  const filtered = repos.filter(repo => repo.name.toLowerCase().includes(query.trim().toLowerCase()) && (!technology || repo.language === technology || (repo.topics || []).includes(technology)))
  return <section id="projects" className={s.projectsSection}><div className={s.container}>
    <div className={s.sectionHeading}><div><p className={s.eyebrow}>{t('projects.eyebrow')}</p><h2 className={s.sectionTitle}>{t('projects.title')}</h2><p className={s.sectionIntro}>{t('projects.intro')}</p></div><a className={s.textLink} href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer"><Github size={17}/>{t('projects.github')}<ArrowUpRight size={15}/></a></div>
    <div className={s.projectToolbar}>
      <label className={s.searchField}><Search size={18}/><span className={s.srOnly}>{t('projects.search')}</span><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('projects.search')}/></label>
      <label className={s.filterField}><SlidersHorizontal size={17}/><span className={s.srOnly}>{t('projects.filter')}</span><select value={technology} onChange={e => setTechnology(e.target.value)}><option value="">{t('projects.all')}</option>{technologies.map(tech => <option key={tech}>{tech}</option>)}</select></label>
      {!loading && !error && <span className={s.projectCount} aria-live="polite">{t('projects.count', { count: filtered.length })}</span>}
    </div>
    {loading && <div role="status"><span className={s.srOnly}>{t('projects.loading')}</span><div className={s.projectGrid}>{[1, 2, 3, 4].map(index => <div className={s.skeleton} key={index}/>)}</div></div>}
    {!!error && <div className={s.notice} role="alert"><ApiNotice error={error} fallback={t('projects.error')}/><button className={s.secondaryButton} onClick={retry}><RotateCcw size={16}/>{t('projects.retry')}</button><a className={s.textLink} href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer">GitHub<ArrowUpRight size={16}/></a></div>}
    {data?.stale && <div className={s.notice} role="status"><p>{t('projects.stale')}</p><button className={s.textLink} onClick={retry}>{t('projects.retry')}</button></div>}
    {data?.partial && <div className={s.notice} role="status"><p>{t('projects.partial')}</p><button className={s.textLink} onClick={retry}>{t('projects.retry')}</button></div>}
    {!loading && !error && (filtered.length ? <div className={s.projectGrid}>{filtered.map((repo, index) => <article key={repo.id} className={s.projectCard}>
      <div className={s.projectTop}><span className={s.repoIcon}><BookOpen size={22} strokeWidth={1.6}/></span><span className={s.projectNumber}>/{String(index + 1).padStart(2, '0')}</span><a href={repo.html_url} target="_blank" rel="noopener noreferrer" aria-label={t('projects.repository', { name: repo.name })}><Github size={19}/></a></div>
      <h3><Link className={s.projectLink} to={`/progetti/${encodeURIComponent(repo.name)}`}>{repo.name}<ArrowUpRight size={22}/></Link></h3>
      <p className={s.projectDescription}>{repo.description || t('projects.noDescription')}</p>
      <div className={s.tags}>{(repo.topics || []).slice(0, 5).map(topic => <span key={topic}>{topic}</span>)}</div>
      <div className={s.projectCardBottom}><div>{repo.language && <span className={s.repoLanguage}><i data-language={repo.language}/><span className={s.srOnly}>{t('projects.language')}: </span>{repo.language}</span>}<span className={s.repoStars} aria-label={`${t('projects.stars')}: ${repo.stargazers_count}`}><Star size={13}/>{repo.stargazers_count}</span></div><time dateTime={repo.updated_at} title={t('projects.updated')}>{t('projects.updated')} {new Date(repo.updated_at).toLocaleDateString(i18n.language, { month: 'short', year: 'numeric' })}</time></div>
      <span className={s.cardCta} aria-hidden="true">{t('projects.read')}<ArrowRight size={16}/></span>
    </article>)}</div> : <div className={s.empty}><Search size={28}/><p>{repos.length ? t('projects.empty') : t('projects.emptyAccount')}</p>{repos.length > 0 && <button className={s.secondaryButton} onClick={() => { setQuery(''); setTechnology('') }}>{t('projects.reset')}</button>}</div>)}
    {!loading && !error && <div className={s.sourceLabel}><span className={s.liveDot}/>{t('projects.source')}<span> / @{profile.github}</span></div>}
  </div></section>
}

