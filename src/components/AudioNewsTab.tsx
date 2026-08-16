import React, { useState, useEffect, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Sparkles,
  Search,
  Radio,
  Clock,
  ExternalLink,
  Globe,
  Cpu,
  Atom,
  Rocket,
  TrendingUp,
  Leaf,
  Layers,
  Flame,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NewsArticle, NewsCategory } from '../types';

interface AudioNewsTabProps {
  onSelectArticle?: (article: NewsArticle) => void;
}

export const AudioNewsTab: React.FC<AudioNewsTabProps> = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Audio Player State
  const [currentArticle, setCurrentArticle] = useState<NewsArticle | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [showVoicePicker, setShowVoicePicker] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const progressTimerRef = useRef<any>(null);

  const fetchNews = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setArticles(data);
          if (!currentArticle && data.length > 0) {
            setCurrentArticle(data[0]);
          }
        }
      } else {
        throw new Error('Failed to fetch international news.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load news feed. Showing cached updates.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Initialize Web Speech API voices
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        if (!synthRef.current) return;
        const voices = synthRef.current.getVoices().filter((v) => v.lang.startsWith('en'));
        setAvailableVoices(voices);
      };

      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      stopAudio();
    };
  }, []);

  const stopAudio = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
    }
    setIsPlaying(false);
    setProgress(0);
  };

  const playAudio = (article: NewsArticle) => {
    if (!synthRef.current) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    // If already playing this article, resume
    if (currentArticle?.id === article.id && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPlaying(true);
      return;
    }

    stopAudio();
    setCurrentArticle(article);

    const speechText = `${article.headline}. Published by ${article.source}. ${article.summary}`;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utteranceRef.current = utterance;

    if (availableVoices.length > 0 && availableVoices[selectedVoiceIndex]) {
      utterance.voice = availableVoices[selectedVoiceIndex];
    }
    utterance.rate = playbackSpeed;
    utterance.volume = isMuted ? 0 : volume;
    utterance.pitch = 1.0;

    const estimatedDurationSec = Math.max(15, speechText.split(' ').length * 0.4 / playbackSpeed);
    let elapsed = 0;

    utterance.onstart = () => {
      setIsPlaying(true);
      progressTimerRef.current = setInterval(() => {
        elapsed += 0.5;
        const pct = Math.min(100, (elapsed / estimatedDurationSec) * 100);
        setProgress(pct);
      }, 500);
    };

    utterance.onend = () => {
      stopAudio();
      // Auto-play next article if available
      const currentIndex = filteredArticles.findIndex((a) => a.id === article.id);
      if (currentIndex >= 0 && currentIndex < filteredArticles.length - 1) {
        playAudio(filteredArticles[currentIndex + 1]);
      }
    };

    utterance.onerror = () => {
      stopAudio();
    };

    synthRef.current.speak(utterance);
  };

  const togglePlayPause = () => {
    if (!currentArticle && filteredArticles.length > 0) {
      playAudio(filteredArticles[0]);
      return;
    }
    if (!currentArticle) return;

    if (isPlaying) {
      if (synthRef.current) {
        synthRef.current.pause();
      }
      setIsPlaying(false);
    } else {
      if (synthRef.current && synthRef.current.paused) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        playAudio(currentArticle);
      }
    }
  };

  const handleSpeedChange = () => {
    const speeds = [0.75, 1, 1.25, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const newSpeed = speeds[nextIdx];
    setPlaybackSpeed(newSpeed);

    if (isPlaying && currentArticle) {
      playAudio(currentArticle);
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (synthRef.current && utteranceRef.current) {
      utteranceRef.current.volume = nextMute ? 0 : volume;
    }
  };

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const breakingArticles = articles.filter((a) => a.isBreaking);

  const categories: { id: NewsCategory; label: string; icon: any }[] = [
    { id: 'all', label: 'All News', icon: Layers },
    { id: 'world', label: 'World', icon: Globe },
    { id: 'technology', label: 'Technology', icon: Cpu },
    { id: 'science', label: 'Science', icon: Atom },
    { id: 'space', label: 'Space & Astro', icon: Rocket },
    { id: 'business', label: 'Business & Finance', icon: TrendingUp },
    { id: 'environment', label: 'Clean Energy & Climate', icon: Leaf },
  ];

  const formatRelativeTime = (dateString: string) => {
    try {
      const diffMs = Date.now() - new Date(dateString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-zinc-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white text-black rounded-lg">
              <Radio className="w-4 h-4 animate-pulse" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
              Global Broadcast Stream
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            International Audio News
            <span className="text-xs font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-800">
              Live TTS Synth
            </span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Real-time verified international news feed with automated speech synthesis, breaking intelligence, and high-fidelity audio playback.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchNews(false);
            }}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono border border-zinc-800 flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Live Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Breaking News Ticker Bar */}
      {breakingArticles.length > 0 && (
        <div className="mb-6 p-3 bg-zinc-950 border border-zinc-700/80 rounded-2xl flex items-center gap-3 shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white text-black font-black text-[10px] tracking-wider uppercase rounded-lg shrink-0">
            <Flame className="w-3.5 h-3.5 text-red-600 animate-bounce" />
            Breaking
          </div>
          <div className="overflow-x-auto whitespace-nowrap text-xs font-medium text-zinc-200 flex-1 flex items-center gap-6 no-scrollbar">
            {breakingArticles.map((b) => (
              <button
                key={b.id}
                onClick={() => playAudio(b)}
                className="hover:text-white hover:underline flex items-center gap-2 cursor-pointer transition text-left"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                <span>{b.headline}</span>
                <span className="text-[10px] font-mono text-zinc-400">({b.source})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation Pills & Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 mb-6">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-2 transition cursor-pointer border ${
                  isSelected
                    ? 'bg-white text-black font-bold border-white shadow'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search global news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-9 pr-4 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Error / Offline alert */}
      {error && (
        <div className="mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-3 text-xs text-zinc-300">
          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800/80 rounded-2xl p-4 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="w-full h-36 bg-zinc-900 rounded-xl mb-3"></div>
              <div className="space-y-2">
                <div className="w-20 h-4 bg-zinc-900 rounded"></div>
                <div className="w-full h-5 bg-zinc-900 rounded"></div>
                <div className="w-3/4 h-5 bg-zinc-900 rounded"></div>
              </div>
              <div className="w-full h-8 bg-zinc-900 rounded-xl mt-3"></div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <Globe className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No articles match your query</h3>
          <p className="text-xs text-zinc-400 mt-1">Try switching categories or clearing search filters.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-white text-black font-bold text-xs rounded-xl shadow cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-28">
          {filteredArticles.map((article) => {
            const isCurrentlyPlaying = isPlaying && currentArticle?.id === article.id;
            const isSelected = currentArticle?.id === article.id;

            return (
              <article
                key={article.id}
                className={`group bg-zinc-950 border rounded-2xl overflow-hidden transition duration-200 flex flex-col justify-between hover:border-zinc-700 ${
                  isSelected ? 'border-zinc-400 shadow-xl' : 'border-zinc-800/80'
                }`}
              >
                {/* Article Header & Image */}
                <div className="relative">
                  <div className="h-44 w-full bg-zinc-900 overflow-hidden relative">
                    <img
                      src={article.imageUrl}
                      alt={article.headline}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                    {/* Category & Breaking Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase rounded-lg border border-zinc-700">
                        {article.category}
                      </span>
                      {article.isBreaking && (
                        <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded-md shadow flex items-center gap-1">
                          <Flame className="w-3 h-3" /> Breaking
                        </span>
                      )}
                    </div>

                    {/* Read / Listen Duration */}
                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-md rounded-lg text-[10px] font-mono text-zinc-300 border border-zinc-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      <span>{article.readTime}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono mb-2">
                      <span className="truncate max-w-[160px] text-zinc-300 font-semibold">{article.source}</span>
                      <span>{formatRelativeTime(article.publishedAt)}</span>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug line-clamp-2 group-hover:text-zinc-200 transition mb-2">
                      {article.headline}
                    </h3>

                    <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 pt-2 border-t border-zinc-900 flex items-center justify-between gap-2">
                  <button
                    onClick={() => playAudio(article)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                      isCurrentlyPlaying
                        ? 'bg-white text-black shadow-lg animate-pulse'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-800'
                    }`}
                  >
                    {isCurrentlyPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Playing Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen ({article.audioDurationSec || 40}s)</span>
                      </>
                    )}
                  </button>

                  {article.url && (
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition"
                      title="View Official Source"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Sticky Audio Player Dock (Mobile & Desktop) */}
      {currentArticle && (
        <aside
          aria-label="Audio news player"
          className="fixed bottom-3 left-4 right-4 md:left-auto md:right-8 md:w-[460px] z-50 bg-black/95 backdrop-blur-xl border border-zinc-700/80 rounded-2xl shadow-2xl p-3.5 text-white font-sans transition-all duration-300"
        >
          {/* Progress Timeline Bar */}
          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mb-3">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between gap-3">
            {/* Thumbnail & Title */}
            <div className="flex items-center gap-2.5 overflow-hidden flex-1">
              <img
                src={currentArticle.imageUrl}
                alt=""
                className="w-10 h-10 rounded-xl object-cover border border-zinc-700 shrink-0"
              />
              <div className="overflow-hidden">
                <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  <span>{currentArticle.category}</span> • <span>{currentArticle.source}</span>
                </div>
                <h4 className="text-xs font-bold text-white truncate max-w-[200px] md:max-w-[220px]">
                  {currentArticle.headline}
                </h4>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Speed Switcher */}
              <button
                onClick={handleSpeedChange}
                title="Playback Speed"
                className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono font-bold rounded-lg border border-zinc-800 transition cursor-pointer text-zinc-300"
              >
                {playbackSpeed}x
              </button>

              {/* Mute Button */}
              <button
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-zinc-800 transition cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Main Play/Pause Button */}
              <button
                onClick={togglePlayPause}
                className="w-9 h-9 bg-white text-black hover:bg-zinc-200 rounded-xl flex items-center justify-center font-bold shadow transition cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
};
