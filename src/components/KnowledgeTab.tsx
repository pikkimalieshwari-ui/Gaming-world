import React, { useState, useEffect } from 'react';
import {
  Zap,
  Atom,
  Rocket,
  Satellite,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  BookOpen,
  ChevronRight,
  Sparkles,
  Info,
  ShieldCheck,
  RefreshCw,
  X,
  Layers,
  Award
} from 'lucide-react';
import { KnowledgeArticle, KnowledgeCategory } from '../types';

export const KnowledgeTab: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<KnowledgeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [activeModalArticle, setActiveModalArticle] = useState<KnowledgeArticle | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchKnowledge = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const res = await fetch('/api/knowledge');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setArticles(data);
        }
      }
    } catch {
      // Ignore network errors, show fallback
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchKnowledge();
  }, []);

  const categories: { id: KnowledgeCategory; label: string; icon: any; count: number; desc: string }[] = [
    {
      id: 'all',
      label: 'All Hubs',
      icon: Layers,
      count: articles.length,
      desc: 'Unified scientific intelligence & verified updates stream'
    },
    {
      id: 'tesla',
      label: 'Tesla',
      icon: Zap,
      count: articles.filter((a) => a.category === 'tesla').length,
      desc: 'Optimus Gen-3, 4680 Dry Electrodes, FSD AI, Megapack Energy & Robotaxis'
    },
    {
      id: 'physics',
      label: 'Physics',
      icon: Atom,
      count: articles.filter((a) => a.category === 'physics').length,
      desc: 'Fusion Net-Gain (Q>2.1), Quantum Braiding, CERN LHC & Particle Mechanics'
    },
    {
      id: 'nasa',
      label: 'NASA',
      icon: Rocket,
      count: articles.filter((a) => a.category === 'nasa').length,
      desc: 'Artemis Crewed Lunar Architecture, Europa Clipper & Deep Space Telemetry'
    },
    {
      id: 'isro',
      label: 'ISRO',
      icon: Satellite,
      count: articles.filter((a) => a.category === 'isro').length,
      desc: 'Gaganyaan Vyomnaut Missions, Chandrayaan-4 Sample Return & HLVM3'
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesSearch =
      article.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.fullExplanation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: KnowledgeArticle['status']) => {
    switch (status) {
      case 'Confirmed Mission':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      case 'Peer-Reviewed Discovery':
        return 'bg-sky-950/80 text-sky-300 border-sky-800';
      case 'Technology Milestone':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Official Announcement':
      default:
        return 'bg-zinc-900 text-zinc-300 border-zinc-700';
    }
  };

  const getCategoryIcon = (category: KnowledgeArticle['category']) => {
    switch (category) {
      case 'tesla':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'physics':
        return <Atom className="w-3.5 h-3.5 text-cyan-400" />;
      case 'nasa':
        return <Rocket className="w-3.5 h-3.5 text-blue-400" />;
      case 'isro':
        return <Satellite className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 text-zinc-100 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-white text-black rounded-lg">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
              I-Know Intelligence Portal
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
            Knowledge Updates
            <span className="text-xs font-mono bg-zinc-900 text-zinc-300 px-2 py-0.5 rounded-full border border-zinc-800">
              Verified Scientific Feeds
            </span>
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 mt-1 max-w-2xl">
            Continuously updated educational and mission intelligence across Tesla, Frontier Physics, NASA, and ISRO with peer-reviewed facts and verified timelines.
          </p>
        </div>

        {/* Sync & Refresh Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsRefreshing(true);
              fetchKnowledge(false);
            }}
            disabled={isRefreshing}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono border border-zinc-800 flex items-center gap-2 transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-white' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Feeds'}</span>
          </button>
        </div>
      </div>

      {/* Hub Cards (Tesla, Physics, NASA, ISRO) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
        {categories.slice(1).map((hub) => {
          const Icon = hub.icon;
          const isSelected = selectedCategory === hub.id;
          return (
            <button
              key={hub.id}
              onClick={() => setSelectedCategory(hub.id)}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-zinc-900 border-white shadow-xl ring-1 ring-white/20'
                  : 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800">
                    {hub.count} Articles
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1">{hub.label} Hub</h3>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">{hub.desc}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>View Stream</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        {/* Hub Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-white text-black font-bold border-white shadow'
                  : 'bg-zinc-950 text-zinc-400 hover:text-white border-zinc-800'
              }`}
            >
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search Tesla, Physics, NASA, ISRO..."
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

      {/* Knowledge Articles Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 h-80 animate-pulse flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="w-24 h-4 bg-zinc-900 rounded"></div>
                <div className="w-full h-6 bg-zinc-900 rounded"></div>
                <div className="w-3/4 h-4 bg-zinc-900 rounded"></div>
              </div>
              <div className="w-full h-32 bg-zinc-900 rounded-xl"></div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-16 bg-zinc-950 border border-zinc-800 rounded-2xl p-8">
          <BookOpen className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No knowledge updates found</h3>
          <p className="text-xs text-zinc-400 mt-1">Try resetting the search terms or category selection.</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map((article) => {
            return (
              <article
                key={article.id}
                className="group bg-zinc-950 border border-zinc-800/90 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-200 flex flex-col justify-between shadow-sm hover:shadow-lg"
              >
                <div>
                  {/* Top Image Banner */}
                  <div className="h-44 w-full bg-zinc-900 relative overflow-hidden">
                    <img
                      src={article.imageUrl}
                      alt={article.headline}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>

                    {/* Category & Status Pill */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase rounded-lg border border-zinc-700 flex items-center gap-1.5">
                        {getCategoryIcon(article.category)}
                        <span>{article.category}</span>
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border backdrop-blur-md ${getStatusBadge(
                          article.status
                        )}`}
                      >
                        {article.status}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 text-[11px] font-mono text-zinc-300 flex items-center justify-between">
                      <span className="truncate max-w-[200px] text-zinc-200">{article.source}</span>
                      <span className="flex items-center gap-1 text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-base font-bold text-white leading-snug mb-2 group-hover:text-zinc-200 transition">
                      {article.headline}
                    </h3>

                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 mb-4">
                      {article.summary}
                    </p>

                    {/* Key Facts Highlights */}
                    {article.keyFacts && article.keyFacts.length > 0 && (
                      <div className="mb-4 space-y-1.5 bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
                        <div className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1 mb-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Key Verified Facts
                        </div>
                        {article.keyFacts.slice(0, 2).map((fact, idx) => (
                          <div key={idx} className="text-[11px] text-zinc-400 flex items-start gap-2">
                            <span className="text-zinc-500 font-bold">•</span>
                            <span className="line-clamp-1">{fact}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {article.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-zinc-900 text-zinc-400 text-[10px] font-mono rounded border border-zinc-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0 flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveModalArticle(article)}
                    className="flex-1 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white rounded-xl text-xs font-mono font-bold border border-zinc-800 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read Deep Breakdown</span>
                  </button>

                  {article.readMoreUrl && (
                    <a
                      href={article.readMoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition"
                      title="Visit Official Agency Portal"
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

      {/* Read More Detail Modal */}
      {activeModalArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 text-white font-sans overflow-y-auto">
          <div className="max-w-2xl w-full bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Image Header */}
            <div className="h-56 w-full bg-zinc-900 relative shrink-0">
              <img
                src={activeModalArticle.imageUrl}
                alt={activeModalArticle.headline}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

              <button
                onClick={() => setActiveModalArticle(null)}
                className="absolute top-4 right-4 p-2 bg-black/70 hover:bg-black text-white rounded-full border border-zinc-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-1 bg-black/80 backdrop-blur-md text-[10px] font-mono font-bold text-white uppercase rounded-lg border border-zinc-700 flex items-center gap-1.5">
                    {getCategoryIcon(activeModalArticle.category)}
                    <span>{activeModalArticle.category} Hub</span>
                  </span>
                  <span
                    className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg border backdrop-blur-md ${getStatusBadge(
                      activeModalArticle.status
                    )}`}
                  >
                    {activeModalArticle.status}
                  </span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                  {activeModalArticle.headline}
                </h2>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-5 text-zinc-300 text-xs md:text-sm leading-relaxed font-sans">
              {/* Metadata Bar */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 pb-3 border-b border-zinc-800">
                <span className="font-semibold text-zinc-300">{activeModalArticle.source}</span>
                <span>{new Date(activeModalArticle.publishedAt).toLocaleDateString()}</span>
              </div>

              {/* Full Explanation */}
              <div>
                <h4 className="text-xs font-mono font-bold text-white uppercase mb-2">
                  Comprehensive Technical Breakdown
                </h4>
                <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                  {activeModalArticle.fullExplanation}
                </p>
              </div>

              {/* Key Verified Facts */}
              {activeModalArticle.keyFacts && (
                <div className="bg-zinc-900/80 p-4 rounded-2xl border border-zinc-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-1.5 mb-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verified Mission & Engineering Specifications
                  </h4>
                  {activeModalArticle.keyFacts.map((fact, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5"></div>
                      <span>{fact}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tags */}
              <div className="pt-2">
                <div className="text-[10px] font-mono text-zinc-500 uppercase mb-2">Subject Classifications</div>
                <div className="flex flex-wrap gap-2">
                  {activeModalArticle.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 bg-zinc-900 text-zinc-300 text-xs font-mono rounded-lg border border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-800 bg-black/60 flex items-center justify-between gap-3 shrink-0">
              <button
                onClick={() => setActiveModalArticle(null)}
                className="py-2.5 px-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-mono transition cursor-pointer"
              >
                Close
              </button>

              {activeModalArticle.readMoreUrl && (
                <a
                  href={activeModalArticle.readMoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-5 bg-white text-black font-bold rounded-xl text-xs flex items-center gap-2 shadow hover:bg-zinc-200 transition cursor-pointer"
                >
                  <span>Official Research Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
