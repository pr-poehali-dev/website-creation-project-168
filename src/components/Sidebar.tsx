import Icon from '@/components/ui/icon';

type Page = 'home' | 'catalog' | 'search' | 'subscriptions' | 'history' | 'profile' | 'favorites' | 'settings' | 'upload';

interface SidebarProps {
  page: Page;
  onNav: (p: Page) => void;
  isLoggedIn: boolean;
  mobile?: boolean;
  onClose?: () => void;
}

const NAV_ITEMS = [
  { id: 'home', icon: 'Home', label: 'Главная' },
  { id: 'catalog', icon: 'LayoutGrid', label: 'Каталог' },
  { id: 'search', icon: 'Search', label: 'Поиск' },
  { id: 'subscriptions', icon: 'Users', label: 'Подписки' },
  { id: 'history', icon: 'Clock', label: 'История' },
  { id: 'favorites', icon: 'Heart', label: 'Избранное' },
  { id: 'profile', icon: 'User', label: 'Профиль' },
  { id: 'settings', icon: 'Settings', label: 'Настройки' },
] as const;

export default function Sidebar({ page, onNav, mobile, onClose }: SidebarProps) {
  function handleNav(p: Page) {
    onNav(p);
    if (onClose) onClose();
  }

  return (
    <aside className={`${mobile ? 'w-full' : 'w-60'} h-full flex flex-col py-4 px-3 bg-card border-r border-border`}>
      {mobile && (
        <div className="flex justify-end mb-2">
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <Icon name="X" size={20} />
          </button>
        </div>
      )}

      {!mobile && (
        <div className="px-3 mb-6">
          <span className="text-2xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span style={{ color: 'var(--yuvist-red)' }}>Ю</span>вист
          </span>
        </div>
      )}

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleNav(item.id as Page)}
            className={`sidebar-link w-full ${page === item.id ? 'active' : 'text-muted-foreground'}`}
          >
            <Icon name={item.icon} size={20} fallback="Circle" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="px-3 pt-4 border-t border-border">
        <p className="text-xs text-muted-foreground">© 2026 Ювист</p>
      </div>
    </aside>
  );
}
