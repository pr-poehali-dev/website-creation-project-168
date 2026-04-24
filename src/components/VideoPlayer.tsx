import { useState, useRef, useEffect } from 'react';
import { Video, Comment, User, getState, setState, generateId, formatViews, timeAgo, censorText } from '@/lib/store';
import { useStore } from '@/hooks/useStore';
import Icon from '@/components/ui/icon';

interface VideoPlayerProps {
  video: Video;
  currentUser: User | null;
  onClose: () => void;
  onNav: (page: string, videoId?: string) => void;
  onAuth: () => void;
}

export default function VideoPlayer({ video, currentUser, onClose, onNav, onAuth }: VideoPlayerProps) {
  const state = useStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [comment, setComment] = useState('');
  const [showShare, setShowShare] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [sponsored, setSponsored] = useState(false);
  const viewCounted = useRef(false);

  const v = state.videos.find(x => x.id === video.id) || video;
  const isLiked = currentUser ? state.likedVideos.includes(v.id) : false;
  const isDisliked = currentUser ? state.dislikedVideos.includes(v.id) : false;
  const isFav = currentUser ? state.favorites.includes(v.id) : false;
  const isOwner = currentUser?.id === v.authorId;
  const authorUser = state.users.find(u => u.id === v.authorId);
  const isSubscribed = currentUser && state.subscriptions.includes(v.authorId);

  useEffect(() => {
    if (viewCounted.current) return;
    viewCounted.current = true;

    setState(s => {
      const viewKey = currentUser ? `${currentUser.id}:${video.id}` : `guest:${video.id}`;
      const alreadyViewed = s.viewedVideos.includes(viewKey);
      return {
        ...s,
        videos: alreadyViewed
          ? s.videos
          : s.videos.map(x => x.id === video.id ? { ...x, views: x.views + 1 } : x),
        viewedVideos: alreadyViewed ? s.viewedVideos : [...s.viewedVideos, viewKey],
        history: currentUser
          ? [video.id, ...s.history.filter(id => id !== video.id)].slice(0, 100)
          : s.history,
      };
    });
  }, []);

  function togglePlay() {
    if (!videoRef.current) return;
    if (playing) videoRef.current.pause();
    else videoRef.current.play();
    setPlaying(!playing);
  }

  function handleProgress() {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
    setProgress(videoRef.current.currentTime / videoRef.current.duration * 100 || 0);
  }

  function handleSeek(e: React.ChangeEvent<HTMLInputElement>) {
    if (!videoRef.current) return;
    const val = Number(e.target.value);
    videoRef.current.currentTime = val / 100 * duration;
    setProgress(val);
  }

  function handleVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) videoRef.current.volume = val;
  }

  function handleLike() {
    if (!currentUser) { onAuth(); return; }
    setState(s => {
      const liked = s.likedVideos.includes(v.id);
      const disliked = s.dislikedVideos.includes(v.id);
      return {
        ...s,
        likedVideos: liked ? s.likedVideos.filter(id => id !== v.id) : [...s.likedVideos, v.id],
        dislikedVideos: disliked ? s.dislikedVideos.filter(id => id !== v.id) : s.dislikedVideos,
        videos: s.videos.map(x => x.id === v.id ? {
          ...x,
          likes: liked ? x.likes - 1 : x.likes + 1,
          dislikes: disliked ? x.dislikes - 1 : x.dislikes,
        } : x)
      };
    });
  }

  function handleDislike() {
    if (!currentUser) { onAuth(); return; }
    setState(s => {
      const liked = s.likedVideos.includes(v.id);
      const disliked = s.dislikedVideos.includes(v.id);
      return {
        ...s,
        dislikedVideos: disliked ? s.dislikedVideos.filter(id => id !== v.id) : [...s.dislikedVideos, v.id],
        likedVideos: liked ? s.likedVideos.filter(id => id !== v.id) : s.likedVideos,
        videos: s.videos.map(x => x.id === v.id ? {
          ...x,
          dislikes: disliked ? x.dislikes - 1 : x.dislikes + 1,
          likes: liked ? x.likes - 1 : x.likes,
        } : x)
      };
    });
  }

  function handleFav() {
    if (!currentUser) { onAuth(); return; }
    setState(s => ({
      ...s,
      favorites: isFav ? s.favorites.filter(id => id !== v.id) : [...s.favorites, v.id]
    }));
  }

  function handleSubscribe() {
    if (!currentUser) { onAuth(); return; }
    setState(s => ({
      ...s,
      subscriptions: isSubscribed
        ? s.subscriptions.filter(id => id !== v.authorId)
        : [...s.subscriptions, v.authorId],
      users: s.users.map(u => u.id === v.authorId
        ? { ...u, subscribers: isSubscribed ? u.subscribers - 1 : u.subscribers + 1 }
        : u
      )
    }));
  }

  function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUser) { onAuth(); return; }
    if (!comment.trim()) return;
    const c: Comment = {
      id: generateId(),
      authorId: currentUser.id,
      authorName: currentUser.username,
      authorAvatar: currentUser.avatar,
      text: censorText(comment.trim()),
      createdAt: new Date().toISOString(),
    };
    setState(s => ({
      ...s,
      videos: s.videos.map(x => x.id === v.id ? { ...x, comments: [...x.comments, c] } : x)
    }));
    setComment('');
  }

  function deleteComment(cid: string) {
    setState(s => ({
      ...s,
      videos: s.videos.map(x => x.id === v.id
        ? { ...x, comments: x.comments.filter(c => c.id !== cid) }
        : x)
    }));
  }

  function deleteVideo() {
    setState(s => ({ ...s, videos: s.videos.filter(x => x.id !== v.id) }));
    onClose();
  }

  function handleShare() {
    const url = window.location.href + '?v=' + v.id;
    if (navigator.clipboard) navigator.clipboard.writeText(url);
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000);
  }

  function createPlaylist() {
    if (!currentUser || !playlistName.trim()) return;
    setState(s => ({
      ...s,
      playlists: [...s.playlists, {
        id: generateId(),
        name: playlistName.trim(),
        authorId: currentUser.id,
        videoIds: [v.id],
        createdAt: new Date().toISOString(),
      }]
    }));
    setPlaylistName('');
    setShowPlaylistModal(false);
  }

  function addToPlaylist(pid: string) {
    setState(s => ({
      ...s,
      playlists: s.playlists.map(p => p.id === pid
        ? { ...p, videoIds: p.videoIds.includes(v.id) ? p.videoIds : [...p.videoIds, v.id] }
        : p
      )
    }));
    setShowPlaylistModal(false);
  }

  const myPlaylists = currentUser ? state.playlists.filter(p => p.authorId === currentUser.id) : [];
  const related = state.videos.filter(x => x.id !== v.id).slice(0, 6);

  function fmt(s: number) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <button
          onClick={onClose}
          className="flex items-center gap-2 mb-4 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Icon name="ArrowLeft" size={18} />
          Назад
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <div className="relative bg-black rounded-2xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
              {v.url ? (
                <video
                  ref={videoRef}
                  src={v.url}
                  className="w-full h-full"
                  onTimeUpdate={handleProgress}
                  onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                  onEnded={() => setPlaying(false)}
                  onClick={togglePlay}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {v.thumbnail && <img src={v.thumbnail} className="w-full h-full object-cover" alt="" />}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <p className="text-white text-sm">Видео недоступно</p>
                  </div>
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full range-slider mb-3 cursor-pointer"
                  style={{ accentColor: 'var(--yuvist-red)' }}
                />
                <div className="flex items-center gap-3">
                  <button onClick={togglePlay} className="text-white hover:text-red-400 transition-colors">
                    <Icon name={playing ? 'Pause' : 'Play'} size={22} />
                  </button>
                  <span className="text-xs text-white/70">{fmt(currentTime)} / {fmt(duration)}</span>
                  <div className="flex items-center gap-1 ml-auto">
                    <Icon name="Volume2" size={16} className="text-white/70" />
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={volume}
                      onChange={handleVolume}
                      className="w-20 range-slider cursor-pointer"
                      style={{ accentColor: 'var(--yuvist-red)' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h1 className="text-lg font-bold leading-snug">{v.title}</h1>
                  <p className="text-sm text-muted-foreground mt-1">{formatViews(v.views)} просмотров · {timeAgo(v.createdAt)}</p>
                </div>
                {v.isAdult && (
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-bold">18+</span>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white cursor-pointer overflow-hidden"
                    style={{ backgroundColor: '#e53935' }}
                  >
                    {v.authorAvatar ? (
                      <img src={v.authorAvatar} className="w-full h-full object-cover" alt="" />
                    ) : v.authorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{v.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {authorUser ? formatViews(authorUser.subscribers) : 0} подписчиков
                    </p>
                  </div>
                  {!isOwner && (
                    <button
                      onClick={handleSubscribe}
                      className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${isSubscribed ? 'bg-secondary text-foreground' : 'text-white'}`}
                      style={!isSubscribed ? { backgroundColor: 'var(--yuvist-red)' } : {}}
                    >
                      {isSubscribed ? 'Отписаться' : 'Подписаться'}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center rounded-full bg-secondary border border-border overflow-hidden">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors ${isLiked ? 'text-red-500' : ''}`}
                    >
                      <Icon name="ThumbsUp" size={16} />
                      {formatViews(v.likes)}
                    </button>
                    <div className="w-px h-6 bg-border" />
                    <button
                      onClick={handleDislike}
                      className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium hover:bg-accent transition-colors ${isDisliked ? 'text-blue-400' : ''}`}
                    >
                      <Icon name="ThumbsDown" size={16} />
                      {formatViews(v.dislikes)}
                    </button>
                  </div>
                  <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary border border-border text-sm hover:bg-accent transition-all relative">
                    <Icon name="Share2" size={16} />
                    <span className="hidden sm:inline">Поделиться</span>
                    {showShare && (
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-secondary border border-border text-xs px-2 py-1 rounded whitespace-nowrap">
                        Ссылка скопирована!
                      </span>
                    )}
                  </button>
                  <button onClick={handleFav} className={`p-2 rounded-full bg-secondary border border-border hover:bg-accent transition-all ${isFav ? 'text-red-500' : ''}`}>
                    <Icon name="Heart" size={16} />
                  </button>
                  <button onClick={() => { if (!currentUser) { onAuth(); return; } setShowPlaylistModal(true); }} className="p-2 rounded-full bg-secondary border border-border hover:bg-accent transition-all">
                    <Icon name="ListPlus" size={16} />
                  </button>
                  {isOwner && (
                    <button
                      onClick={deleteVideo}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-600/10 border border-red-600/30 text-red-500 text-sm hover:bg-red-600/20 transition-all"
                    >
                      <Icon name="Trash2" size={16} />
                      <span className="hidden sm:inline">Удалить</span>
                    </button>
                  )}
                </div>
              </div>

              {v.description && (
                <div className="mt-4 p-4 bg-secondary rounded-xl text-sm text-muted-foreground">
                  {v.description}
                </div>
              )}

              {!isOwner && (
                <div className="mt-4 rounded-xl border border-yellow-500/30 overflow-hidden">
                  <button
                    onClick={() => { if (!currentUser) { onAuth(); return; } setSponsored(!sponsored); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold text-yellow-400 hover:text-yellow-300 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors"
                  >
                    <Icon name="Star" size={16} />
                    Спонсировать автора
                    <Icon name={sponsored ? 'ChevronUp' : 'ChevronDown'} size={15} />
                  </button>
                  {sponsored && (
                    <div className="p-4 bg-yellow-500/5 border-t border-yellow-500/20 flex flex-col items-center gap-3 animate-fade-in">
                      {authorUser?.donateQr ? (
                        <>
                          <p className="text-xs text-muted-foreground">Отсканируйте QR-код для перевода автору</p>
                          <img src={authorUser.donateQr} alt="QR-код для доната" className="w-36 h-36 object-contain rounded-xl bg-white p-2" />
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground py-2">Автор ещё не добавил QR-код для донатов</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-semibold mb-4">Комментарии · {v.comments.length}</h3>
                {currentUser ? (
                  <form onSubmit={handleComment} className="flex gap-3 mb-6">
                    <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ backgroundColor: '#e53935' }}>
                      {currentUser.avatar ? <img src={currentUser.avatar} className="w-full h-full object-cover" alt="" /> : currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 flex gap-2">
                      <input
                        type="text"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        placeholder="Написать комментарий..."
                        className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                      />
                      <button type="submit" className="px-4 py-2 rounded-lg text-white text-sm font-medium" style={{ backgroundColor: 'var(--yuvist-red)' }}>
                        <Icon name="Send" size={16} />
                      </button>
                    </div>
                  </form>
                ) : (
                  <button onClick={onAuth} className="mb-4 text-sm text-muted-foreground hover:text-foreground underline">
                    Войдите, чтобы оставить комментарий
                  </button>
                )}
                <div className="space-y-4">
                  {v.comments.map(c => (
                    <div key={c.id} className="flex gap-3 group">
                      <div className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white overflow-hidden" style={{ backgroundColor: '#e53935' }}>
                        {c.authorAvatar ? <img src={c.authorAvatar} className="w-full h-full object-cover" alt="" /> : c.authorName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{c.authorName}</span>
                          <span className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</span>
                        </div>
                        <p className="text-sm mt-0.5 break-words">{c.text}</p>
                      </div>
                      {(currentUser?.id === c.authorId || isOwner) && (
                        <button
                          onClick={() => deleteComment(c.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-muted-foreground hover:text-red-400"
                        >
                          <Icon name="X" size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-80 xl:w-96 flex-shrink-0">
            <h3 className="font-semibold mb-3 text-sm">Похожие видео</h3>
            <div className="space-y-1">
              {related.map(rv => (
                <div
                  key={rv.id}
                  className="flex gap-3 cursor-pointer hover:bg-secondary rounded-lg p-2 transition-all group"
                  onClick={() => onNav('watch', rv.id)}
                >
                  <div className="relative w-36 flex-shrink-0 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
                    {rv.thumbnail ? (
                      <img src={rv.thumbnail} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Icon name="Play" size={20} className="text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 text-[10px] bg-black/80 text-white px-1 rounded">{rv.duration}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium line-clamp-2 leading-snug">{rv.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{rv.authorName}</p>
                    <p className="text-xs text-muted-foreground">{formatViews(rv.views)} просм.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showPlaylistModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4" onClick={() => setShowPlaylistModal(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Добавить в плейлист</h3>
            {myPlaylists.length > 0 && (
              <div className="space-y-2 mb-4">
                {myPlaylists.map(p => (
                  <button key={p.id} onClick={() => addToPlaylist(p.id)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-sm">
                    {p.name} ({p.videoIds.length} видео)
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Новый плейлист..."
                value={playlistName}
                onChange={e => setPlaylistName(e.target.value)}
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none"
              />
              <button onClick={createPlaylist} className="px-3 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: 'var(--yuvist-red)' }}>
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}