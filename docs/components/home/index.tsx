'use client'

import { Code, Pre } from 'nextra/components'
import Link from 'next/link'
import Image from 'next/image'

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useState } from 'react'
import CodeSample from './code_sample.mdx'
import ViolationSample from './violation_sample.mdx'

import { Button } from '../atomic-ui-elements/button'
import { NewsletterSignupBanner } from '../NewsletterSignupBanner'
import { classNames } from './classNames'
import { ProsOrConsList } from './ProsOrConsList'
import { ProjectsGridCompact } from './ProjectsGridCompact'
import { projects } from '../../data/projects'

const benefits = [
  [
    'Executable',
    ['Quint', ['checked names and types', 'executable']],
    ['English & Markdown', ['not checked', 'not executable']],
  ],
  [
    'Abstract',
    ['Quint', ['define only what matters']],
    ['Programming Languages', ['define how things happen, in detail']],
  ],
  [
    'Modern',
    ['Quint', ['familiar syntax', 'CLI and your editor']],
    ['Existing Spec Languages', ['math-y syntax', 'old GUI tools']],
  ],
] as const

const components = {
  pre: Pre,
  code: Code,
}

export function Home() {
  const [isViolationVisible, setViolationVisible] = useState(false)

  const handleToggleVisibility = () => {
    setViolationVisible(!isViolationVisible)
  }

  useEffect(() => {
    // Add gradient class to body on mount
    document.body.classList.add('gradient-bg')

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('gradient-bg')
    }
  }, [])

  return (
    <div className="overflow-x-hidden">
      <section className="relative py-12 sm:py-16 lg:pb-1">
        <div className="mx-auto max-w-8xl px-4">
          <div className="grid items-start gap-10 lg:grid-cols-1">
            <div className="relative z-10">
              <h1 className="text-4xl/tight sm:text-5xl/tight font-extrabold tracking-tight">Quint</h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-700 dark:text-primary-400">
                A modern and executable specification language
              </h2>
              <p className="mt-4 max-w-prose text-lg text-zinc-600 dark:text-zinc-300">
                Quint helps you write precise specifications and check them automatically. Find subtle bugs before they
                reach production.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Link
                  href="/docs/get-started"
                  className="relative inline-flex items-center gap-3 rounded-xl px-6 py-3 text-base font-semibold
                             text-white shadow-lg transition active:scale-[0.99]
                             bg-gradient-to-r from-quint-purple/50 to-quint-purple
                             hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  Get Started
                  <span className="rounded-full bg-white/20 px-2 py-1 text-xs">5‑min guide</span>
                </Link>
              </div>
            </div>
          </div>
          <div className="grid items-center mx-auto max-w-6xl gap-5 mt-6 xl:mt-1 xl:grid-cols-7">
            <div className="xl:col-span-2 mx-auto my-auto max-lg:hidden">
              <Image
                src="/logo-dark.svg"
                alt="Quint logo"
                width={300}
                height={300}
                className="opacity-80 dark:hidden"
              />
              <Image
                src="/logo-light.svg"
                alt="Quint logo"
                width={300}
                height={300}
                className="opacity-80 hidden dark:block"
              />
            </div>

            <div className="xl:col-span-5 ml-auto">
              <div className={classNames.container}>
                {benefits.map(([label, [prosLabel, pros], [consLabel, cons]]) => (
                  <div className={classNames.benefitContainer}>
                    <h1 className={classNames.benefitTitle}>
                      <div className={classNames.benefitIcon}>
                        <FontAwesomeIcon icon={faCheckCircle} />
                      </div>
                      {label}
                    </h1>

                    <div className={classNames.prosAndConsContainer}>
                      <ProsOrConsList items={pros} label={prosLabel} type="pro" />
                      <ProsOrConsList items={cons} label={consLabel} type="con" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="relative z-20 mx-auto max-w-8xl grid grid-cols-1 py-8 gap-y-4 gap-x-8 lg:mt-8 lg:items-start lg:grid-cols-3 xl:grid-cols-3">
            <div className="xl:col-span-2 text-lg">
              <CodeSample components={components} />
              <div
                className={`transition-all duration-1000 ease-out overflow-hidden ${
                  isViolationVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
                }`}
              >
                <ViolationSample components={components} />
              </div>
            </div>

            <div className="xl:col-span-1 text-lg relative isolate">
              <h2 className="relative z-10 text-4xl/tight sm:text-4xl/tight font-extrabold tracking-tight xl:mt-24">
                Can you spot the bug? Quint can
              </h2>
              <Button className="mt-8 sm:mt-10" as="button" variant="secondary" onClick={handleToggleVisibility}>
                {isViolationVisible ? 'Hide results' : 'Find bug'}
              </Button>
            </div>
          </div>
          <h2 className="text-4xl text-center font-bold mt-12 leading-tight">
            Quint is <span className="text-quint-purple">ready to use</span>
          </h2>
          <h3 className="text-lg text-center text-zinc-600 dark:text-zinc-300 mt-2">
            The following projects already have Quint specifications
          </h3>
          <ProjectsGridCompact projects={projects} />

          <div className="mt-6 text-center items-center gap-4">
            <Link
              href="/docs/use-cases"
              className="relative inline-flex items-center gap-3 rounded-xl px-6 py-3 text-base font-semibold
                             text-white shadow-lg transition active:scale-[0.99]
                             bg-gradient-to-r from-quint-purple/50 to-quint-purple
                             hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              Detailed List
            </Link>
          </div>

          <NewsletterSignupBanner />
        </div>
      </section>
    </div>
  )
}
