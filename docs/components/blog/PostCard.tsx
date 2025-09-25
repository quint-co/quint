import Link from 'next/link'
import React from 'react'

interface PostCardProps {
  route: string
  title: string
  excerpt: string
  date?: string
  coverImage?: string
}

export const PostCard: React.FC<PostCardProps> = ({ route, title, excerpt, date, coverImage }) => {
  return (
    <Link href={route} className="text-quint-purple dark:text-quint-purple font-medium">
      <article className="group relative bg-white dark:bg-gray-900 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-800 max-w-2xl mx-auto mb-8">
        <div className="flex flex-col">
          {coverImage && (
            <div className="w-full overflow-hidden rounded-t-lg">
              <img src={coverImage} alt={`Cover image for ${title}`} className="w-full object-contain" />
            </div>
          )}

          <div className="p-4 text-center">
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-quint-purple dark:group-hover:text-quint-purple transition-colors">
              {title}
            </h3>

            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{excerpt}</p>

            {date ? (
              <time
                dateTime={new Date(date).toISOString()}
                className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full"
              >
                {new Date(date).toLocaleDateString('en', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-full">
                Coming soon!
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
