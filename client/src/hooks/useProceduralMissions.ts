import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ProceduralMission {
  id: string;
  title: string;
  description: string;
  objective: string;
  type: 'kill_process' | 'delete_file' | 'find_and_report' | 'multi_step';
  targetPid?: number;
  targetPath?: string;
  searchPattern?: string;
  reportAnswer?: string;
  completed: boolean;
  difficulty: 1 | 2 | 3;
}

interface ProceduralMissionState {
  missions: ProceduralMission[];
  currentMission: ProceduralMission | null;
  completedCount: number;
  generateMission: () => ProceduralMission;
  completeMission: (missionId: string) => void;
  resetMissions: () => void;
}

const MALWARE_NAMES = [
  'backdoor_srv', 'cryptolock', 'shadow_miner', 'data_exfil', 'keylogger_v2',
  'trojan_horse', 'worm_spreader', 'ransomware_x', 'botnet_node', 'spyware_pro'
];

const MALWARE_FILES = [
  'payload.bin', 'stealer.exe', 'inject.dll', 'config.enc', 'beacon.dat',
  'rootkit.ko', 'miner.elf', 'dropper.sh', 'crypto.py', 'exfil.jar'
];

const ATTACK_IPS = [
  '185.220.101.33', '45.154.98.12', '91.232.105.88', '193.56.28.44', '77.91.68.100',
  '23.129.64.150', '104.244.72.115', '62.210.105.116', '185.130.44.108', '89.248.167.131'
];

const LOG_PATHS = ['/var/log/access.log', '/var/log/security.log', '/var/log/daemon.log'];

const DIRECTORIES = ['/tmp', '/var/tmp', '/home/guest', '/opt/malware', '/srv/cache'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomPid(): number {
  return Math.floor(Math.random() * 9000) + 1000;
}

function generateKillProcess(id: string, difficulty: 1 | 2 | 3): ProceduralMission {
  const name = randomElement(MALWARE_NAMES);
  const pid = randomPid();
  
  return {
    id,
    title: `Нейтрализация: ${name}`,
    description: `Обнаружен вредоносный процесс '${name}' с высокой нагрузкой CPU.`,
    objective: `Убейте процесс '${name}' (PID ${pid})\nИспользуйте: ps для просмотра, kill ${pid}`,
    type: 'kill_process',
    targetPid: pid,
    completed: false,
    difficulty
  };
}

function generateDeleteFile(id: string, difficulty: 1 | 2 | 3): ProceduralMission {
  const file = randomElement(MALWARE_FILES);
  const dir = randomElement(DIRECTORIES);
  const path = `${dir}/${file}`;
  
  return {
    id,
    title: `Удаление: ${file}`,
    description: `Обнаружен вредоносный файл в системе.`,
    objective: `Найдите и удалите файл ${path}\nИспользуйте: ls, cd, rm`,
    type: 'delete_file',
    targetPath: path,
    completed: false,
    difficulty
  };
}

function generateFindAndReport(id: string, difficulty: 1 | 2 | 3): ProceduralMission {
  const ip = randomElement(ATTACK_IPS);
  const logPath = randomElement(LOG_PATHS);
  
  return {
    id,
    title: 'Анализ логов',
    description: 'Требуется идентифицировать IP-адрес атакующего.',
    objective: `Найдите IP атакующего в ${logPath}\nИспользуйте: grep, cat\nОтправьте: submit_report [IP]`,
    type: 'find_and_report',
    targetPath: logPath,
    reportAnswer: ip,
    completed: false,
    difficulty
  };
}

function generateMultiStep(id: string): ProceduralMission {
  const name = randomElement(MALWARE_NAMES);
  const pid = randomPid();
  const file = randomElement(MALWARE_FILES);
  const dir = randomElement(DIRECTORIES);
  
  return {
    id,
    title: `Комплексная угроза: ${name}`,
    description: `Обнаружена сложная угроза, требующая нескольких действий.`,
    objective: `1. Убейте процесс ${name} (PID ${pid})\n2. Удалите файл ${dir}/${file}`,
    type: 'multi_step',
    targetPid: pid,
    targetPath: `${dir}/${file}`,
    completed: false,
    difficulty: 3
  };
}

export const useProceduralMissions = create<ProceduralMissionState>()(
  persist(
    (set, get) => ({
      missions: [],
      currentMission: null,
      completedCount: 0,
      
      generateMission: () => {
        const id = `proc_${Date.now()}`;
        const completedCount = get().completedCount;
        
        let difficulty: 1 | 2 | 3 = 1;
        if (completedCount >= 5) difficulty = 2;
        if (completedCount >= 10) difficulty = 3;
        
        const typeRoll = Math.random();
        let mission: ProceduralMission;
        
        if (difficulty === 3 && typeRoll > 0.7) {
          mission = generateMultiStep(id);
        } else if (typeRoll < 0.33) {
          mission = generateKillProcess(id, difficulty);
        } else if (typeRoll < 0.66) {
          mission = generateDeleteFile(id, difficulty);
        } else {
          mission = generateFindAndReport(id, difficulty);
        }
        
        set(state => ({
          missions: [...state.missions, mission],
          currentMission: mission
        }));
        
        return mission;
      },
      
      completeMission: (missionId: string) => {
        set(state => ({
          missions: state.missions.map(m =>
            m.id === missionId ? { ...m, completed: true } : m
          ),
          currentMission: null,
          completedCount: state.completedCount + 1
        }));
      },
      
      resetMissions: () => {
        set({
          missions: [],
          currentMission: null,
          completedCount: 0
        });
      }
    }),
    {
      name: 'cybershield-procedural-missions'
    }
  )
);
