import React from 'react'

interface VideoEmbedProps {
  videoId: string
  title: string
  presenter: string
  event: string
  date: string
  platform?: 'youtube' | 'spotify'
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  videoId,
  title,
  presenter,
  event,
  date,
  platform = 'youtube',
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="bg-quint-purple/10 dark:bg-primary-400/10 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              <span className="font-medium">{presenter}</span> at {event}
            </p>
          </div>
          <time className="text-sm text-gray-800 dark:text-gray-200 bg-quint-purple/20 dark:bg-primary-400/20 px-3 py-1 rounded-full ml-4 flex-shrink-0">
            {date}
          </time>
        </div>

        {platform === 'spotify' ? (
          <iframe
            style={{ borderRadius: '12px' }}
            src={`https://open.spotify.com/embed/episode/${videoId}?utm_source=generator`}
            width="100%"
            height="352"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        ) : (
          <div className="relative aspect-video">
            <iframe
              className="absolute inset-0 w-full h-full rounded-lg"
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${title} - ${presenter}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
      </div>
    </div>
  )
}
