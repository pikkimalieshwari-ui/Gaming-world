import React, { useState } from 'react';
import { Calculator as CalcIcon, History, Copy, Check } from 'lucide-react';
import { CalculatorHistoryItem } from '../types';

export const CalculatorTab: React.FC = () => {
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<CalculatorHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'standard' | 'scientific'>('standard');

  const handleInput = (val: string) => {
    if (display === '0' || display === 'Error') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
  };

  const handleDelete = () => {
    if (display.length <= 1 || display === 'Error') {
      setDisplay('0');
    } else {
      setDisplay((prev) => prev.slice(0, -1));
    }
  };

  const handleScientificMath = (fn: string) => {
    try {
      const num = parseFloat(display);
      let res = 0;
      let expLabel = `${fn}(${display})`;

      switch (fn) {
        case 'sin':
          res = Math.sin((num * Math.PI) / 180);
          break;
        case 'cos':
          res = Math.cos((num * Math.PI) / 180);
          break;
        case 'tan':
          res = Math.tan((num * Math.PI) / 180);
          break;
        case 'sqrt':
          res = Math.sqrt(num);
          expLabel = `√(${display})`;
          break;
        case 'log':
          res = Math.log10(num);
          break;
        case 'ln':
          res = Math.log(num);
          break;
        case 'sqr':
          res = Math.pow(num, 2);
          expLabel = `(${display})²`;
          break;
      }

      const resStr = Number.isInteger(res) ? res.toString() : parseFloat(res.toFixed(8)).toString();
      setDisplay(resStr);
      setExpression(expLabel);

      const newItem: CalculatorHistoryItem = {
        id: 'item_' + Date.now(),
        expression: expLabel,
        result: resStr,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    } catch {
      setDisplay('Error');
    }
  };

  const handleEvaluate = () => {
    try {
      let sanitized = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, Math.PI.toString())
        .replace(/e/g, Math.E.toString());

      // eslint-disable-next-line no-eval
      const evalResult = eval(sanitized);
      const formatted = Number.isInteger(evalResult)
        ? evalResult.toString()
        : parseFloat(evalResult.toFixed(8)).toString();

      setExpression(display + ' =');
      setDisplay(formatted);

      const newItem: CalculatorHistoryItem = {
        id: 'item_' + Date.now(),
        expression: display,
        result: formatted,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);
    } catch {
      setDisplay('Error');
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 text-white font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-black border border-zinc-800 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white text-black rounded-2xl font-bold">
            <CalcIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Scientific Calculator</h1>
            <p className="text-xs font-mono text-zinc-400">High precision calculations & history</p>
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-zinc-950 border border-zinc-800 p-1 rounded-xl font-mono text-xs">
          <button
            onClick={() => setMode('standard')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              mode === 'standard' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Standard
          </button>
          <button
            onClick={() => setMode('scientific')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              mode === 'scientific' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Scientific
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Keypad */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-5">
          {/* Display Monitor */}
          <div className="bg-black border border-zinc-800 rounded-2xl p-5 shadow-inner text-right relative space-y-1">
            <div className="text-xs font-mono text-zinc-400 h-5 overflow-hidden font-medium">
              {expression}
            </div>
            <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-wider truncate">
              {display}
            </div>

            <button
              onClick={copyResult}
              title="Copy result"
              className="absolute left-3 top-3 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs border border-zinc-800 transition flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Scientific Rows */}
          {mode === 'scientific' && (
            <div className="grid grid-cols-5 gap-2">
              <button onClick={() => handleScientificMath('sin')} className="calc-btn-sci">sin</button>
              <button onClick={() => handleScientificMath('cos')} className="calc-btn-sci">cos</button>
              <button onClick={() => handleScientificMath('tan')} className="calc-btn-sci">tan</button>
              <button onClick={() => handleScientificMath('sqrt')} className="calc-btn-sci">√x</button>
              <button onClick={() => handleScientificMath('sqr')} className="calc-btn-sci">x²</button>

              <button onClick={() => handleScientificMath('log')} className="calc-btn-sci">log</button>
              <button onClick={() => handleScientificMath('ln')} className="calc-btn-sci">ln</button>
              <button onClick={() => handleInput('π')} className="calc-btn-sci">π</button>
              <button onClick={() => handleInput('e')} className="calc-btn-sci">e</button>
              <button onClick={() => handleInput('%')} className="calc-btn-sci">%</button>
            </div>
          )}

          {/* Keypad Grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <button onClick={handleClear} className="py-3.5 bg-black hover:bg-zinc-800 text-white font-mono font-bold rounded-xl text-sm border border-zinc-700 transition cursor-pointer">
              AC
            </button>
            <button onClick={handleDelete} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-mono font-bold rounded-xl text-sm border border-zinc-700 transition cursor-pointer">
              DEL
            </button>
            <button onClick={() => handleInput('(')} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold rounded-xl text-sm border border-zinc-700 transition cursor-pointer">
              (
            </button>
            <button onClick={() => handleInput(')')} className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold rounded-xl text-sm border border-zinc-700 transition cursor-pointer">
              )
            </button>

            <button onClick={() => handleInput('7')} className="calc-btn-num">7</button>
            <button onClick={() => handleInput('8')} className="calc-btn-num">8</button>
            <button onClick={() => handleInput('9')} className="calc-btn-num">9</button>
            <button onClick={() => handleInput(' ÷ ')} className="calc-btn-op">÷</button>

            <button onClick={() => handleInput('4')} className="calc-btn-num">4</button>
            <button onClick={() => handleInput('5')} className="calc-btn-num">5</button>
            <button onClick={() => handleInput('6')} className="calc-btn-num">6</button>
            <button onClick={() => handleInput(' × ')} className="calc-btn-op">×</button>

            <button onClick={() => handleInput('1')} className="calc-btn-num">1</button>
            <button onClick={() => handleInput('2')} className="calc-btn-num">2</button>
            <button onClick={() => handleInput('3')} className="calc-btn-num">3</button>
            <button onClick={() => handleInput(' - ')} className="calc-btn-op">-</button>

            <button onClick={() => handleInput('0')} className="calc-btn-num">0</button>
            <button onClick={() => handleInput('.')} className="calc-btn-num">.</button>
            <button onClick={handleEvaluate} className="py-3.5 bg-white hover:bg-zinc-200 text-black font-black rounded-xl text-lg shadow transition cursor-pointer font-mono">
              =
            </button>
            <button onClick={() => handleInput(' + ')} className="calc-btn-op">+</button>
          </div>
        </div>

        {/* History Sidebar */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-white" />
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">History Log</h3>
            </div>
            {history.length > 0 && (
              <button
                onClick={() => setHistory([])}
                className="text-[11px] font-mono text-zinc-500 hover:text-white transition underline cursor-pointer"
              >
                Clear Log
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <div className="text-center py-12 text-zinc-600 text-xs font-mono">
                Calculation logs will appear here.
              </div>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDisplay(item.result)}
                  className="w-full text-right p-3 bg-black hover:bg-zinc-900 border border-zinc-800 rounded-xl transition group cursor-pointer"
                >
                  <div className="text-[10px] text-zinc-500 font-mono flex justify-between">
                    <span>{item.timestamp}</span>
                    <span>{item.expression}</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white mt-0.5">
                    = {item.result}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
