import React from 'react'
import Link from 'next/link'

/**
 * Type describing a single Quint project use‑case.
 */
export type Project = {
  name: string
  owner?: string
  authors: string[]
  /** Short, one‑sentence summary. */
  description: string
  /** Primary repository URL (if there is one). */
  repo?: string
  /** Additional links: blog‑posts, talks, etc. */
  links?: { label: string; url: string }[]
}

/** Grid of cards showcasing Quint projects. */
export const ProjectsGridCompact: React.FC<{ projects: Project[] }> = ({ projects }) => {
  // Sort projects alphabetically by name (case‑insensitive), but keep "[Your Project Here]" last
  const sorted = [...projects].sort((a, b) => {
    const aIsSpecial = a.name === '[Your Project Here]'
    const bIsSpecial = b.name === '[Your Project Here]'
    if (aIsSpecial && !bIsSpecial) return 1
    if (!aIsSpecial && bIsSpecial) return -1
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  })

  return (
    <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mt-6">
      {sorted.map(p => (
        <article
          key={p.name}
          className="flex flex-col text-center rounded-2xl bg-quint-purple/10 p-6 hover:scale-[1.02] dark:border-primary-700/40 dark:bg-primary-400/10 dark:shadow-none dark:ring-primary-700/40 dark:hover:ring-primary-600/60"
        >
          {/* Header */}
          <header className="mb-4 space-y-1">
            <h3 className="text-lg font-semibold leading-tight text-quint-purple dark:text-primary-100">{p.name}</h3>
            {p.name === '[Your Project Here]' ? (
              <p className="text-sm font-medium x:text-gray-800 dark:text-gray-200">Tell us about it!</p>
            ) : p.owner && (
              <p className="text-sm font-medium x:text-gray-800 dark:text-gray-200">{p.owner}</p>
            )}
          </header>

          {/* Links */}
          <div className="mt-auto items-center gap-2 text-sm">
            {p.repo && (
              <Link
                href={p.repo}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 font-medium text-quint-purple transition hover:bg-primary-100"
              >
                Repo
              </Link>
            )}
            {p.links?.map(l => (
              <Link
                key={l.url}
                href={l.url}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-2 py-1 font-medium text-quint-purple transition hover:bg-primary-100 "
              >
                {l.label}
              </Link>
            ))}
          </div>
        </article>
      ))}
    </div>
  )
}
