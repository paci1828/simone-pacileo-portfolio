import { Github, Linkedin } from './components/BrandIcons'
import { lazy, Suspense, useEffect, useState, Component, type ReactNode, type ErrorInfo } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Menu, Moon, Sun, X, ArrowUp } from 'lucide-react'
import { useTheme } from './lib/theme'
import { savePreference } from './i18n'
import profile from './data/profile.json'
import s from './App.module.css'
const Home = lazy(() => import('./pages/Home'))
const Project = lazy(() => import('./pages/Project'))

function Header() {
  const { t, i18n } = useTranslation()
  const { theme, toggle } = useTheme()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('home')
  const ids = ['home', 'projects', 'about', 'experience', 'contact']
  useEffect(() => { setOpen(false) }, [location])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => {
    const update = () => {
      if (location.pathname !== '/') { setActive('projects'); return }
      let selected = 'home'
      for (const id of ids) { const el = document.getElementById(id); if (el && el.getBoundingClientRect().top <= 160) selected = id }
      setActive(selected === 'experience' ? 'about' : selected)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [location.pathname])
  return <header className={s.header}>
    <div className={s.headerInner}>
      <Link className={s.brand} to="/#home" aria-label="sp. simone pacileo Java Backend Developer — Home"><span className={s.mark}>sp<span>.</span></span><span className={s.brandName}>simone pacileo<span>Java Backend Developer</span></span></Link>
      <nav id="main-navigation" aria-label={t('nav.home')} className={`${s.nav} ${open ? s.navOpen : ''}`}>
        {ids.filter(id => id !== 'experience').map(id => <Link key={id} to={`/#${id}`} className={active === id ? s.navActive : ''} aria-current={active === id ? 'location' : undefined}>{t(`nav.${id}`)}</Link>)}
      </nav>
      <div className={s.headerControls}>
        <div className={s.language} role="group" aria-label={t('nav.language')}>
          {['it', 'en'].map(lng => <button key={lng} type="button" aria-pressed={i18n.language === lng} onClick={() => { void i18n.changeLanguage(lng); savePreference('sp-language', lng) }}>{lng.toUpperCase()}</button>)}
        </div>
        <button className={s.iconButton} type="button" onClick={toggle} aria-label={t('nav.theme', { theme: t(`nav.${theme === 'light' ? 'dark' : 'light'}`) })}>{theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}</button>
        <button type="button" className={`${s.iconButton} ${s.menuButton}`} aria-label={t(open ? 'nav.close' : 'nav.open')} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button>
      </div>
    </div>
  </header>
}

function NotFound() {
  const { t } = useTranslation()
  return <div className={`${s.container} ${s.notFound}`}><span className={s.eyebrow}>404</span><h1>{t('detail.notFoundPage')}</h1><Link className={s.primaryButton} to="/">{t('detail.home')} <ArrowUpRight size={18}/></Link></div>
}

class Boundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error('Portfolio rendering error', error, info.componentStack) }
  render() {
    if (this.state.failed) return <div className={s.notFound}><p>Impossibile aprire la pagina / Unable to open this page.</p><button className={s.primaryButton} onClick={() => window.location.reload()}>Ricarica / Reload</button></div>
    return this.props.children
  }
}

export default function App() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  useEffect(() => {
    document.documentElement.lang = i18n.language
    const content = i18n.language === 'it' ? 'Simone Pacileo, sviluppatore backend Java a Milano. Esperienze, Spring Boot, microservizi e progetti open source da GitHub.' : 'Simone Pacileo, Java backend developer in Milan. Experience, Spring Boot, microservices and open-source GitHub projects.'
    document.querySelector('meta[name="description"]')?.setAttribute('content', content)
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', i18n.language === 'it' ? 'it_IT' : 'en_GB')
  }, [i18n.language])
  return <>
    <a className={s.skip} href="#main" onClick={e => { e.preventDefault(); document.getElementById('main')?.focus() }}>{t('nav.skip')}</a>
    <Header />
    <main id="main" tabIndex={-1}>
      <Boundary key={location.pathname}><Suspense fallback={<div className={s.routeLoading} role="status">{t('projects.loading')}</div>}><Routes>
        <Route path="/" element={<Home />} />
        <Route path="/progetti/:name" element={<Project />} />
        <Route path="*" element={<NotFound />} />
      </Routes></Suspense></Boundary>
    </main>
    <footer className={s.footer}><div className={s.container}>
      <div className={s.footerTop}><Link className={s.footerBrand} to="/#home">simone pacileo<span>.</span></Link><div className={s.footerLinks}>
        <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={19}/></a>
        <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={19}/></a>
        <Link to="/#home" aria-label={t('contact.back')}><ArrowUp size={19}/></Link>
      </div></div>
      <div className={s.footerBottom}><span>© {new Date().getFullYear()} {profile.name}. {t('footer.rights')}</span><span>{t('footer.made')}</span><a href={`mailto:${profile.email}`}>{profile.email}</a></div>
    </div></footer>
  </>
}


