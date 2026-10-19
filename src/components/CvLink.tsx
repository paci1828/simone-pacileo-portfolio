import { ArrowDownToLine } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import profile from '../data/profile.json'
import s from '../App.module.css'
export default function CvLink({ label, textOnly = false }: { label: string; textOnly?: boolean }) {
  const { t } = useTranslation()
  const className = textOnly ? s.textLink : s.secondaryButton
  if (!profile.cvAvailable) return <span className={className + ' ' + s.disabledLink} aria-disabled="true" title={t('hero.cvPending')}>{t('hero.cvPending')}<ArrowDownToLine size={17}/></span>
  return <a className={className} href={import.meta.env.BASE_URL + profile.cv} download>{label}<ArrowDownToLine size={17}/></a>
}
