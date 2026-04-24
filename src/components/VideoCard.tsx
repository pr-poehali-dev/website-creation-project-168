import { Video, formatViews, timeAgo } from '@/lib/store';
import Icon from '@/components/ui/icon';

interface VideoCardProps {
  video: Video;
  onClick: (id: string) => void;
  horizontal?: boolean;
}

export default function VideoCard({ video, onClick, horizontal = false }: VideoCardProps) {
  const initials = video.authorName.charAt(0).toUpperCase();

  if (horizontal) {
    return (
      <div
        className="flex gap-3 cursor-pointer group hover:bg-accent rounded-lg p-2 transition-all"
        onClick={() => onClick(video.id)}
      >
        <div className="relative flex-shrink-0 w-40 rounded-lg overflow-hidden bg-secondary">
          <div className="video-thumb w-full" style={{ aspectRatio: '16/9', background: '#1a1a2e' }}>
            {video.thumbnail ? (
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="Play" size={24} className="text-muted-foreground" />
              </div>
            )}
          </div>
          {video.isAdult && (
            <span className="absolute top-1 right-1 text-[10px] bg-red-600 text-white px-1 rounded font-bold">18+</span>
          )}
          <span className="absolute bottom-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded">{video.duration}</span>
        </div>
        <div className="flex flex-col justify-start min-w-0">
          <p className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">{video.title}</p>
          <p className="text-xs text-muted-foreground mt-1">{video.authorName}</p>
          <p className="text-xs text-muted-foreground">{formatViews(video.views)} просм. · {timeAgo(video.createdAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="cursor-pointer group video-card"
      onClick={() => onClick(video.id)}
    >
      <div className="relative rounded-xl overflow-hidden bg-secondary mb-3">
        <div style={{ aspectRatio: '16/9', background: '#111' }}>
          {video.thumbnail ? (
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Icon name="Play" size={40} className="text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="video-thumb-overlay absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 transition-opacity duration-200">
          <div className="w-12 h-12 rounded-full bg-black/60 flex items-center justify-center">
            <Icon name="Play" size={20} className="text-white ml-0.5" />
          </div>
        </div>
        {video.isAdult && (
          <span className="absolute top-2 right-2 text-xs bg-red-600 text-white px-2 py-0.5 rounded font-bold">18+</span>
        )}
        <span className="absolute bottom-2 right-2 text-xs bg-black/80 text-white px-1.5 py-0.5 rounded">{video.duration}</span>
      </div>
      <div className="flex gap-2">
        <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white"
          style={{ backgroundColor: stringToColor(video.authorName) }}>
          {video.authorAvatar ? (
            <img src={video.authorAvatar} className="w-full h-full object-cover rounded-full" alt="" />
          ) : initials}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm line-clamp-2 leading-snug">{video.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{video.authorName}</p>
          <p className="text-xs text-muted-foreground">{formatViews(video.views)} просм. · {timeAgo(video.createdAt)}</p>
        </div>
      </div>
    </div>
  );
}

function stringToColor(str: string): string {
  const colors = ['#e53935', '#8e24aa', '#1e88e5', '#00897b', '#f4511e', '#6d4c41', '#546e7a', '#2e7d32'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
