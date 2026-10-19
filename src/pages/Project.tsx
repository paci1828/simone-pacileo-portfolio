import { Github } from '../components/BrandIcons'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUpRight, BookOpen, RotateCcw } from 'lucide-react'
import { getRepository, getReadme, getLanguages, GithubError, safeHttpUrl, findDemo, decodeReadme } from '../lib/github'
import { useLoad } from '../hooks/useLoad'
import ReadmeView from '../components/ReadmeView'
import { ApiNotice } from '../components/Projects'
import s from '../App.module.css'

export default function Project() {
  const { name = '' } = useParams()
  const { t } = useTranslation()
  const { data, error, loading, retry } = useLoad(`project:${name}`, async () => {
    const repo = await getRepository(name)
    const [readme, languages] = await Promise.allSettled([getReadme(name), getLanguages(name)])
    return { repo, readme, languages }
  })
  useEffect(() => { window.scrollTo(0, 0); document.title = `${name} | Simone Pacileo Portfolio` }, [name])
  const repo = data?.repo.data
  const readme = data?.readme.status === 'fulfilled' ? data.readme.value.data : undefined
  const readmeError = data?.readme.status === 'rejected' ? data.readme.reason : undefined
  const languages = data?.languages.status === 'fulfilled' ? data.languages.value.data : undefined
  const demo = safeHttpUrl(repo?.homepage) || (readme ? findDemo(decodeReadme(readme)) : undefined)
  const stale = data?.repo.stale || (data?.readme.status === 'fulfilled' && data.readme.value.stale) || (data?.languages.status === 'fulfilled' && data.languages.value.stale)
  return <div className={`${s.container} ${s.detailPage}`}>
    <Link className={s.textLink} to="/#projects"><ArrowLeft size={17}/>{t('detail.back')}</Link>
    {loading && <div role="status" className={s.detailLoading}><div className={s.skeleton}/><p>{t('detail.loading')}</p></div>}
    {!!error && <div className={s.notice} role="alert"><ApiNotice error={error} fallback={t(error instanceof GithubError && error.status === 404 ? 'detail.notFound' : 'detail.error')}/><button onClick={retry} className={s.secondaryButton}><RotateCcw size={16}/>{t('projects.retry')}</button></div>}
    {repo && <>
      <header className={s.projectHeader}><p className={s.eyebrow}>{t('detail.eyebrow')}</p><h1>{repo.name}</h1><p>{repo.description || t('projects.noDescription')}</p><div className={s.tags}>{repo.topics.map(topic => <span key={topic}>{topic}</span>)}</div><div className={s.heroActions}><a className={s.primaryButton} href={repo.html_url} target="_blank" rel="noopener noreferrer"><Github size={18}/>{t('detail.github')}<ArrowUpRight size={16}/></a>{demo && <a className={s.secondaryButton} href={demo} target="_blank" rel="noopener noreferrer">{t('detail.demo')}<ArrowUpRight size={16}/></a>}</div></header>
      {stale && <div className={s.notice} role="status">{t('detail.stale')}</div>}
      <div className={s.readmeHeader}><BookOpen size={18}/><h2>{t('detail.readme')}</h2><span>README</span></div>
      {readme && <ReadmeView repo={repo} readme={readme}/>}
      {readmeError && <div className={s.notice} role="status"><ApiNotice error={readmeError} fallback={t(readmeError instanceof GithubError && readmeError.status === 404 ? 'detail.missing' : 'detail.error')}/>{!(readmeError instanceof GithubError && readmeError.status === 404) && <button className={s.secondaryButton} onClick={retry}>{t('projects.retry')}</button>}<a className={s.textLink} href={repo.html_url} target="_blank" rel="noopener noreferrer">{t('detail.github')}<ArrowUpRight size={16}/></a></div>}
      <div className={s.projectLanguages}><h2>{t('detail.languages')}</h2>{languages ? <div className={s.tags}>{Object.keys(languages).map(language => <span key={language}>{language} <span className={s.languagePercent}>{Math.round(languages[language] / Object.values(languages).reduce((a, b) => a + b, 0) * 100)}%</span></span>)}</div> : <p>{t('detail.missingLanguages')}</p>}</div>
    </>}
  </div>
}

