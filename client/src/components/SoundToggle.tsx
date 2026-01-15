import { Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '@/lib/stores/useAudio';

export function SoundToggle() {
  const { isMuted, toggleMute, initializeAudio, startBackgroundMusic } = useAudio();
  
  const handleClick = () => {
    initializeAudio();
    toggleMute();
    if (isMuted) {
      startBackgroundMusic();
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 p-3 rounded-lg glass-panel hover:bg-white/10 transition-all"
      title={isMuted ? 'Включить звук' : 'Выключить звук'}
    >
      {isMuted ? (
        <VolumeX className="w-5 h-5 text-red-400" />
      ) : (
        <Volume2 className="w-5 h-5 text-green-400" />
      )}
    </button>
  );
}
