import React from 'react'

interface UpcomingTalkProps {
  title?: string
  presenter: string
  event: string
  eventUrl?: string
  location: string
  date: string
}

export const UpcomingTalk: React.FC<UpcomingTalkProps> = ({ title, presenter, event, eventUrl, location, date }) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-gradient-to-r from-quint-purple/5 to-primary-400/5 dark:from-quint-purple/10 dark:to-primary-400/10 p-6 rounded-xl shadow-sm border border-quint-purple/20 dark:border-primary-400/20">
        <div className="text-center">
          {title && <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">{title}</h3>}
          <p className="text-gray-600 dark:text-gray-300 mb-2">
            <span className="font-medium">{presenter}</span> at{' '}
            {eventUrl ? (
              <a
                href={eventUrl}
                className="text-quint-purple dark:text-primary-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {event}
              </a>
            ) : (
              event
            )}
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">📍 {location}</p>
          <time className="inline-block text-sm text-quint-purple dark:text-primary-400 bg-quint-purple/10 dark:bg-primary-400/10 px-3 py-1 rounded-full font-medium">
            {date}
          </time>
        </div>
      </div>
    </div>
  )
}
