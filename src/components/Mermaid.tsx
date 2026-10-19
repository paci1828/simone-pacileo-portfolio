import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../lib/theme'
import s from '../App.module.css'
// Mermaid has shared configuration. Serialize render jobs across component instances.
let queue: Promise<unknown> = Promise.resolve()
export default function Mermaid({ source }: { source: string }) {
  const { t } = useTranslation()
  const { theme } = useTheme()
  const id = useId().replace(/[^a-z0-9]/gi, '')
  const [result, setResult] = useState<{ svg?: string; error?: boolean }>({})
  useEffect(() => {
    let active = true
    setResult({})
    queue = queue.catch(() => {}).then(async () => {
      const { default: mermaid } = await import('mermaid')
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: theme === 'dark' ? 'dark' : 'neutral', maxTextSize: 40000, maxEdges: 300, suppressErrorRendering: true })
      try {
        const { svg } = await mermaid.render(`mermaid-${id}`, source)
        if (active) setResult({ svg })
      } catch { if (active) setResult({ error: true }) }
    }).catch(() => { if (active) setResult({ error: true }) })
    return () => { active = false }
  }, [source, theme, id])
  if (result.error) return <div className={s.notice}><p>{t('detail.diagramError')}</p><pre><code>{source}</code></pre></div>
  return <figure className={s.mermaid}>
    {result.svg ? <div role="img" aria-label={t('detail.diagram')} dangerouslySetInnerHTML={{ __html: result.svg }}/> : <pre aria-busy="true"><code>{source}</code></pre>}
    <details><summary>{t('detail.diagramSource')}</summary><pre><code>{source}</code></pre></details>
  </figure>
}
