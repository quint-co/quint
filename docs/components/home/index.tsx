import { Code, Pre } from "nextra/components"

import React from "react";
import { useState } from 'react'
import { useTheme } from 'nextra-theme-docs'
import CodeSample from './code_sample.mdx'
import ViolationSample from './violation_sample.mdx'

import Image from 'next/image'

function informalSystemsLogo() {
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

const components = {
  pre: Pre,
  code: Code,
}

export function Home() {
  const [isViolationVisible, setViolationVisible] = useState(false);

  const handleToggleVisibility = () => {
    setViolationVisible(true);
  };

  return (<div>
    <section className="relative py-12 sm:py-16 lg:pb-80">
      <div className="absolute bottom-0 right-0 overflow-hidden">
        <img className="h-full w-auto origin-bottom-right transform lg:w-auto lg:mx-auto lg:object-cover" src="./background-pattern-gradient-mini.png" alt="" />
      </div>

      <div className="relative px-4 mx-auto max-w-7xl sm:px-6 lg:px-2">
        <h1 className="text-4xl text-center font-bold leading-tight text-inherit sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">Quint</h1>
        <h2 className="text-quint-purple text-2xl text-center font-bold leading-tight sm:text-2xl sm:leading-tight lg:text-3xl lg:leading-tight font-pj">A modern and executable specification language</h2>
        <div className="grid grid-cols-1 py-8 gap-y-4 lg:mt-8 lg:items-start lg:grid-cols-2 xl:grid-cols-2">
          <div className="xl:col-span-1 lg:text-left text-center md:px-16 lg:px-0 xl:pr-20">
            <h3 className="text-2xl font-bold leading-relaxed">Executable</h3>
            <ul className="list-inside indent-4">
              <li>English and Markdown: not checked, not executable</li>
              <li className="font-bold">Quint: checked names and types, <a className="underline decoration-2 decoration-quint-purple">executable</a></li>
            </ul>
            <br />

            <h3 className="text-2xl font-bold leading-relaxed">Specification language</h3>
            <ul className="list-inside indent-4">
              <li>Programming languages: define how things happen in detail</li>
              <li className="font-bold">Specification languages: define only what you <a className="underline decoration-2 decoration-quint-purple">care</a> about</li>
            </ul>
            <br />

            <h3 className="text-2xl font-bold leading-relaxed">Modern</h3>
            <ul className="list-inside indent-4">
              <li>Existing specification languages: Mathy syntax, old GUI tools</li>
              <li className="font-bold">Quint: <a className="underline decoration-2 decoration-quint-purple">Familiar</a> syntax, CLI-first, tools for VSCode, Vim and Emacs</li>
            </ul>

            <a href="/docs/getting-started" title="" className="inline-flex px-8 py-4 mt-8 text-lg font-bold transition-all duration-200 bg-quint-purple text-white rounded sm:mt-10 font-pj hover:bg-[#2d0075] hover:text-quint-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" role="button">
              Get started
            </a>

            <div className="mt-8 mb-8 flex justify-center lg:justify-start">
              {informalSystemsLogo()}
            </div>
          </div>

          <div className="xl:col-span-1 text-lg">
            <CodeSample components={components} />
            <div className="flex justify-center">
              <button onClick={handleToggleVisibility} className={`transition-all duration-500 ease-out overflow-hidden ${isViolationVisible ? 'hidden' : 'visible'} inline-flex px-4 py-2 font-bold transition-all duration-200 bg-quint-purple text-white rounded font-pj hover:bg-[#2d0075] hover:text-quint-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}>
                Find bug
              </button>
            </div>
            <div className={`transition-all duration-1000 ease-out overflow-hidden ${isViolationVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'}`} >
              <ViolationSample components={components} />
            </div>
          </div>
        </div>
      </div>
    </section >
  </div >

  )
}
