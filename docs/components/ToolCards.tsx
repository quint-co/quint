const tools = [
  {
    title: 'Quint LLM Kit',
    href: 'https://github.com/informalsystems/quint-llm-kit',
    description: (
      <>
        AI agents and commands that help you generate and iterate on Quint specs.
        Run <code className="text-sm bg-gray-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded">/spec:next</code> to
        get guided suggestions at any point in your journey.
      </>
    ),
  },
  {
    title: 'Quint Connect',
    href: 'https://github.com/informalsystems/quint-connect',
    description:
      'Model-based testing framework for Rust. Automatically validate your implementation against your Quint spec by replaying generated test traces.',
  },
  {
    title: 'Quint Trace Explorer',
    href: 'https://github.com/informalsystems/quint-trace-explorer',
    description:
      'Terminal UI for navigating execution traces. Highlights state changes to make it easy to understand what has happened.',
  },
]

export function ToolCards() {
  return (
    <div className="not-prose grid gap-6 mt-8 sm:grid-cols-3">
      {tools.map((tool) => (
        <a
          key={tool.title}
          href={tool.href}
          target="_blank"
          rel="noreferrer"
          className="group rounded-xl border border-gray-200 dark:border-neutral-700 p-6 transition hover:border-quint-purple hover:shadow-lg"
        >
          <h3 className="text-xl font-semibold group-hover:text-quint-purple transition">
            {tool.title}
          </h3>
          <p className="mt-2 text-zinc-600 dark:text-zinc-300">
            {tool.description}
          </p>
        </a>
      ))}
    </div>
  )
}
