import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useAudio } from '@/lib/stores/useAudio';

export function Terminal() {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { terminalHistory, currentPath, executeCommand } = useGameEngine();
  const { playTyping, playHit, initializeAudio, startBackgroundMusic } = useAudio();
  
  useEffect(() => {
    initializeAudio();
  }, [initializeAudio]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [terminalHistory]);
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length > inputValue.length) {
      playTyping();
    }
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim();
      if (cmd) {
        playHit();
        startBackgroundMusic();
        executeCommand(cmd);
        setCommandHistory(prev => [...prev, cmd]);
        setHistoryIndex(-1);
      }
      setInputValue('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInputValue(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInputValue('');
        } else {
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[newIndex]);
        }
      }
    }
  };
  
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };
  
  const getLineColor = (type: string) => {
    switch (type) {
      case 'error': return 'text-red-500';
      case 'success': return 'text-green-400 glow-text';
      case 'system': return 'text-cyan-400';
      case 'input': return 'text-yellow-400';
      default: return 'text-green-400';
    }
  };
  
  return (
    <div 
      className="h-full flex flex-col glass-panel rounded-lg overflow-hidden"
      onClick={handleContainerClick}
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-black/40">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="ml-4 text-sm text-white/60">CYBERSHIELD TERMINAL</span>
        <span className="ml-auto text-xs text-green-400/60">{currentPath}</span>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 scrollbar-cyber"
      >
        {terminalHistory.map((line) => (
          <div 
            key={line.id} 
            className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${getLineColor(line.type)}`}
          >
            {line.content}
          </div>
        ))}
      </div>
      
      <div className="flex items-center px-4 py-3 border-t border-white/10 bg-black/40">
        <span className="text-green-400 mr-2">
          <span className="text-cyan-400">{currentPath}</span>
          <span className="text-yellow-400"> $</span>
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="terminal-input flex-1 text-sm"
          placeholder="Введите команду..."
          autoComplete="off"
          spellCheck={false}
        />
        <span className="cursor-blink text-green-400">█</span>
      </div>
    </div>
  );
}
