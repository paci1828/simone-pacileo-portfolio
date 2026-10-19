import CvLink from '../components/CvLink'
import { Linkedin } from '../components/BrandIcons'
import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowRight, ArrowUpRight, Braces, Check, Database, GraduationCap, Layers3, MapPin, Server, Terminal, Mail } from 'lucide-react'
import Projects from '../components/Projects'
import profile from '../data/profile.json'
import experience from '../data/experience.json'
import skills from '../data/skills.json'
import s from '../App.module.css'

function BackendVisual() {
  const { t } = useTranslation()
  return <div className={s.backendVisual}>
    <div className={s.visualLabel}><span className={s.liveDot}/>{t('hero.codeLabel')}<span>01 — JAVA</span></div>
    <div className={s.codeWindow}>
      <div className={s.codeTop}><span className={s.windowDots}><i/><i/><i/></span><span><Braces size={14}/> IdeaController.java</span><span>Java 17</span></div>
      <div className={s.codeContent} aria-hidden="true">
        <div><em>01</em><span className={s.codeComment}>// A little structure. A lot of possibilities.</span></div>
        <div><em>02</em><span className={s.codeAccent}>@RestController</span></div>
        <div><em>03</em><span><b>public class</b> <strong>IdeaController</strong> {'{'}</span></div>
        <div><em>04</em><span> </span></div>
        <div><em>05</em><span>  <span className={s.codeAccent}>@GetMapping</span>(<q>/ideas</q>)</span></div>
        <div><em>06</em><span>  <b>public</b> List&lt;Idea&gt; <strong>build</strong>() {'{'}</span></div>
        <div><em>07</em><span>    <b>return</b> ideas.<strong>findAll</strong>();</span></div>
        <div><em>08</em><span>  {'}'}</span></div>
        <div><em>09</em><span>{'}'}</span></div>
      </div>
      <div className={s.codeBottom}><span><span className={s.liveDot}/> Spring Boot</span><span><Check size={13}/> REST API</span></div>
    </div>
    <div className={s.architecture} aria-label={t('hero.architectureNote')}>
      <div><Terminal size={20}/><span>{t('hero.client')}</span></div><span className={s.connector}><ArrowRight size={16}/></span><div className={s.architectureMain}><Server size={20}/><span>{t('hero.service')}</span></div><span className={s.connector}><ArrowRight size={16}/></span><div><Database size={20}/><span>{t('hero.data')}</span></div>
    </div>
    <div className={s.visualCaption}><span>{t('hero.architecture')}</span><span>REQUEST → RESPONSE</span></div>
  </div>
}

export default function Home() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language === 'en' ? 'en' : 'it'
  const location = useLocation()
  useEffect(() => {
    document.title = 'Simone Pacileo Portfolio | Java Backend Developer'
    const id = location.hash.slice(1)
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    else window.scrollTo(0, 0)
  }, [location.key])
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        entry.target.animate([{ opacity: .3, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 550, easing: 'ease-out' })
        observer.unobserve(entry.target)
      }
    }, { threshold: .08 })
    document.querySelectorAll('#main > section:not(:first-child)').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])
  const formatDate = (date: string) => new Intl.DateTimeFormat(lang, { month: 'short', year: 'numeric' }).format(new Date(`${date}-01T12:00:00`))
  return <>
    <section id="home" className={`${s.container} ${s.hero}`}>
      <div className={s.heroCopy}>
        <div className={s.eyebrow}><span className={s.shortLine}/>{t('hero.eyebrow')}</div>
        <p className={s.hello}>{t('hero.hello')}</p>
        <h1>Simone<br/>Pacileo<span>.</span></h1>
        <h2>{t('hero.title')}</h2>
        <p className={s.heroIntro}>{t('hero.intro')}</p>
        <div className={s.heroActions}><Link className={s.primaryButton} to="/#projects">{t('hero.projects')}<ArrowUpRight size={18}/></Link><CvLink label={t('hero.cv')} /></div>
        <div className={s.heroMeta}><span><MapPin size={14}/>{t('hero.location')}</span><span><span className={s.liveDot}/>{t('hero.current')}</span></div>
      </div>
      <BackendVisual />
      <div className={s.heroBottom}><span>{t('hero.scroll')}</span><Link to="/#projects" aria-label={t('hero.projects')}><ArrowDown size={18}/></Link><span>JAVA · SPRING BOOT · MICROSERVICES</span></div>
    </section>
    <Projects />
    <section id="about" className={`${s.container} ${s.about} ${s.section}`}>
      <div className={s.aboutText}><p className={s.eyebrow}>{t('about.eyebrow')}</p><h2 className={s.sectionTitle}>{t('about.title')}</h2><p>{profile.bio[lang]}</p><p>{profile.approach[lang]}</p>
        <div className={s.education}><GraduationCap size={24}/><div><span className={s.smallLabel}>{t('about.education')}</span><h3>{profile.education[lang]}</h3><p>{profile.education.institution}</p><span className={s.mono}>{profile.education.period}</span></div></div>
        <CvLink label={t('about.cv')} textOnly />
      </div>
      <div className={s.stackPanel}><div className={s.stackHeading}><Layers3 size={21}/><h3>{t('about.stack')}</h3></div>{skills.map((group, index) => <div key={group.en} className={s.skillGroup}><span className={s.smallLabel}>0{index + 1} / {group[lang]}</span><div>{group.items.map(skill => <span className={s.skill} key={skill}>{skill}</span>)}</div></div>)}</div>
    </section>
    <section id="experience" className={s.experienceSection}><div className={`${s.container} ${s.experienceLayout}`}>
      <div><p className={s.eyebrow}>{t('experience.eyebrow')}</p><h2 className={s.sectionTitle}>{t('experience.title')}</h2><p className={s.sectionIntro}>{t('experience.intro')}</p><div className={s.experienceDecoration} aria-hidden="true"><Braces size={56} strokeWidth={1}/><span>Always learning.<br/>Always building.</span></div></div>
      <div className={s.timeline}>{experience.map(item => <article className={s.experienceItem} key={item.company}><span className={`${s.timelineDot} ${!item.end ? s.currentDot : ''}`}/><div className={s.experienceDate}><span>{formatDate(item.start)} — {item.end ? formatDate(item.end) : t('experience.present')}</span>{!item.end && <span className={s.currentBadge}>{t('experience.current')}</span>}</div><h3>{item.company}</h3><h4>{item.role[lang]}</h4><p>{item.description[lang]}</p><div className={s.tags}>{item.tags.map(tag => <span key={tag}>{tag}</span>)}</div></article>)}</div>
    </div></section>
    <section id="contact" className={`${s.container} ${s.contactSection}`}><div className={s.contactBox}>
      <div><p className={s.eyebrow}>{t('contact.eyebrow')}</p><h2>{t('contact.title')}</h2><p>{t('contact.intro')}</p><a className={s.contactEmail} href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={25}/></a></div>
      <div className={s.contactActions}><span className={s.contactSymbol} aria-hidden="true">{'{ }'}</span><a href={`mailto:${profile.email}`}><Mail size={18}/>{t('contact.email')}<ArrowUpRight size={17}/></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={18}/>{t('contact.linkedin')}<ArrowUpRight size={17}/></a></div>
    </div></section>
  </>
}


