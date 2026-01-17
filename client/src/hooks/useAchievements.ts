import { create } from 'zustand';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

interface AchievementState {
  achievements: Achievement[];
  gameStartTime: number | null;
  commandCount: number;
  errorCount: number;
  
  startGame: () => void;
  incrementCommand: () => void;
  incrementError: () => void;
  checkAchievements: (missionId: number, allMissionsComplete: boolean) => Achievement[];
  resetProgress: () => void;
  applyUnlockedAchievements: (achievementIds: string[]) => void;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'Первая кровь',
    description: 'Завершите первую миссию',
    icon: '🎯',
    unlocked: false
  },
  {
    id: 'speed_demon',
    title: 'Демон скорости',
    description: 'Завершите любую миссию менее чем за 30 секунд',
    icon: '⚡',
    unlocked: false
  },
  {
    id: 'perfectionist',
    title: 'Перфекционист',
    description: 'Завершите миссию без единой ошибки',
    icon: '💎',
    unlocked: false
  },
  {
    id: 'cleanup_crew',
    title: 'Команда очистки',
    description: 'Удалите первый вредоносный файл',
    icon: '🧹',
    unlocked: false
  },
  {
    id: 'detective',
    title: 'Детектив',
    description: 'Найдите IP-адрес атакующего',
    icon: '🔍',
    unlocked: false
  },
  {
    id: 'codebreaker',
    title: 'Взломщик кодов',
    description: 'Расшифруйте и сохраните пароль',
    icon: '🔐',
    unlocked: false
  },
  {
    id: 'rootkit_slayer',
    title: 'Убийца руткитов',
    description: 'Уничтожьте руткит Nemesis',
    icon: '☠️',
    unlocked: false
  },
  {
    id: 'cyber_defender',
    title: 'Кибер-защитник',
    description: 'Завершите все миссии кампании',
    icon: '🛡️',
    unlocked: false
  },
  {
    id: 'speed_runner',
    title: 'Скоростной прохождец',
    description: 'Завершите всю кампанию менее чем за 10 минут',
    icon: '🏃',
    unlocked: false
  },
  {
    id: 'flawless',
    title: 'Безупречный',
    description: 'Завершите всю кампанию без ошибок',
    icon: '✨',
    unlocked: false
  },
  {
    id: 'terminal_master',
    title: 'Мастер терминала',
    description: 'Выполните 50 команд',
    icon: '💻',
    unlocked: false
  },
  {
    id: 'efficient',
    title: 'Эффективный',
    description: 'Завершите кампанию менее чем за 30 команд',
    icon: '🎖️',
    unlocked: false
  }
];

export const useAchievements = create<AchievementState>(
  (set, get) => ({
      achievements: INITIAL_ACHIEVEMENTS.map(a => ({ ...a })),
      gameStartTime: null,
      commandCount: 0,
      errorCount: 0,
      
      startGame: () => {
        set({
          gameStartTime: Date.now(),
          commandCount: 0,
          errorCount: 0
        });
      },
      
      incrementCommand: () => {
        set(state => ({ commandCount: state.commandCount + 1 }));
        
        const { commandCount, achievements } = get();
        if (commandCount + 1 >= 50) {
          const terminalMaster = achievements.find(a => a.id === 'terminal_master');
          if (terminalMaster && !terminalMaster.unlocked) {
            set({
              achievements: achievements.map(a =>
                a.id === 'terminal_master'
                  ? { ...a, unlocked: true, unlockedAt: Date.now() }
                  : a
              )
            });
          }
        }
      },
      
      incrementError: () => {
        set(state => ({ errorCount: state.errorCount + 1 }));
      },
      
      checkAchievements: (missionId: number, allMissionsComplete: boolean) => {
        const state = get();
        const { achievements, gameStartTime, errorCount, commandCount } = state;
        const newlyUnlocked: Achievement[] = [];
        
        const now = Date.now();
        const missionTime = gameStartTime ? (now - gameStartTime) / 1000 : Infinity;
        const totalTime = gameStartTime ? (now - gameStartTime) / 1000 / 60 : Infinity;
        
        const updatedAchievements = achievements.map(achievement => {
          if (achievement.unlocked) return achievement;
          
          let shouldUnlock = false;
          
          switch (achievement.id) {
            case 'first_blood':
              shouldUnlock = missionId >= 1;
              break;
            case 'speed_demon':
              shouldUnlock = missionTime < 30;
              break;
            case 'perfectionist':
              shouldUnlock = errorCount === 0 && missionId >= 1;
              break;
            case 'cleanup_crew':
              shouldUnlock = missionId >= 2;
              break;
            case 'detective':
              shouldUnlock = missionId >= 3;
              break;
            case 'codebreaker':
              shouldUnlock = missionId >= 4;
              break;
            case 'rootkit_slayer':
              shouldUnlock = missionId >= 5;
              break;
            case 'cyber_defender':
              shouldUnlock = allMissionsComplete;
              break;
            case 'speed_runner':
              shouldUnlock = allMissionsComplete && totalTime < 10;
              break;
            case 'flawless':
              shouldUnlock = allMissionsComplete && errorCount === 0;
              break;
            case 'efficient':
              shouldUnlock = allMissionsComplete && commandCount < 30;
              break;
          }
          
          if (shouldUnlock) {
            const unlocked = { ...achievement, unlocked: true, unlockedAt: now };
            newlyUnlocked.push(unlocked);
            return unlocked;
          }
          
          return achievement;
        });
        
        if (newlyUnlocked.length > 0) {
          set({ achievements: updatedAchievements });
        }
        
        return newlyUnlocked;
      },
      
      resetProgress: () => {
        set({
          gameStartTime: null,
          commandCount: 0,
          errorCount: 0
        });
      },

      applyUnlockedAchievements: (achievementIds: string[]) => {
        set((state) => ({
          achievements: state.achievements.map(a => 
            achievementIds.includes(a.id)
              ? { ...a, unlocked: true, unlockedAt: Date.now() }
              : a
          )
        }));
      }
    })
);
