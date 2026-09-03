import React, { useState } from 'react';
import { X, Delete, Equal } from 'lucide-react';

interface QuickCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [shouldResetDisplay, setShouldResetDisplay] = useState(false);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (display === '0' || shouldResetDisplay) {
      setDisplay(digit);
      setShouldResetDisplay(false);
    } else {
      setDisplay(display + digit);
    }
  };

  const handleOperator = (op: string) => {
    setEquation(`${display} ${op} `);
    setShouldResetDisplay(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setShouldResetDisplay(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleEqual = () => {
    if (!equation) return;
    try {
      const fullExpression = equation + display;
      // Sanitize expression
      const sanitized = fullExpression.replace(/×/g, '*').replace(/÷/g, '/');
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      setDisplay(String(Number(result.toFixed(4))));
      setEquation(`${fullExpression} =`);
      setShouldResetDisplay(true);
    } catch {
      setDisplay('Error');
      setShouldResetDisplay(true);
    }
  };

  const buttons = [
    { label: 'C', action: handleClear, color: 'bg-rose-100 text-rose-700 hover:bg-rose-200' },
    { label: '⌫', action: handleDelete, color: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
    { label: '%', action: () => { setDisplay(String(parseFloat(display) / 100)); }, color: 'bg-slate-200 text-slate-700 hover:bg-slate-300' },
    { label: '÷', action: () => handleOperator('/'), color: 'bg-blue-600 text-white hover:bg-blue-700 font-bold' },
    
    { label: '7', action: () => handleDigit('7'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '8', action: () => handleDigit('8'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '9', action: () => handleDigit('9'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '×', action: () => handleOperator('*'), color: 'bg-blue-600 text-white hover:bg-blue-700 font-bold' },
    
    { label: '4', action: () => handleDigit('4'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '5', action: () => handleDigit('5'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '6', action: () => handleDigit('6'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '-', action: () => handleOperator('-'), color: 'bg-blue-600 text-white hover:bg-blue-700 font-bold' },
    
    { label: '1', action: () => handleDigit('1'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '2', action: () => handleDigit('2'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '3', action: () => handleDigit('3'), color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '+', action: () => handleOperator('+'), color: 'bg-blue-600 text-white hover:bg-blue-700 font-bold' },
    
    { label: '0', action: () => handleDigit('0'), color: 'bg-white text-slate-800 hover:bg-slate-100 col-span-2' },
    { label: '.', action: () => { if (!display.includes('.')) handleDigit('.'); }, color: 'bg-white text-slate-800 hover:bg-slate-100' },
    { label: '=', action: handleEqual, color: 'bg-emerald-600 text-white hover:bg-emerald-700 font-bold' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl max-w-xs w-full overflow-hidden border border-slate-800 animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <span className="font-bold text-sm text-slate-200">UltimatePOS Quick Calculator</span>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display Screen */}
        <div className="p-4 bg-slate-950/80 text-right">
          <div className="text-xs font-mono text-slate-400 min-h-[16px]">{equation}</div>
          <div className="text-3xl font-black font-mono tracking-tight text-emerald-400 overflow-x-auto">
            {display}
          </div>
        </div>

        {/* Keypad */}
        <div className="p-3 grid grid-cols-4 gap-2 bg-slate-900">
          {buttons.map((b, idx) => (
            <button
              key={idx}
              onClick={b.action}
              className={`h-12 rounded-xl text-sm font-bold transition-all active:scale-95 shadow-xs flex items-center justify-center ${b.color} ${
                b.label === '0' ? 'col-span-2' : ''
              }`}
            >
              {b.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
