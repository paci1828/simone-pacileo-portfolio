import { lazy, Suspense, isValidElement, type ReactElement, type ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import { decodeReadme, resolveReadmeUrl, type Readme, type Repository } from '../lib/github'
import s from '../App.module.css'
const Mermaid = lazy(() => import('./Mermaid'))
const schema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), ['className', /^language-./]],
    img: [...(defaultSchema.attributes?.img || []), 'width', 'height'],
  },
}
export default function ReadmeView({ readme, repo }: { readme: Readme; repo: Repository }) {
  return <div className={s.markdown}><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, [rehypeSanitize, schema], [rehypeSlug, { prefix: 'readme-' }]]}
    urlTransform={(url, key) => resolveReadmeUrl(url, repo, readme.path, key === 'src')}
    components={{
      a: ({ node: _node, href, children, ...props }) => <a {...props} href={href} onClick={event => {
        if (!href?.startsWith('#')) return
        event.preventDefault()
        let fragment = href.slice(1)
        try { fragment = decodeURIComponent(fragment) } catch { /* Keep literal malformed fragments. */ }
        const target = document.getElementById('readme-' + fragment) || document.getElementById('user-content-' + fragment) || document.getElementById(fragment)
        target?.scrollIntoView()
      }} target={href?.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer">{children}</a>,
      img: ({ node: _node, ...props }) => <img {...props} alt={props.alt || repo.name} loading="lazy" decoding="async"/>,
      pre: ({ node: _node, children, ...props }) => {
        const child = children as ReactElement<{ className?: string; children?: ReactNode }>
        if (isValidElement(child) && /language-mermaid/.test(child.props.className || '')) return <Suspense fallback={<pre>{child.props.children}</pre>}><Mermaid source={String(child.props.children).trim()}/></Suspense>
        return <pre {...props}>{children}</pre>
      },
    }}
  >{decodeReadme(readme)}</ReactMarkdown></div>
}

