'use client'

import { Code, Pre } from 'nextra/components'

import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import CodeSample from './code_sample.mdx'
import ViolationSample from './violation_sample.mdx'

import { Button } from '../atomic-ui-elements/button'
import { NewsletterSignupBanner } from '../NewsletterSignupBanner'
import { classNames } from './classNames'
import { ProsOrConsList } from './ProsOrConsList'

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
    setViolationVisible(true)
  }

  return (
    <div className="overflow-x-hidden">
      <section className="relative py-12 sm:py-16 lg:pb-1">
        <div className="relative px-4 mx-auto max-w-7xl sm:px-8 xl:px-12">
          <h1 className="text-4xl text-center font-bold leading-tight text-inherit sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">
            Quint
          </h1>
          <h2 className="text-quint-purple text-2xl text-center font-bold leading-tight sm:text-2xl sm:leading-tight lg:text-3xl lg:leading-tight font-pj">
            A modern and executable specification language
          </h2>
          <div className="grid grid-cols-1 py-8 gap-y-4 gap-x-8 lg:mt-8 lg:items-start lg:grid-cols-2 xl:grid-cols-2">
            <div className="xl:col-span-1">
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

              <div className="mt-4 mb-8 flex justify-center">
                <Button as="a" href="/docs/getting-started" className="mt-8 sm:mt-10" role="button" variant="primary">
                  Get started
                </Button>
              </div>
            </div>

            <div className="xl:col-span-1 text-lg">
              <CodeSample components={components} />
              <div className="flex justify-center">
                <Button
                  style={{
                    display: isViolationVisible ? 'none' : 'inline-flex',
                  }}
                  className="mt-8 sm:mt-10"
                  as="button"
                  variant="secondary"
                  onClick={handleToggleVisibility}
                >
                  Find bug
                </Button>
              </div>
              <div
                className={`transition-all duration-1000 ease-out overflow-hidden ${
                  isViolationVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'
                }`}
              >
                <ViolationSample components={components} />
              </div>
            </div>
          </div>

          <NewsletterSignupBanner />
        </div>
      </section>
    </div>
  )
}
