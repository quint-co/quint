import { Code, Pre } from "nextra/components"

import React from "react";
import { useState, useEffect } from 'react'
import { useTheme } from 'nextra-theme-docs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import CodeSample from './code_sample.mdx'
import ViolationSample from './violation_sample.mdx'

import Image from 'next/image'

import { classNames } from "./classNames";
import { ProsOrConsList } from "./ProsOrConsList";

const benefits = [
  [
    "Executable",
    ["Quint", ["checked names and types", "executable"]],
    ["English & Markdown", ["not checked", "not executable"]],
  ],
  [
    "Abstract",
    ["Specification Languages", ["define only what you care about"]],
    ["Programming Languages", ["define how things happen, in detail"]],
  ],
  [
    "Modern",
    ["Quint", ["familiar syntax", "CLI and your editor"]],
    ["Existing Spec Languages", ["math-y syntax", "old GUI tools"]],
  ],
] as const;


function informalSystemsLogo() {
  const { resolvedTheme } = useTheme();
  const [theme, setTheme] = useState(null);
    useEffect(() => {
    setTheme(resolvedTheme);
  }, [resolvedTheme]);

  return (
    <a href="https://informal.systems">
      <Image src={theme == "dark" ? "/informal-systems-white.png" : "/informal-systems.png"} alt="Informal Systems" width={200} height={200} />
    </a>
  )
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
              <a href="/docs/getting-started" title="" className="inline-flex px-8 py-4 mt-8 text-lg font-bold transition-all duration-200 bg-quint-purple text-black rounded sm:mt-10 font-pj hover:bg-[#2d0075] hover:text-quint-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" role="button">
                Get started
              </a>
            </div>
          </div>

          <div className="xl:col-span-1 text-lg">
            <CodeSample components={components} />
            <div className="flex justify-center">
              <button onClick={handleToggleVisibility} className={`transition-all duration-500 ease-out overflow-hidden ${isViolationVisible ? 'hidden' : 'visible'} inline-flex px-4 py-2 font-bold transition-all duration-200 bg-quint-purple text-black rounded font-pj hover:bg-[#2d0075] hover:text-quint-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900`}>
                Find bug
              </button>
            </div>
            <div className={`transition-all duration-1000 ease-out overflow-hidden ${isViolationVisible ? 'opacity-100 max-h-screen' : 'opacity-0 max-h-0'}`} >
              <ViolationSample components={components} />
            </div>
          </div>
        </div>

        <div className="mt-8 mb-8 flex justify-center">
          {informalSystemsLogo()}
        </div>
      </div>
    </section >
  </div >

  )
}
