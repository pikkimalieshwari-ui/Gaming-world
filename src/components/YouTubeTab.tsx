import React, { useState } from 'react';
import { Youtube, ExternalLink, Play, CheckCircle2, Radio, Eye, Share2, Film } from 'lucide-react';

interface ChannelVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  views: string;
  published: string;
  embedId: string;
  thumbnailUrl: string;
}

const MK_CHANNEL_VIDEOS: ChannelVideo[] = [
  {
    id: 'vid_1',
    title: 'MK Industrial Innovation Showcase - High Tech Automation & Creative Design',
    description: 'Explore cutting edge industrial tools, automation systems, and creative engineering workflows from MK Industrial.',
    duration: '12:45',
    views: '45.2K views',
    published: '3 days ago',
    embedId: 'M7lc1UVf-VE',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'vid_2',
    title: 'Advanced Robotics & Smart Factory Solutions | MK Industrial',
    description: 'Behind the scenes at MK Industrial testing smart robotic arms, custom machinery, and automated manufacturing pipelines.',
    duration: '18:20',
    views: '89.1K views',
    published: '1 week ago',
    embedId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'vid_3',
    title: 'MK Industrial Creative Workshop & Prototyping Essentials',
    description: 'A deep dive into custom prototype design, heavy precision tools, and high performance industrial setups.',
    duration: '15:10',
    views: '32.8K views',
    published: '2 weeks ago',
    embedId: 'LXb3EKWsInQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
  },
  {
    id: 'vid_4',
    title: 'Future Technologies & Heavy Machinery Tour - @MkIndustrial-t7s',
    description: 'Official walkthrough of MK Industrial facilities showcasing our newest heavy machinery and custom hardware builds.',
    duration: '22:05',
    views: '112.4K views',
    published: '1 month ago',
    embedId: 'L_LUpnjgPso',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
  },
];

export const YouTubeTab: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<ChannelVideo>(MK_CHANNEL_VIDEOS[0]);
  const channelUrl = 'https://www.youtube.com/@MkIndustrial-t7s';

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Channel Header Banner */}
      <div className="bg-black border border-zinc-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center font-black shrink-0 border border-zinc-300">
              <Youtube className="w-10 h-10" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">MK Industrial</h1>
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <p className="text-xs font-mono text-zinc-400 mt-0.5">@MkIndustrial-t7s</p>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mt-2">
                <span>120K Subscribers</span>
                <span>•</span>
                <span>48 Videos</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-white font-bold">
                  <Radio className="w-3 h-3 animate-ping" /> Official Channel
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs font-mono shadow transition flex items-center gap-2"
            >
              <Youtube className="w-4 h-4" />
              Subscribe
            </a>

            <a
              href={channelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-mono font-bold border border-zinc-700 transition flex items-center gap-1.5"
            >
              Open Channel <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Video Player + Channel Catalog */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Embedded Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="aspect-video w-full bg-black relative">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.embedId}?autoplay=0`}
                title={selectedVideo.title}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-white leading-snug">{selectedVideo.title}</h2>
                  <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5 text-white" /> {selectedVideo.views}</span>
                    <span>•</span>
                    <span>{selectedVideo.published}</span>
                  </div>
                </div>

                <a
                  href={`https://www.youtube.com/watch?v=${selectedVideo.embedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-black hover:bg-zinc-900 text-white border border-zinc-700 rounded-xl text-xs font-mono font-semibold shrink-0 flex items-center gap-1 transition"
                >
                  <Share2 className="w-3.5 h-3.5" /> YouTube
                </a>
              </div>

              <p className="text-xs text-zinc-300 bg-black p-3 rounded-xl border border-zinc-800 leading-relaxed font-mono">
                {selectedVideo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Playlist Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">Channel Catalog</h3>
            </div>
            <span className="text-xs font-mono text-zinc-400">@MkIndustrial-t7s</span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {MK_CHANNEL_VIDEOS.map((vid) => {
              const isSelected = selectedVideo.id === vid.id;
              return (
                <button
                  key={vid.id}
                  onClick={() => setSelectedVideo(vid)}
                  className={`w-full text-left p-3 rounded-xl border transition flex gap-3 group cursor-pointer ${
                    isSelected
                      ? 'bg-black border-white shadow'
                      : 'bg-zinc-950 border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="w-28 h-18 rounded-lg overflow-hidden relative shrink-0 bg-black border border-zinc-800">
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300 filter grayscale"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Play className="w-6 h-6 text-white fill-white" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/90 text-[9px] font-mono font-bold text-white rounded">
                      {vid.duration}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-xs font-bold line-clamp-2 leading-snug ${isSelected ? 'text-white' : 'text-zinc-300'}`}>
                      {vid.title}
                    </h4>
                    <p className="text-[10px] text-zinc-400 mt-1 font-mono">{vid.views}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
