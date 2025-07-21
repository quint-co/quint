import React from 'react'

interface PostMetaProps {
  date?: string
  authors?: Array<{ name: string }>
}

export const PostMeta: React.FC<PostMetaProps> = ({ date, authors }) => {
  const formatAuthors = () => {
    if (!authors || authors.length === 0) return null

    if (authors.length === 1) {
      return <span className="font-medium text-gray-800 dark:text-gray-200">{authors[0].name}</span>
    }

    return (
      <>
        {authors.slice(0, -1).map((author, index) => (
          <span key={index} className="font-medium text-gray-800 dark:text-gray-200">
            {author.name}
            {index < authors.length - 2 ? ', ' : ' '}
          </span>
        ))}
        <span>and </span>
        <span className="font-medium text-gray-800 dark:text-gray-200">{authors[authors.length - 1].name}</span>
      </>
    )
  }

  return (
    <div className="text-sm text-gray-600 dark:text-gray-400 mb-6 mt-3">
      <div className="flex flex-wrap items-baseline gap-1">
        {date && (
          <>
            <time dateTime={new Date(date).toISOString()} className="italic">
              {new Date(date).toLocaleDateString('en', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
            <span> • </span>
          </>
        )}
        <span className="text-gray-700 dark:text-gray-300">Written by: </span>
        {formatAuthors()}
      </div>
    </div>
  )
}
