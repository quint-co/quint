import React from "react";
import { useTheme } from 'nextra-theme-docs'
import CodeSample from './code_sample.mdx'
import ViolationSample from './violation_sample.mdx'

import Image from 'next/image'

function informalSystemsLogo () {
    const { resolvedTheme } = useTheme()
    if (resolvedTheme == "dark") {
      return (
        <Image src="/informal-systems-white.png" alt="Informal Systems" width={200} height={200} />
      );
    } else {
      return (
        <Image src="/informal-systems.png" alt="Informal Systems" width={200} height={200} />
      );
  }

}
export function Home() {
  return (<div>
    <section className="relative py-12 sm:py-16 lg:pb-40 ">
      <div className="absolute bottom-0 right-0 overflow-hidden">
        <img className="w-full h-auto origin-bottom-right transform scale-150 lg:w-auto lg:mx-auto lg:object-cover lg:scale-75" src="./background-pattern-gradient-mini.png" alt="" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <h1 className="text-4xl text-center font-bold leading-tight text-inherit sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">Quint</h1>
        <h2 className="text-quint-purple text-2xl text-center font-bold leading-tight sm:text-2xl sm:leading-tight lg:text-3xl lg:leading-tight font-pj">A modern and executable specification language</h2>
        <div className="grid grid-cols-1 py-8 gap-y-4 lg:items-center lg:grid-cols-2 xl:grid-cols-2">
          <div className="text-center xl:col-span-1 lg:text-left md:px-16 lg:px-0 xl:pr-20">
            <h3 className="text-2xl font-bold leading-relaxed">Executable</h3>
            <p className="text-lg">In contrast to specifications in <b>English and Markdown</b></p>
            <ul className="list-inside list-[square] indent-4">
              <li>English and Markdown: not executable</li>
              <li>Quint: executable</li>
            </ul>
            <br />

            <h3 className="text-2xl font-bold leading-relaxed">Specification language</h3>
            <p className="text-lg">In contrast to a <b>programming language</b></p>
            <ul className="list-inside list-[square] indent-4">
              <li>Programming language: define how things happen in detail</li>
              <li>Specification language: define only what you care about</li>
            </ul>
            <br />

            <h3 className="text-2xl font-bold leading-relaxed">Modern</h3>
            <p className="text-lg">In contrast to many <b>existing specification languages</b></p>
            <ul className="list-inside list-[square] indent-4">
              <li>Existing languages: Mathy syntax, old GUI tools</li>
              <li>Quint: Familiar syntax, CLI-first, tools for VSCode, Vim and Emacs</li>
            </ul>

            <a href="/docs/getting-started" title="" className="inline-flex px-8 py-4 mt-8 text-lg font-bold transition-all duration-200 bg-quint-purple text-white rounded sm:mt-10 font-pj hover:bg-[#2d0075] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" role="button">
              Get started
            </a>

            <div className="mt-8 sm:mt-16">
              {informalSystemsLogo()}
            </div>
          </div>

          <div className="xl:col-span-1 text-lg">
            <CodeSample />
            <div className="flex justify-center">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 10L12 15L17 10" stroke="var(--shiki-color-text)" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <ViolationSample />
          </div>
        </div>
      </div>
    </section >
  </div >

  )
}
