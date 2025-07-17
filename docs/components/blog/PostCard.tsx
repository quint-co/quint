import Link from 'next/link'
import React from 'react'

interface PostCardProps {
  route: string
  title: string
  excerpt: string
  date?: string
}

export const PostCard: React.FC<PostCardProps> = ({ route, title, excerpt, date }) => {
  return (
    <Link href={route} className="text-quint-purple dark:text-quint-purple font-medium">
      <article className="group relative bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-800">
        <div className="flex flex-col items-center text-center">
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-quint-purple dark:group-hover:text-quint-purple transition-colors">
            {title}
          </h3>

          <p className="mb-6 text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
            {excerpt}
          </p>

          {date ? (
            <time
              dateTime={new Date(date).toISOString()}
              className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full"
            >
              {new Date(date).toLocaleDateString('en', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
              Coming soon!
            </span>
          )}
        </div>
      </article>
    </Link>
  )
}
