'use client'

import { useEffect } from 'react'

export function FAQBox({ title, children }) {
  const id = title.toLowerCase().replace(/[/?]/g, '').replace(/\s+/g, '-')
  useEffect(() => {
    const handleHashChange = () => {
      const element = document.getElementById(id)
      if (element && window.location.hash === `#${id}` && 'open' in element) {
        element.open = true
        element.scrollIntoView()
      }
    }

    const handleAnchorClick = event => {
      const anchor = event.target.closest('a')
      if (anchor && anchor.hash === `#${id}`) {
        const element = document.getElementById(id)
        if (element && 'open' in element) {
          element.open = true
          element.scrollIntoView()
        }
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    document.addEventListener('click', handleAnchorClick)
    handleHashChange()

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
      document.removeEventListener('click', handleAnchorClick)
    }
  }, [id])

  return (
    <details
      className="last-of-type:mb-0 rounded-lg bg-neutral-50 dark:bg-neutral-800 p-2 mt-4"
      id={id}
      onClick={() => {
        window.history.pushState({}, '', `#${id}`)
      }}
    >
      <summary>
        <strong className="text-lg">{title}</strong>
      </summary>
      <div className="nx-p-2">{children}</div>
    </details>
  )
}
