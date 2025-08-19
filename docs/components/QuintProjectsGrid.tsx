import React from 'react'
import Link from 'next/link'

/**
 * Type describing a single Quint project use‑case.
 */
export type Project = {
  name: string
  owner: string
  authors: string[]
  /** Short, one‑sentence summary. */
  description: string
  /** Primary repository URL (if there is one). */
  repo?: string
  /** Additional links: blog‑posts, talks, etc. */
  links?: { label: string; url: string }[]
}

/** Grid of cards showcasing Quint projects. */
export const QuintProjectsGrid: React.FC<{ projects: Project[] }> = ({ projects }) => {
  // Sort projects alphabetically by name (case‑insensitive)
  const sorted = [...projects].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }))

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
      {sorted.map(p => (
        <article
          key={p.name}
          className="flex flex-col rounded-2xl bg-quint-purple/10 p-6 dark:border-primary-700/40 dark:bg-primary-400/10 dark:shadow-none dark:ring-primary-700/40 dark:hover:ring-primary-600/60"
        >
          {/* Header */}
          <header className="mb-4 space-y-1">
            <h3 className="text-lg font-semibold leading-tight text-quint-purple dark:text-primary-100">{p.name}</h3>
            <p className="text-sm font-medium x:text-gray-800 dark:text-gray-200">protocol by {p.owner}</p>
            {p.authors.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400">specification by {p.authors.join(', ')}</p>
            )}
          </header>

          {/* Description */}
          <p className="mb-4 text-sm leading-relaxed text-gray-700 dark:text-gray-300">{p.description}</p>

          {/* Links */}
          <div className="mt-auto flex flex-wrap gap-2 text-sm">
            {p.repo && (
              <Link
                href={p.repo}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-1 py-1 font-medium text-quint-purple transition hover:bg-primary-100"
              >
                Repo
              </Link>
            )}
            {p.links?.map(l => (
              <Link
                key={l.url}
                href={l.url}
                target="_blank"
                className="inline-flex items-center gap-1 rounded-md bg-primary-50 px-1 py-1 font-medium text-quint-purple transition hover:bg-primary-100 "
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
