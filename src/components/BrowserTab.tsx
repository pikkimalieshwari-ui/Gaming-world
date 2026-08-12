import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, ExternalLink, Bookmark, ShieldCheck } from 'lucide-react';

const BOOKMARKS = [
  { name: 'Google Search', url: 'https://www.google.com/search?igu=1', displayUrl: 'https://google.com', icon: '🔍' },
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', displayUrl: 'https://wikipedia.org', icon: '📚' },
  { name: 'Google AI Studio', url: 'https://ai.studio', displayUrl: 'https://ai.studio', icon: '✨' },
  { name: 'GitHub', url: 'https://github.com', displayUrl: 'https://github.com', icon: '💻' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com', displayUrl: 'https://stackoverflow.com', icon: '💬' },
  { name: 'BBC World News', url: 'https://www.bbc.com/news', displayUrl: 'https://bbc.com', icon: '📰' },
];

export const BrowserTab: React.FC = () => {
  const [url, setUrl] = useState('https://www.google.com/search?igu=1');
  const [inputUrl, setInputUrl] = useState('https://google.com');
  const [history, setHistory] = useState<string[]>(['https://www.google.com/search?igu=1']);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [key, setKey] = useState(0);

  const navigateTo = (newUrl: string, displayVal?: string) => {
    let formatted = newUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      if (formatted.includes('.') && !formatted.includes(' ')) {
        formatted = 'https://' + formatted;
      } else {
        formatted = `https://www.google.com/search?q=${encodeURIComponent(formatted)}&igu=1`;
      }
    }

    setUrl(formatted);
    setInputUrl(displayVal || formatted);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(formatted);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputUrl);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const prev = historyIndex - 1;
      setHistoryIndex(prev);
      setUrl(history[prev]);
      setInputUrl(history[prev]);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const next = historyIndex + 1;
      setHistoryIndex(next);
      setUrl(history[next]);
      setInputUrl(history[next]);
    }
  };

  return (
    <div className="h-[calc(100vh-5rem)] max-w-7xl mx-auto p-2 sm:p-4 flex flex-col gap-3 text-white font-sans">
      {/* Top Browser Control Bar */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 shadow-xl space-y-3">
        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleBack}
              disabled={historyIndex <= 0}
              className="p-2 bg-black hover:bg-zinc-900 text-zinc-300 disabled:opacity-30 rounded-xl transition border border-zinc-800 cursor-pointer"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleForward}
              disabled={historyIndex >= history.length - 1}
              className="p-2 bg-black hover:bg-zinc-900 text-zinc-300 disabled:opacity-30 rounded-xl transition border border-zinc-800 cursor-pointer"
              title="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setKey((prev) => prev + 1)}
              className="p-2 bg-black hover:bg-zinc-900 text-zinc-300 rounded-xl transition border border-zinc-800 cursor-pointer"
              title="Refresh Page"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Address & Search Input */}
          <form onSubmit={handleSearch} className="flex-1 flex items-center relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-zinc-500">
              <Globe className="w-4 h-4 text-white" />
            </div>

            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="Search Google or enter web URL..."
              className="w-full bg-black border border-zinc-800 rounded-xl py-2 pl-10 pr-24 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-white shadow-inner"
            />

            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <button
                type="submit"
                className="px-3 py-1 bg-white hover:bg-zinc-200 text-black font-bold rounded-lg text-xs font-mono transition cursor-pointer"
              >
                Go
              </button>
            </div>
          </form>

          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in new browser tab"
            className="p-2 bg-black hover:bg-zinc-900 text-white rounded-xl border border-zinc-800 transition"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Bookmarks Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-mono">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1 shrink-0 font-bold">
            <Bookmark className="w-3 h-3 text-white" />
            Bookmarks:
          </span>
          {BOOKMARKS.map((bm) => (
            <button
              key={bm.name}
              onClick={() => navigateTo(bm.url, bm.displayUrl)}
              className="px-2.5 py-1 bg-black hover:bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-300 hover:text-white transition whitespace-nowrap flex items-center gap-1.5 text-[11px] cursor-pointer"
            >
              <span>{bm.icon}</span>
              <span>{bm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Embedded Web View Canvas */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden relative shadow-2xl flex flex-col">
        <div className="bg-black px-4 py-2 border-b border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-white" />
            <span className="truncate font-bold text-white">{url}</span>
          </div>
          <span className="text-[10px] text-zinc-500 shrink-0">MK In-App Browser</span>
        </div>

        <div className="flex-1 relative bg-white">
          <iframe
            key={key}
            src={url}
            title="MK In-App Browser"
            className="w-full h-full border-none"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
