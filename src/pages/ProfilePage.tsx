import { useState } from 'react';
import { User, setState, formatViews, timeAgo } from '@/lib/store';
import { useStore } from '@/hooks/useStore';
import VideoCard from '@/components/VideoCard';
import Icon from '@/components/ui/icon';

interface ProfilePageProps {
  currentUser: User | null;
  onAuth: () => void;
  onWatch: (id: string) => void;
  onShowAccounts: () => void;
}

export default function ProfilePage({ currentUser, onAuth, onWatch, onShowAccounts }: ProfilePageProps) {
  const state = useStore();
  const [editing, setEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    channelName: currentUser?.channelName || '',
    bio: currentUser?.bio || '',
    avatar: currentUser?.avatar || '',
    donateQr: currentUser?.donateQr || '',
  });
  const [qrFile, setQrFile] = useState<string | null>(currentUser?.donateQr || null);

  if (!currentUser) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
          <Icon name="User" size={32} className="text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">Войдите, чтобы открыть профиль</p>
        <button
          onClick={onAuth}
          className="px-6 py-2.5 rounded-full font-semibold text-white"
          style={{ backgroundColor: 'var(--yuvist-red)' }}
        >
          Войти
        </button>
      </div>
    );
  }

  const myVideos = state.videos.filter(v => v.authorId === currentUser.id);
  const totalViews = myVideos.reduce((sum, v) => sum + v.views, 0);
  const totalLikes = myVideos.reduce((sum, v) => sum + v.likes, 0);

  function handleQrFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const result = ev.target?.result as string;
      setQrFile(result);
      setForm(f => ({ ...f, donateQr: result }));
    };
    reader.readAsDataURL(file);
  }

  function saveProfile() {
    setState(s => ({
      ...s,
      users: s.users.map(u => u.id === currentUser.id
        ? { ...u, channelName: form.channelName, bio: form.bio, avatar: form.avatar, donateQr: form.donateQr }
        : u
      )
    }));
    setEditing(false);
  }

  function deleteChannel() {
    setState(s => ({
      ...s,
      users: s.users.filter(u => u.id !== currentUser.id),
      videos: s.videos.filter(v => v.authorId !== currentUser.id),
      currentUserId: null,
      savedAccounts: s.savedAccounts.filter(id => id !== currentUser.id),
    }));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-fade-in">
      <div className="bg-card border border-border rounded-2xl overflow-hidden mb-6">
        <div className="h-28 bg-gradient-to-r from-red-900/50 via-red-800/30 to-transparent" />
        <div className="px-6 pb-6 -mt-12">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div className="relative">
              <div
                className="w-20 h-20 rounded-full border-4 border-card flex items-center justify-center text-2xl font-bold text-white overflow-hidden"
                style={{ backgroundColor: '#e53935' }}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} className="w-full h-full object-cover" alt="" />
                ) : currentUser.username.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent transition-all"
              >
                <Icon name="Edit2" size={15} />
                Редактировать
              </button>
              <button
                onClick={onShowAccounts}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm font-medium hover:bg-accent transition-all"
              >
                <Icon name="RefreshCw" size={15} />
                Сменить аккаунт
              </button>
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-xl font-bold">{currentUser.channelName || currentUser.username}</h2>
            <p className="text-sm text-muted-foreground">@{currentUser.username} · {currentUser.email}</p>
            {currentUser.bio && <p className="text-sm mt-2">{currentUser.bio}</p>}
            <p className="text-sm text-muted-foreground mt-1">{formatViews(currentUser.subscribers)} подписчиков</p>
          </div>
        </div>
      </div>

      {editing && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 animate-fade-in">
          <h3 className="font-bold mb-4">Редактирование профиля</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Название канала</label>
              <input
                type="text"
                value={form.channelName}
                onChange={e => setForm({ ...form, channelName: e.target.value })}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">О себе</label>
              <textarea
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Ссылка на фото профиля</label>
              <input
                type="url"
                value={form.avatar}
                onChange={e => setForm({ ...form, avatar: e.target.value })}
                placeholder="https://..."
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
              />
              {form.avatar && (
                <img src={form.avatar} className="w-12 h-12 rounded-full mt-2 object-cover" alt="" />
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">QR-код для донатов</label>
              <input type="file" accept="image/*" id="qr-upload" onChange={handleQrFile} className="hidden" />
              {qrFile ? (
                <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-border">
                  <img src={qrFile} className="w-16 h-16 object-contain rounded-lg bg-white p-1" alt="QR" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">QR-код загружен</p>
                    <p className="text-xs text-muted-foreground">Будет показан под вашими видео</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setQrFile(null); setForm(f => ({ ...f, donateQr: '' })); }}
                    className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                  >
                    <Icon name="X" size={16} />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="qr-upload"
                  className="w-full flex items-center gap-3 p-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-red-500/50 hover:bg-secondary/50 transition-all"
                >
                  <Icon name="QrCode" size={22} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Загрузить QR-код</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG — скриншот QR вашего банка</p>
                  </div>
                </label>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={saveProfile}
                className="px-6 py-2.5 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--yuvist-red)' }}
              >
                Сохранить
              </button>
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-2.5 rounded-lg font-semibold bg-secondary border border-border hover:bg-accent"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{myVideos.length}</p>
          <p className="text-xs text-muted-foreground mt-1">Видео</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{formatViews(totalViews)}</p>
          <p className="text-xs text-muted-foreground mt-1">Просмотров</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-4 text-center">
          <p className="text-2xl font-bold">{formatViews(totalLikes)}</p>
          <p className="text-xs text-muted-foreground mt-1">Лайков</p>
        </div>
      </div>

      {myVideos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <h3 className="font-bold mb-4">Статистика канала</h3>
          <div className="space-y-3">
            {myVideos.sort((a, b) => b.views - a.views).map(v => (
              <div key={v.id} className="flex items-center gap-3 text-sm">
                <div className="w-16 flex-shrink-0 rounded-md overflow-hidden" style={{ aspectRatio: '16/9' }}>
                  {v.thumbnail ? <img src={v.thumbnail} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-secondary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium line-clamp-1">{v.title}</p>
                  <p className="text-xs text-muted-foreground">{timeAgo(v.createdAt)}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium">{formatViews(v.views)} просм.</p>
                  <p className="text-xs text-muted-foreground">{v.likes} 👍 · {v.dislikes} 👎</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-bold mb-4">Мои видео</h3>
        {myVideos.length === 0 ? (
          <p className="text-muted-foreground text-sm">Вы ещё не загрузили ни одного видео</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {myVideos.map(v => <VideoCard key={v.id} video={v} onClick={onWatch} />)}
          </div>
        )}
      </div>

      <div className="border-t border-border pt-6">
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <Icon name="Trash2" size={16} />
            Удалить канал
          </button>
        ) : (
          <div className="bg-red-950/30 border border-red-800/50 rounded-xl p-4">
            <p className="text-sm font-medium text-red-300 mb-3">Удалить канал и все видео? Это действие необратимо.</p>
            <div className="flex gap-3">
              <button onClick={deleteChannel} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                Удалить навсегда
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm hover:bg-accent transition-colors">
                Отмена
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}