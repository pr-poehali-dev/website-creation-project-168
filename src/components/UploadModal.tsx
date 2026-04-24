import { useState, useRef } from 'react';
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
    isAdult: false,
    thumbnail: '',
    customThumb: '',
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDuration, setVideoDuration] = useState('0:00');
  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  function handleVideoFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) { setError('Выберите видео-файл'); return; }
    if (file.size > 500 * 1024 * 1024) { setError('Файл слишком большой (макс. 500 МБ)'); return; }
    setError('');
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^.]+$/, '') }));
    const vid = document.createElement('video');
    vid.src = url;
    vid.onloadedmetadata = () => {
      const s = Math.floor(vid.duration);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setVideoDuration(`${m}:${sec.toString().padStart(2, '0')}`);
    };
  }

  function handleThumbFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Выберите изображение'); return; }
    setThumbFile(file);
    const url = URL.createObjectURL(file);
    setThumbPreview(url);
    setForm(f => ({ ...f, thumbnail: '', customThumb: '' }));
  }

  function handleSubmit() {
    setError('');
    if (!form.title.trim()) { setError('Введите название'); return; }
    if (!videoFile && !videoUrl) { setError('Выберите видео-файл'); return; }

    const finalThumb = thumbPreview || form.customThumb || form.thumbnail;

    const newVideo: Video = {
      id: generateId(),
      title: censorText(form.title.trim()),
      description: censorText(form.description.trim()),
      url: videoUrl,
      thumbnail: finalThumb,
      authorId: currentUser.id,
      authorName: currentUser.channelName || currentUser.username,
      authorAvatar: currentUser.avatar,
      views: 0,
      likes: 0,
      dislikes: 0,
      comments: [],
      tags: [],
      isAdult: form.isAdult,
      duration: videoDuration,
      createdAt: new Date().toISOString(),
    };
    setState(s => ({ ...s, videos: [newVideo, ...s.videos] }));
    onSuccess(newVideo.id);
  }

  function goToThumb() {
    if (!form.title.trim()) { setError('Введите название'); return; }
    if (!videoFile) { setError('Выберите видео-файл'); return; }
    setError('');
    setStep('thumb');
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

          <div className="flex items-center gap-1 mb-6">
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
              {/* Зона выбора файла */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Видео-файл *</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleVideoFile}
                  className="hidden"
                />
                {!videoFile ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-red-500/50 hover:bg-secondary/50 transition-all group"
                  >
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center group-hover:bg-red-500/10 transition-colors">
                      <Icon name="Upload" size={26} className="text-muted-foreground group-hover:text-red-400" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-sm">Нажмите, чтобы выбрать файл</p>
                      <p className="text-xs text-muted-foreground mt-1">MP4, MOV, AVI, MKV · до 500 МБ</p>
                    </div>
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--yuvist-red)' }}>
                      <Icon name="Film" size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / 1024 / 1024).toFixed(1)} МБ · {videoDuration}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setVideoFile(null); setVideoUrl(''); setVideoDuration('0:00'); }}
                      className="p-1.5 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Icon name="X" size={16} />
                    </button>
                  </div>
                )}
              </div>

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
                onClick={goToThumb}
                className="w-full py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--yuvist-red)' }}
              >
                Далее: выбрать обложку
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Загрузить своё фото</label>
                <input
                  ref={thumbInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbFile}
                  className="hidden"
                />
                {thumbPreview ? (
                  <div className="relative rounded-xl overflow-hidden mb-3" style={{ aspectRatio: '16/9' }}>
                    <img src={thumbPreview} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setThumbPreview(''); setThumbFile(null); }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80"
                    >
                      <Icon name="X" size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border rounded-xl p-5 flex items-center gap-3 hover:border-red-500/50 hover:bg-secondary/50 transition-all mb-3"
                  >
                    <Icon name="Image" size={20} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Выбрать фото с компьютера</span>
                  </button>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">Или выбрать готовую обложку</label>
                <div className="grid grid-cols-3 gap-2">
                  {THUMBNAILS.map(t => (
                    <div
                      key={t}
                      onClick={() => { setForm({ ...form, thumbnail: t, customThumb: '' }); setThumbPreview(''); setThumbFile(null); }}
                      className={`relative rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${form.thumbnail === t && !thumbPreview ? 'border-red-500' : 'border-transparent'}`}
                      style={{ aspectRatio: '16/9' }}
                    >
                      <img src={t} alt="" className="w-full h-full object-cover" />
                      {form.thumbnail === t && !thumbPreview && (
                        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                          <Icon name="Check" size={20} className="text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep('info')}
                  className="flex-1 py-3 rounded-lg font-semibold bg-secondary border border-border hover:bg-accent transition-all"
                >
                  Назад
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="flex-1 py-3 rounded-lg font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  style={{ backgroundColor: 'var(--yuvist-red)' }}
                >
                  {uploading ? 'Загрузка...' : 'Опубликовать'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
