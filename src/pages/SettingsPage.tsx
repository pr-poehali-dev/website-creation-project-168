import { getState, setState } from '@/lib/store';
import { useStore } from '@/hooks/useStore';
import Icon from '@/components/ui/icon';

export default function SettingsPage() {
  const state = useStore();

  function toggleTheme() {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    setState(s => ({ ...s, theme: next }));
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  function clearHistory() {
    setState(s => ({ ...s, history: [] }));
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 animate-fade-in">
      <h1 className="text-2xl font-bold mb-6">Настройки</h1>

      <div className="space-y-4">
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Внешний вид</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon name={state.theme === 'dark' ? 'Moon' : 'Sun'} size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">Тема</p>
                  <p className="text-xs text-muted-foreground">{state.theme === 'dark' ? 'Тёмная' : 'Светлая'}</p>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 ${state.theme === 'dark' ? 'bg-red-500' : 'bg-secondary border border-border'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-300 ${state.theme === 'dark' ? 'left-7 bg-white' : 'left-1 bg-muted-foreground'}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">Данные</h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                  <Icon name="Clock" size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium">История просмотров</p>
                  <p className="text-xs text-muted-foreground">{state.history.length} видео</p>
                </div>
              </div>
              <button
                onClick={clearHistory}
                className="px-3 py-1.5 rounded-lg bg-secondary border border-border text-sm hover:bg-accent transition-all"
              >
                Очистить
              </button>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="font-semibold">О сервисе</h3>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl font-black" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                <span style={{ color: 'var(--yuvist-red)' }}>Ю</span>вист
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Версия 1.0 · 2026</p>
            <p className="text-sm text-muted-foreground mt-1">Видеохостинг для всех</p>
          </div>
        </div>
      </div>
    </div>
  );
}
