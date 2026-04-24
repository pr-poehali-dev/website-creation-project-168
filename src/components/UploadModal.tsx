import { useState } from 'react';
import { User, setState, generateId, Video, censorText } from '@/lib/store';
import Icon from '@/components/ui/icon';

interface UploadModalProps {
  currentUser: User;
  onClose: () => void;
  onSuccess: (videoId: string) => void;
}

const THUMBNAILS = [
  'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=640&q=80',
  'https://images.unsplash.com/photo-1536240478700-b869ad10a2ab?w=640&q=80',
  'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=640&q=80',
  'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=640&q=80',
  'https://images.unsplash.com/photo-1502945015378-0e284ca1a5be?w=640&q=80',
  'https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=640&q=80',
];

export default function UploadModal({ currentUser, onClose, onSuccess }: UploadModalProps) {
  const [step, setStep] = useState<'info' | 'thumb'>('info');
  const [form, setForm] = useState({
    title: '',
    description: '',
    url: '',
    duration: '',
    isAdult: false,
    thumbnail: '',
    customThumb: '',
  });
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Введите название'); return; }
    if (!form.url.trim()) { setError('Введите ссылку на видео'); return; }
    const newVideo: Video = {
      id: generateId(),
      title: censorText(form.title.trim()),
      description: censorText(form.description.trim()),
      url: form.url.trim(),
      thumbnail: form.customThumb || form.thumbnail,
      authorId: currentUser.id,
      authorName: currentUser.channelName || currentUser.username,
      authorAvatar: currentUser.avatar,
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: [],
      tags: [],
      isAdult: form.isAdult,
      duration: form.duration || '0:00',
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, videos: [newVideo, ...s.videos] }));
    onSuccess(newVideo.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 glass" />
      <div
        className="relative bg-card border border-border rounded-2xl w-full max-w-lg animate-scale-in shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Загрузить видео</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex gap-1 mb-6">
            {['info', 'thumb'].map((s, i) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step === s ? 'text-white' : 'bg-secondary text-muted-foreground'}`}
                  style={step === s ? { backgroundColor: 'var(--yuvist-red)' } : {}}
                >
                  {i + 1}
                </div>
                <span className={`text-xs ${step === s ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {s === 'info' ? 'Основное' : 'Обложка'}
                </span>
                {i < 1 && <div className="w-8 h-px bg-border mx-1" />}
              </div>
            ))}
          </div>

          {step === 'info' ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Название *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="Название видео"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Описание</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Описание видео..."
                  rows={3}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Ссылка на видео *</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://... (прямая ссылка на mp4)"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Длительность</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={e => setForm({ ...form, duration: e.target.value })}
                  placeholder="например: 10:30"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-secondary rounded-lg border border-border">
                <input
                  type="checkbox"
                  checked={form.isAdult}
                  onChange={e => setForm({ ...form, isAdult: e.target.checked })}
                  className="w-4 h-4"
                  style={{ accentColor: 'var(--yuvist-red)' }}
                />
                <div>
                  <p className="text-sm font-medium">Отметка 18+</p>
                  <p className="text-xs text-muted-foreground">Видео содержит контент для взрослых</p>
                </div>
              </label>
              {error && <p className="text-red-400 text-xs">{error}</p>}
              <button
                onClick={() => { if (!form.title.trim() || !form.url.trim()) { setError('Заполните обязательные поля'); return; } setError(''); setStep('thumb'); }}
                className="w-full py-3 rounded-lg font-semibold text-white"
                style={{ backgroundColor: 'var(--yuvist-red)' }}
              >
                Далее: выбрать обложку
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Выберите обложку</label>
                <div className="grid grid-cols-3 gap-2">
                  {THUMBNAILS.map(t => (
                    <div
                      key={t}
                      onClick={() => setForm({ ...form, thumbnail: t, customThumb: '' })}
                      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${form.thumbnail === t && !form.customThumb ? 'border-red-500' : 'border-transparent'}`}
                      style={{ aspectRatio: '16/9' }}
                    >
                      <img src={t} alt="" className="w-full h-full object-cover" />
                      {form.thumbnail === t && !form.customThumb && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <Icon name="Check" size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Или своя ссылка на обложку</label>
                <input
                  type="url"
                  value={form.customThumb}
                  onChange={e => setForm({ ...form, customThumb: e.target.value, thumbnail: '' })}
                  placeholder="https://..."
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('info')}
                  className="flex-1 py-3 rounded-lg font-semibold bg-secondary border border-border hover:bg-accent transition-all"
                >
                  Назад
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-lg font-semibold text-white"
                  style={{ backgroundColor: 'var(--yuvist-red)' }}
                >
                  Опубликовать
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
