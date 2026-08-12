import React, { useState } from 'react';
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Plus, Clock, Trash2 } from 'lucide-react';
import { CalendarEvent } from '../types';

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: 'evt_1',
    title: 'MK creative X App Launch & Review',
    description: 'Verify 100MB file uploads, YouTube channel sync, and Owner Access lock timer.',
    date: new Date().toISOString().split('T')[0],
    time: '10:00 AM',
    category: 'important',
    createdBy: 'MK Owner',
  },
  {
    id: 'evt_2',
    title: 'Content Update @MkIndustrial-t7s',
    description: 'Publish new automation & machinery video showcase.',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '02:30 PM',
    category: 'work',
    createdBy: 'MK Owner',
  },
];

export const CalendarTab: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('12:00 PM');
  const [category, setCategory] = useState<'work' | 'personal' | 'important' | 'owner-note'>('work');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvt: CalendarEvent = {
      id: 'evt_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      time,
      category,
      createdBy: 'You',
    };

    setEvents((prev) => [...prev, newEvt]);
    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header Bar */}
      <div className="bg-black border border-zinc-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white text-black font-bold rounded-2xl">
            <CalIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Calendar & Schedule</h1>
            <p className="text-xs font-mono text-zinc-400">Organize milestones, reminders, and team notes</p>
          </div>
        </div>

        <button
          onClick={() => {
            setSelectedDate(todayStr);
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 bg-white text-black font-bold rounded-xl text-xs font-mono shadow transition flex items-center gap-2 cursor-pointer hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      {/* Grid: Calendar Grid + Events Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <h2 className="text-lg font-bold text-white font-mono">
              {monthNames[month]} {year}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1 bg-black hover:bg-zinc-900 text-zinc-300 text-xs rounded-lg border border-zinc-800 font-mono cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-black hover:bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-black hover:bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-mono font-bold text-zinc-500 py-1 uppercase">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty_${i}`} className="h-20 bg-black/40 rounded-xl"></div>
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isToday = dateKey === todayStr;
              const isSelected = dateKey === selectedDate;
              const dayEvents = events.filter((e) => e.date === dateKey);

              return (
                <button
                  key={dateKey}
                  onClick={() => setSelectedDate(dateKey)}
                  className={`h-20 p-2 rounded-xl text-left border flex flex-col justify-between transition relative overflow-hidden group cursor-pointer ${
                    isSelected
                      ? 'bg-white text-black border-white shadow'
                      : isToday
                      ? 'bg-zinc-900 border-zinc-600'
                      : 'bg-black border-zinc-800 hover:bg-zinc-900'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-mono font-bold ${isSelected ? 'text-black' : isToday ? 'text-white font-black' : 'text-zinc-400'}`}>
                      {dayNum}
                    </span>
                    {isToday && (
                      <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-black' : 'bg-white'} animate-ping`}></span>
                    )}
                  </div>

                  {dayEvents.length > 0 && (
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map((ev) => (
                        <div
                          key={ev.id}
                          className={`text-[9px] font-mono font-bold truncate px-1.5 py-0.5 rounded border ${
                            isSelected
                              ? 'bg-black text-white border-black'
                              : 'bg-zinc-900 text-white border-zinc-700'
                          }`}
                        >
                          {ev.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <span className="text-[9px] text-zinc-500 font-mono">+{dayEvents.length - 2} more</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Events */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedDate}</h3>
              <p className="text-[11px] text-zinc-400">Scheduled Events</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-2 bg-white text-black hover:bg-zinc-200 rounded-xl transition cursor-pointer"
              title="Add event"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
            {events.filter((e) => e.date === selectedDate).length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs">
                No events scheduled for this date.
              </div>
            ) : (
              events
                .filter((e) => e.date === selectedDate)
                .map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 bg-black border border-zinc-800 rounded-xl space-y-2 relative group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white border border-zinc-700 uppercase tracking-wider">
                        {ev.category}
                      </span>

                      <button
                        onClick={() => handleDeleteEvent(ev.id)}
                        className="text-zinc-500 hover:text-white p-1 opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                    {ev.description && <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">{ev.description}</p>}

                    <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-zinc-900">
                      <Clock className="w-3 h-3 text-white" />
                      <span>{ev.time}</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 font-mono">
          <div className="max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create Event</h3>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="Title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white resize-none font-sans"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Time</label>
                  <input
                    type="text"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-white"
                  >
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="important">Important</option>
                    <option value="owner-note">Owner Note</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-zinc-900 text-zinc-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-white text-black font-bold rounded-xl text-xs shadow cursor-pointer"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
