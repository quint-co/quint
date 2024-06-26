import React from "react";
import { useTheme } from 'nextra-theme-docs'

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
        <h1 className="text-4xl font-bold leading-tight text-inherit sm:text-5xl sm:leading-tight lg:text-6xl lg:leading-tight font-pj">Quint: A modern and executable specification language</h1>
        <div className="grid grid-cols-1 gap-y-4 lg:items-center lg:grid-cols-2 xl:grid-cols-2">
          <div className="text-center xl:col-span-1 lg:text-left md:px-16 lg:px-0 xl:pr-20 my-8">
            <dl>
              <dt>A simple and familiar <strong>syntax</strong></dt>
              <dd>to support engineers reading and writing specifications</dd>

              <dt>An expressive <strong>type system</strong></dt>
              <dd>to ensure the domain model is coherent</dd>

              <dt>A novel <strong>effect system</strong></dt>
              <dd>to ensure state updates are coherent</dd>

              <dt><strong>IDE support</strong> via LSP</dt>
              <dd>giving real time feedback when writing specifications</dd>

              <dt>A <strong>REPL</strong></dt>
              <dd>enabling interactive exploration of specifications</dd>

              <dt>A <strong>simulator</strong></dt>
              <dd>enabling tests, trace generation, and exploration of your system</dd>

              <dt>A symbolic <strong>model checker</strong></dt>
              <dd>to verify your specifications via <a href="https://github.com/informalsystems/apalache">Apalache</a></dd>
            </dl>
            {/* <p className="mt-2 text-lg text-gray-600 sm:mt-6 font-inter">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vehicula massa in enim luctus. Rutrum arcu.</p> */}

            <a href="#" title="" className="inline-flex px-8 py-4 mt-8 text-lg font-bold transition-all duration-200 bg-quint-purple text-white border border-transparent rounded sm:mt-10 font-pj hover:bg-[#2d0075] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900" role="button">
              Get started
            </a>

            <div className="mt-8 sm:mt-16">
              {informalSystemsLogo()}

              {/* <blockquote className="mt-6">
                <p className="text-lg font-bold text-gray-900 font-pj">Best code editor in market!</p>
                <p className="mt-3 text-base leading-7 text-gray-600 font-inter">Consectetur adipiscing elit. Vehicula massa in enim luctus. Rutrum arcu, aliquam nulla tincidunt gravida. Cursus convallis dolor semper pretium ornare.</p>
              </blockquote>

              <div className="flex items-center justify-center mt-3 lg:justify-start">
                <img className="flex-shrink-0 object-cover w-6 h-6 overflow-hidden rounded-full" src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/avatar-female.png" alt="" />
                <p className="ml-2 text-base font-bold text-gray-900 font-pj">Denny Jones</p>
              </div> */}
            </div>
          </div>

          <div className="xl:col-span-1">
            <img className="w-full mx-auto" src="https://cdn.rareblocks.xyz/collection/clarity/images/hero/1/illustration.png" alt="" />
          </div>
        </div>
      </div>
    </section>
  </div >

  )
}
