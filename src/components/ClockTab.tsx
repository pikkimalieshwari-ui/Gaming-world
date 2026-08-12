import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon, Timer as TimerIcon, Watch, Globe, Play, Pause, RotateCcw, Flag, Bell } from 'lucide-react';
import { WorldClockCity } from '../types';

const WORLD_CITIES: WorldClockCity[] = [
  { id: '1', cityName: 'London', country: 'United Kingdom', timezone: 'Europe/London' },
  { id: '2', cityName: 'New York', country: 'United States', timezone: 'America/New_York' },
  { id: '3', cityName: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
  { id: '4', cityName: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai' },
  { id: '5', cityName: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney' },
  { id: '6', cityName: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata' },
];

export const ClockTab: React.FC = () => {
  const [time, setTime] = useState(new Date());

  // Stopwatch States
  const [swTime, setSwTime] = useState(0);
  const [swRunning, setSwRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);

  // Timer States
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [timerInitial, setTimerInitial] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerAlert, setTimerAlert] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let interval: any = null;
    if (swRunning) {
      interval = setInterval(() => setSwTime((prev) => prev + 10), 10);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [swRunning]);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0 && timerRunning) {
      setTimerRunning(false);
      setTimerAlert(true);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatSw = (ms: number) => {
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(hundredths).padStart(2, '0')}`;
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remSecs).padStart(2, '0')}`;
  };

  const startPresetTimer = (mins: number) => {
    const total = mins * 60;
    setTimerInitial(total);
    setTimerSeconds(total);
    setTimerRunning(true);
    setTimerAlert(false);
  };

  // Analog Clock Math
  const seconds = time.getSeconds();
  const minutes = time.getMinutes();
  const hours = time.getHours() % 12;

  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const hourDeg = hours * 30 + minutes * 0.5;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header Banner */}
      <div className="bg-black border border-zinc-800 rounded-2xl p-5 shadow-lg flex items-center gap-3">
        <div className="p-3 bg-white text-black font-bold rounded-2xl">
          <ClockIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">World Clock & Precision Timer</h1>
          <p className="text-xs font-mono text-zinc-400">Global timezones, lap stopwatch, and countdown suite</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Clock Card */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-around gap-6">
          {/* Analog Clock Graphic */}
          <div className="relative w-48 h-48 rounded-full bg-black border-4 border-zinc-800 shadow-2xl flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full border border-zinc-700"></div>

            <span className="absolute top-2 text-xs font-mono font-bold text-zinc-400">12</span>
            <span className="absolute right-3 text-xs font-mono font-bold text-zinc-400">3</span>
            <span className="absolute bottom-2 text-xs font-mono font-bold text-zinc-400">6</span>
            <span className="absolute left-3 text-xs font-mono font-bold text-zinc-400">9</span>

            {/* Hour Hand */}
            <div
              className="absolute w-1.5 h-12 bg-white rounded-full origin-bottom"
              style={{
                transform: `rotate(${hourDeg}deg) translateY(-50%)`,
                bottom: '50%',
              }}
            ></div>

            {/* Minute Hand */}
            <div
              className="absolute w-1 h-16 bg-zinc-300 rounded-full origin-bottom"
              style={{
                transform: `rotate(${minuteDeg}deg) translateY(-50%)`,
                bottom: '50%',
              }}
            ></div>

            {/* Second Hand */}
            <div
              className="absolute w-0.5 h-18 bg-zinc-500 rounded-full origin-bottom"
              style={{
                transform: `rotate(${secondDeg}deg) translateY(-50%)`,
                bottom: '50%',
              }}
            ></div>

            <div className="w-3 h-3 rounded-full bg-white border-2 border-black z-10"></div>
          </div>

          {/* Digital Time & Date */}
          <div className="text-center md:text-left space-y-2">
            <div className="inline-block px-3 py-1 bg-zinc-900 border border-zinc-700 text-white rounded-full text-xs font-mono font-bold">
              SYSTEM LOCAL TIME
            </div>
            <div className="text-4xl sm:text-5xl font-mono font-black text-white tracking-wider">
              {time.toLocaleTimeString()}
            </div>
            <p className="text-xs font-mono text-zinc-400">
              {time.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Stopwatch Card */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4 font-mono">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-white font-bold text-sm uppercase tracking-wider">
            <Watch className="w-4 h-4 text-white" /> Precision Stopwatch
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center">
            <div className="text-3xl font-mono font-black text-white tracking-widest">
              {formatSw(swTime)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSwRunning(!swRunning)}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                swRunning
                  ? 'bg-black border border-zinc-600 text-white hover:bg-zinc-900'
                  : 'bg-white text-black hover:bg-zinc-200'
              }`}
            >
              {swRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              {swRunning ? 'Pause' : 'Start'}
            </button>

            <button
              onClick={() => {
                if (swRunning) setLaps((prev) => [swTime, ...prev]);
              }}
              disabled={!swRunning}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-zinc-300 rounded-xl text-xs border border-zinc-700 cursor-pointer"
            >
              <Flag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                setSwRunning(false);
                setSwTime(0);
                setLaps([]);
              }}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs border border-zinc-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Laps List */}
          {laps.length > 0 && (
            <div className="max-h-28 overflow-y-auto space-y-1 pt-2 border-t border-zinc-800">
              {laps.map((lap, idx) => (
                <div key={idx} className="flex justify-between text-xs font-mono text-zinc-400 bg-black px-2.5 py-1 rounded border border-zinc-800">
                  <span>Lap {laps.length - idx}</span>
                  <span className="text-white font-bold">{formatSw(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Countdown & World Clocks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-mono">
        {/* Countdown Timer */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-white font-bold text-sm uppercase tracking-wider">
            <TimerIcon className="w-4 h-4 text-white" /> Alarm Timer
          </div>

          <div className="bg-black border border-zinc-800 rounded-xl p-4 text-center relative overflow-hidden">
            {timerAlert && (
              <div className="absolute inset-0 bg-white text-black font-bold text-sm flex items-center justify-center animate-bounce">
                <Bell className="w-5 h-5 mr-1" /> Timer Complete!
              </div>
            )}
            <div className="text-3xl font-mono font-black text-white tracking-widest">
              {formatTimer(timerSeconds)}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => startPresetTimer(1)} className="preset-btn">1m</button>
            <button onClick={() => startPresetTimer(5)} className="preset-btn">5m</button>
            <button onClick={() => startPresetTimer(10)} className="preset-btn">10m</button>
            <button onClick={() => startPresetTimer(25)} className="preset-btn">25m</button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setTimerRunning(!timerRunning)}
              className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs shadow cursor-pointer"
            >
              {timerRunning ? 'Pause' : 'Start Timer'}
            </button>
            <button
              onClick={() => {
                setTimerRunning(false);
                setTimerSeconds(timerInitial);
                setTimerAlert(false);
              }}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs border border-zinc-700 cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>

        {/* World Clocks */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800 text-white font-bold text-sm uppercase tracking-wider">
            <Globe className="w-4 h-4 text-white" /> World Timezones
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {WORLD_CITIES.map((city) => {
              const cityTime = new Date().toLocaleTimeString('en-US', {
                timeZone: city.timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div key={city.id} className="p-3 bg-black border border-zinc-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white">{city.cityName}</span>
                    <span className="text-[10px] text-zinc-500 truncate max-w-[80px]">{city.country}</span>
                  </div>
                  <div className="text-base font-mono font-bold text-white">
                    {cityTime}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
