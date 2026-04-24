import { useState, useEffect } from 'react';
import { setState, Video } from '@/lib/store';
import { useStore } from '@/hooks/useStore';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import VideoCard from '@/components/VideoCard';
import VideoPlayer from '@/components/VideoPlayer';
import AuthModal from '@/components/AuthModal';
import UploadModal from '@/components/UploadModal';
import AccountsPanel from '@/components/AccountsPanel';
import ProfilePage from '@/pages/ProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import Icon from '@/components/ui/icon';

type Page = 'home' | 'catalog' | 'search' | 'subscriptions' | 'history' | 'profile' | 'favorites' | 'settings' | 'upload';

export default function Index() {
  const state = useStore();
  const currentUser = state.currentUserId ? state.users.find(u => u.id === state.currentUserId) || null : null;

  const [page, setPage] = useState<Page>('home');
  const [watchingId, setWatchingId] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('Все');

  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  function handleNav(p: string, videoId?: string) {
    if (p === 'watch' && videoId) { setWatchingId(videoId); return; }
    if (p === 'upload') {
      if (!currentUser) { setShowAuth(true); return; }
      setShowUpload(true);
      return;
    }
    setPage(p as Page);
    setWatchingId(null);
  }

  function handleWatch(id: string) { setWatchingId(id); }
  function handleSearch(q: string) { setSearchQuery(q); setPage('search'); setWatchingId(null); }

  const watchingVideo = watchingId ? state.videos.find(v => v.id === watchingId) : null;
  const CATEGORIES = ['Все', 'Музыка', 'Игры', 'Новости', 'Спорт', 'Образование', 'Технологии', 'Развлечения'];

  function getFilteredVideos(vids: Video[]) {
    if (category === 'Все') return vids;
    return vids.filter(v =>
      v.tags.some(t => t.toLowerCase().includes(category.toLowerCase())) ||
      v.title.toLowerCase().includes(category.toLowerCase())
    );
  }

  function renderContent() {
    if (page === 'profile') return (
      <ProfilePage currentUser={currentUser} onAuth={() => setShowAuth(true)} onWatch={handleWatch} onShowAccounts={() => setShowAccounts(true)} />
    );
    if (page === 'settings') return <SettingsPage />;

    if (page === 'search') {
      const results = state.videos.filter(v =>
        v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.authorName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return (
        <div className="px-4 py-6 animate-fade-in">
          <p className="text-muted-foreground text-sm mb-4">
            Результаты: <span className="text-foreground font-medium">"{searchQuery}"</span> · {results.length} видео
          </p>
          {results.length === 0 ? (
            <Empty icon="SearchX" text="Ничего не найдено" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {results.map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
            </div>
          )}
        </div>
      );
    }

    if (page === 'subscriptions') {
      const subVideos = state.videos.filter(v => state.subscriptions.includes(v.authorId));
      return (
        <div className="px-4 py-6 animate-fade-in">
          <h1 className="text-xl font-bold mb-6">Подписки</h1>
          {!currentUser ? <EmptyAuth label="Войдите, чтобы увидеть подписки" onAuth={() => setShowAuth(true)} /> :
            subVideos.length === 0 ? <Empty icon="Users" text="Подпишитесь на каналы" /> :
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {subVideos.map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
              </div>}
        </div>
      );
    }

    if (page === 'history') {
      const histVids = state.history.map(id => state.videos.find(v => v.id === id)).filter(Boolean) as Video[];
      return (
        <div className="px-4 py-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold">История</h1>
            {histVids.length > 0 && <button onClick={() => setState(s => ({ ...s, history: [] }))} className="text-sm text-muted-foreground hover:text-foreground">Очистить</button>}
          </div>
          {!currentUser ? <EmptyAuth label="Войдите, чтобы видеть историю" onAuth={() => setShowAuth(true)} /> :
            histVids.length === 0 ? <Empty icon="Clock" text="История пуста" /> :
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {histVids.map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
              </div>}
        </div>
      );
    }

    if (page === 'favorites') {
      const favVids = state.favorites.map(id => state.videos.find(v => v.id === id)).filter(Boolean) as Video[];
      return (
        <div className="px-4 py-6 animate-fade-in">
          <h1 className="text-xl font-bold mb-6">Избранное</h1>
          {!currentUser ? <EmptyAuth label="Войдите, чтобы сохранять избранное" onAuth={() => setShowAuth(true)} /> :
            favVids.length === 0 ? <Empty icon="Heart" text="Нет избранных видео" /> :
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favVids.map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
              </div>}
        </div>
      );
    }

    if (page === 'catalog') {
      return (
        <div className="px-4 py-6 animate-fade-in">
          <h1 className="text-xl font-bold mb-4">Каталог</h1>
          <CategoryPills categories={CATEGORIES} active={category} onChange={setCategory} />
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {getFilteredVideos(state.videos).map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
          </div>
          {getFilteredVideos(state.videos).length === 0 && <Empty icon="Video" text="Нет видео в этой категории" />}
        </div>
      );
    }

    return (
      <div className="px-4 py-6 animate-fade-in">
        <div className="overflow-x-auto pb-2 mb-6">
          <CategoryPills categories={CATEGORIES} active={category} onChange={setCategory} />
        </div>
        {state.videos.length === 0 ? (
          <div className="text-center py-24">
            <Icon name="Video" size={56} className="text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Пока нет видео</h2>
            <p className="text-muted-foreground mb-6">Станьте первым!</p>
            <button onClick={() => currentUser ? setShowUpload(true) : setShowAuth(true)} className="px-6 py-2.5 rounded-full font-semibold text-white" style={{ backgroundColor: 'var(--yuvist-red)' }}>
              {currentUser ? 'Загрузить видео' : 'Войти и загрузить'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {getFilteredVideos(state.videos).map(v => <VideoCard key={v.id} video={v} onClick={handleWatch} />)}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        currentUser={currentUser}
        onAuth={() => setShowAuth(true)}
        onNav={handleNav}
        onSearch={handleSearch}
        onMenuToggle={() => setShowMobileMenu(true)}
      />

      <div className="flex pt-14 min-h-screen">
        <div className="hidden lg:block sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex-shrink-0">
          <Sidebar page={page} onNav={(p) => { setPage(p); setWatchingId(null); }} isLoggedIn={!!currentUser} />
        </div>
        <main className="flex-1 min-w-0">{renderContent()}</main>
      </div>

      {showMobileMenu && (
        <div className="fixed inset-0 z-50 flex" onClick={() => setShowMobileMenu(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative h-full" onClick={e => e.stopPropagation()}>
            <Sidebar page={page} onNav={(p) => { setPage(p); setWatchingId(null); setShowMobileMenu(false); }} isLoggedIn={!!currentUser} mobile onClose={() => setShowMobileMenu(false)} />
          </div>
        </div>
      )}

      {watchingVideo && (
        <VideoPlayer
          video={watchingVideo}
          currentUser={currentUser}
          onClose={() => setWatchingId(null)}
          onNav={handleNav}
          onAuth={() => setShowAuth(true)}
        />
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showUpload && currentUser && (
        <UploadModal currentUser={currentUser} onClose={() => setShowUpload(false)} onSuccess={(id) => { setShowUpload(false); setWatchingId(id); }} />
      )}
      {showAccounts && (
        <AccountsPanel onClose={() => setShowAccounts(false)} onAuth={() => { setShowAccounts(false); setShowAuth(true); }} />
      )}
    </div>
  );
}

function CategoryPills({ categories, active, onChange }: { categories: string[]; active: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {categories.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${active === c ? 'text-white' : 'bg-secondary border border-border hover:bg-accent'}`}
          style={active === c ? { backgroundColor: 'var(--yuvist-red)' } : {}}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-20">
      <Icon name={icon} size={48} className="text-muted-foreground mx-auto mb-3" fallback="Circle" />
      <p className="text-muted-foreground">{text}</p>
    </div>
  );
}

function EmptyAuth({ label, onAuth }: { label: string; onAuth: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <Icon name="Lock" size={40} className="text-muted-foreground" />
      <p className="text-muted-foreground text-sm">{label}</p>
      <button onClick={onAuth} className="px-6 py-2.5 rounded-full font-semibold text-white text-sm" style={{ backgroundColor: 'var(--yuvist-red)' }}>
        Войти
      </button>
    </div>
  );
}
