import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  typingSound: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  
  initializeAudio: () => void;
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playTyping: () => void;
  startBackgroundMusic: () => void;
  stopBackgroundMusic: () => void;
}

export const useAudio = create<AudioState>((set, get) => {
  // Загружаем сохраненное состояние мута из localStorage
  let initialMutedState = false;
  try {
    const user = localStorage.getItem('cybershield_user');
    if (user) {
      const { username } = JSON.parse(user);
      const audioKey = `cybershield_audio_${username}`;
      const saved = localStorage.getItem(audioKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        initialMutedState = parsed.isMuted || false;
        console.log('[useAudio] Loaded mute state from localStorage:', initialMutedState);
      }
    }
  } catch (e) {
    console.error('Failed to load audio state from localStorage:', e);
  }
  
  return {
    backgroundMusic: null,
    hitSound: null,
    successSound: null,
    typingSound: null,
    isMuted: initialMutedState,
    isInitialized: false,
    
    initializeAudio: () => {
      if (get().isInitialized) return;
      
      const bgMusic = new Audio('/sounds/background.mp3');
      bgMusic.loop = true;
      bgMusic.volume = 0.15;
      
      const hit = new Audio('/sounds/hit.mp3');
      hit.volume = 0.4;
      
      const success = new Audio('/sounds/success.mp3');
      success.volume = 0.5;
      
      const typing = new Audio('/sounds/hit.mp3');
      typing.volume = 0.1;
      
      set({
        backgroundMusic: bgMusic,
        hitSound: hit,
        successSound: success,
        typingSound: typing,
        isInitialized: true
      });
    },
    
    toggleMute: () => {
      const { isMuted, backgroundMusic } = get();
      const newMutedState = !isMuted;
      
      set({ isMuted: newMutedState });
      
      // Сохранить в localStorage
      try {
        const user = localStorage.getItem('cybershield_user');
        if (user) {
          const { username } = JSON.parse(user);
          const audioKey = `cybershield_audio_${username}`;
          localStorage.setItem(audioKey, JSON.stringify({ isMuted: newMutedState }));
        }
      } catch (e) {
        console.error('Failed to save audio state to localStorage:', e);
      }
      
      if (backgroundMusic) {
        if (newMutedState) {
          backgroundMusic.pause();
        } else {
          backgroundMusic.play().catch(() => {});
        }
      }
    },
    
    startBackgroundMusic: () => {
      const { backgroundMusic, isMuted } = get();
      if (backgroundMusic && !isMuted) {
        backgroundMusic.play().catch(() => {});
      }
    },
    
    stopBackgroundMusic: () => {
      const { backgroundMusic } = get();
      if (backgroundMusic) {
        backgroundMusic.pause();
        backgroundMusic.currentTime = 0;
      }
    },
    
    playHit: () => {
      const { hitSound, isMuted } = get();
      if (hitSound && !isMuted) {
        const soundClone = hitSound.cloneNode() as HTMLAudioElement;
        soundClone.volume = 0.3;
        soundClone.play().catch(() => {});
      }
    },
    
    playSuccess: () => {
      const { successSound, isMuted } = get();
      if (successSound && !isMuted) {
        successSound.currentTime = 0;
        successSound.play().catch(() => {});
      }
    },
    
    playTyping: () => {
    const { typingSound, isMuted } = get();
    if (typingSound && !isMuted) {
      const soundClone = typingSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.05;
      soundClone.playbackRate = 1.5;
      soundClone.play().catch(() => {});
    }
  }
}));
