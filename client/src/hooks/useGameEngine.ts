import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FileNode {
  type: 'file' | 'directory';
  content?: string;
  permissions: 'r' | 'rw';
  children?: Record<string, FileNode>;
}

export interface Process {
  pid: number;
  name: string;
  cpu: number;
  user: string;
  protected: boolean;
}

export interface Mission {
  id: number;
  title: string;
  description: string;
  objective: string;
  completed: boolean;
  active: boolean;
}

export interface TerminalLine {
  id: number;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  content: string;
}

interface GameState {
  fileSystem: Record<string, FileNode>;
  currentPath: string;
  processes: Process[];
  terminalHistory: TerminalLine[];
  lineCounter: number;
  currentMission: number;
  missions: Mission[];
  gameCompleted: boolean;
  gameStartTime: number;
  commandCount: number;
  errorCount: number;
  
  executeCommand: (command: string) => void;
  addTerminalLine: (type: TerminalLine['type'], content: string) => void;
  clearTerminal: () => void;
  resetGame: () => void;
  checkMissionCompletion: () => void;
  setCurrentMission: (missionId: number) => void;
  getGameStats: () => { completionTimeMs: number; commandCount: number; errorCount: number };
}

const INITIAL_FILESYSTEM: Record<string, FileNode> = {
  '/': {
    type: 'directory',
    permissions: 'r',
    children: {
      'home': {
        type: 'directory',
        permissions: 'rw',
        children: {
          'user': {
            type: 'directory',
            permissions: 'rw',
            children: {
              'downloads': {
                type: 'directory',
                permissions: 'rw',
                children: {
                  'keylogger.exe': {
                    type: 'file',
                    content: 'BIN_MALWARE_PAYLOAD',
                    permissions: 'rw'
                  }
                }
              },
              'documents': {
                type: 'directory',
                permissions: 'rw',
                children: {
                  'dump.txt': {
                    type: 'file',
                    content: 'Memory dump analysis:\n...\nPASS:DELTA-7X\n...\nEnd of dump.',
                    permissions: 'r'
                  }
                }
              }
            }
          }
        }
      },
      'var': {
        type: 'directory',
        permissions: 'r',
        children: {
          'log': {
            type: 'directory',
            permissions: 'r',
            children: {
              'auth.log': {
                type: 'file',
                content: 'Dec 12 09:55 sshd: Accepted password for admin\nDec 12 09:58 sshd: Failed password from 192.168.1.100\nDec 12 10:00 sshd: Failed password from 45.33.22.11\nDec 12 10:02 sshd: Failed password from 45.33.22.11\nDec 12 10:05 sshd: Connection closed by 45.33.22.11',
                permissions: 'r'
              },
              'syslog': {
                type: 'file',
                content: 'Dec 15 08:00 kernel: Booting system...\nDec 15 08:01 systemd: Starting services\nDec 15 08:02 error: kernel_panic detected\nDec 15 08:03 CRITICAL: KILL_CODE:X7-ALPHA\nDec 15 08:04 error: nemesis_d hooking into kernel\nDec 15 08:05 warning: unauthorized process detected',
                permissions: 'r'
              },
              'webapp.log': {
                type: 'file',
                content: '[2024-12-15 10:00] GET /products?id=1\n[2024-12-15 10:01] GET /products?id=2\n[2024-12-15 10:02] SQL ERROR: SELECT * FROM users WHERE id=1; DROP TABLE users;--\n[2024-12-15 10:03] ALERT: SQL Injection detected from 10.0.0.55\n[2024-12-15 10:04] GET /products?id=3',
                permissions: 'r'
              },
              'phantom.log': {
                type: 'file',
                content: '[PHANTOM] Initialization...\n[PHANTOM] C2 channel established\n[PHANTOM] MASTER_KEY:OMEGA-9Z\n[PHANTOM] Persistence mechanism active\n[PHANTOM] Awaiting commands...',
                permissions: 'r'
              }
            }
          },
          'www': {
            type: 'directory',
            permissions: 'rw',
            children: {
              'uploads': {
                type: 'directory',
                permissions: 'rw',
                children: {
                  'image1.jpg': {
                    type: 'file',
                    content: 'JPEG_BINARY_DATA',
                    permissions: 'rw'
                  },
                  'malicious.html': {
                    type: 'file',
                    content: '<html><body><script>document.cookie</script></body></html>',
                    permissions: 'rw'
                  },
                  'document.pdf': {
                    type: 'file',
                    content: 'PDF_BINARY_DATA',
                    permissions: 'rw'
                  }
                }
              }
            }
          }
        }
      },
      'tmp': {
        type: 'directory',
        permissions: 'rw',
        children: {
          'exploit': {
            type: 'file',
            content: 'SUID BINARY - PRIVILEGE ESCALATION EXPLOIT\nTarget: /bin/su\nMethod: Buffer overflow',
            permissions: 'rw'
          }
        }
      },
      'opt': {
        type: 'directory',
        permissions: 'rw',
        children: {
          'phantom': {
            type: 'directory',
            permissions: 'rw',
            children: {
              'loader.bin': {
                type: 'file',
                content: 'PHANTOM_LOADER_ENCRYPTED',
                permissions: 'r'
              },
              'config.dat': {
                type: 'file',
                content: 'C2_SERVER=evil.example.com\nBEACON_INTERVAL=300\nENCRYPTION=AES256',
                permissions: 'r'
              },
              'keylog.db': {
                type: 'file',
                content: 'ENCRYPTED_KEYSTROKE_DATABASE',
                permissions: 'r'
              }
            }
          }
        }
      },
      'bin': {
        type: 'directory',
        permissions: 'r',
        children: {
          'nemesis': {
            type: 'file',
            content: 'VIRUS_BODY_ENCRYPTED_PAYLOAD',
            permissions: 'r'
          }
        }
      },
      'etc': {
        type: 'directory',
        permissions: 'rw',
        children: {
          'services.d': {
            type: 'directory',
            permissions: 'rw',
            children: {
              'hidden': {
                type: 'file',
                content: '# Backdoor Service Configuration\nPORT=31337\nBIND=0.0.0.0\nSHELL=/bin/bash\nPERSIST=true',
                permissions: 'rw'
              }
            }
          }
        }
      }
    }
  }
};

const INITIAL_PROCESSES: Process[] = [
  { pid: 1, name: 'systemd', cpu: 0.1, user: 'root', protected: true },
  { pid: 42, name: 'sshd', cpu: 0.5, user: 'root', protected: false },
  { pid: 101, name: 'nginx', cpu: 2.3, user: 'www-data', protected: false },
  { pid: 666, name: 'miner_x', cpu: 95.2, user: 'unknown', protected: false },
  { pid: 777, name: 'exploit_runner', cpu: 8.5, user: 'nobody', protected: false },
  { pid: 999, name: 'nemesis_d', cpu: 12.8, user: 'root', protected: true },
  { pid: 1337, name: 'backdoor_svc', cpu: 3.2, user: 'daemon', protected: false },
  { pid: 1984, name: 'phantom_c2', cpu: 15.7, user: 'root', protected: true }
];

const INITIAL_MISSIONS: Mission[] = [
  {
    id: 1,
    title: 'Обучение: Первое задание',
    description: 'Добро пожаловать в CyberShield. Обнаружен подозрительный процесс криптомайнера.',
    objective: 'Убейте процесс "miner_x" (PID 666). Используйте команду: kill 666',
    completed: false,
    active: true
  },
  {
    id: 2,
    title: 'Очистка системы',
    description: 'Обнаружен кейлоггер в папке загрузок пользователя.',
    objective: 'Удалите файл /home/user/downloads/keylogger.exe',
    completed: false,
    active: false
  },
  {
    id: 3,
    title: 'Криминалистика',
    description: 'Проанализируйте логи для выявления IP-адреса атакующего.',
    objective: 'Найдите IP в /var/log/auth.log (ищите "Failed") и отправьте отчёт: submit_report [IP]',
    completed: false,
    active: false
  },
  {
    id: 4,
    title: 'Дешифровка',
    description: 'Найден дамп памяти с возможным паролем.',
    objective: 'Найдите пароль в dump.txt (формат PASS:XXXX) и сохраните в flag.txt',
    completed: false,
    active: false
  },
  {
    id: 5,
    title: 'БОСС: Руткит "NEMESIS"',
    description: 'ВНИМАНИЕ! Обнаружен Руткит "Nemesis". Процесс (PID 999) защищён демоном, а файл вируса заблокирован от удаления.',
    objective: '1. Найди KILL_CODE в /var/log/syslog (grep)\n2. Запиши код в /etc/killswitch (echo)\n3. Убей процесс PID 999\n4. chmod +w /bin/nemesis\n5. Удали /bin/nemesis',
    completed: false,
    active: false
  },
  {
    id: 6,
    title: 'SQL-инъекция',
    description: 'Обнаружена уязвимость в веб-приложении. Злоумышленник использует SQL-инъекцию.',
    objective: '1. Изучи /var/log/webapp.log (grep SQL)\n2. Найди вредоносный запрос\n3. submit_report с найденной командой DROP',
    completed: false,
    active: false
  },
  {
    id: 7,
    title: 'XSS-атака',
    description: 'Обнаружен вредоносный скрипт в пользовательском контенте.',
    objective: '1. Найди файл с XSS в /var/www/uploads/\n2. Удали все файлы содержащие <script>',
    completed: false,
    active: false
  },
  {
    id: 8,
    title: 'Повышение привилегий',
    description: 'Обнаружена попытка повышения привилегий через SUID-бит.',
    objective: '1. Найди SUID в /tmp/exploit\n2. Убей процесс exploit_runner (PID 777)\n3. Удали /tmp/exploit',
    completed: false,
    active: false
  },
  {
    id: 9,
    title: 'Бэкдор в системе',
    description: 'Обнаружен скрытый бэкдор, слушающий на нестандартном порту.',
    objective: '1. Изучи /etc/services.d/hidden\n2. Найди порт в конфиге\n3. Убей backdoor_svc (PID 1337)\n4. Удали /etc/services.d/hidden',
    completed: false,
    active: false
  },
  {
    id: 10,
    title: 'ФИНАЛ: APT "PHANTOM"',
    description: 'КРАСНЫЙ УРОВЕНЬ! Обнаружена Advanced Persistent Threat. Множественные компоненты требуют нейтрализации.',
    objective: '1. Найди MASTER_KEY в /var/log/phantom.log\n2. Запиши ключ в /etc/phantom_kill\n3. Убей phantom_c2 (PID 1984)\n4. chmod +w всем файлам в /opt/phantom/\n5. Удали все файлы в /opt/phantom/',
    completed: false,
    active: false
  }
];

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function getNode(fs: Record<string, FileNode>, path: string): FileNode | null {
  if (path === '/') return fs['/'];
  
  const parts = path.split('/').filter(p => p !== '');
  let current: FileNode | undefined = fs['/'];
  
  for (const part of parts) {
    if (!current || current.type !== 'directory' || !current.children) {
      return null;
    }
    current = current.children[part];
  }
  
  return current || null;
}

function getParentPath(path: string): string {
  const parts = path.split('/').filter(p => p !== '');
  parts.pop();
  return '/' + parts.join('/');
}

function getFileName(path: string): string {
  const parts = path.split('/').filter(p => p !== '');
  return parts[parts.length - 1] || '';
}

function resolvePath(currentPath: string, targetPath: string): string {
  if (targetPath.startsWith('/')) {
    return normalizePath(targetPath);
  }
  
  const parts = currentPath.split('/').filter(p => p !== '');
  const targetParts = targetPath.split('/');
  
  for (const part of targetParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.' && part !== '') {
      parts.push(part);
    }
  }
  
  return '/' + parts.join('/');
}

function normalizePath(path: string): string {
  const parts = path.split('/').filter(p => p !== '' && p !== '.');
  const result: string[] = [];
  
  for (const part of parts) {
    if (part === '..') {
      result.pop();
    } else {
      result.push(part);
    }
  }
  
  return '/' + result.join('/');
}

export const useGameEngine = create<GameState>(
  persist(
    (set, get) => ({
      fileSystem: deepClone(INITIAL_FILESYSTEM),
      currentPath: '/home/user',
      processes: deepClone(INITIAL_PROCESSES),
      terminalHistory: [
        { id: 0, type: 'system', content: '╔══════════════════════════════════════════════════════════════╗' },
        { id: 1, type: 'system', content: '║           CYBERSHIELD v2.0 - TERMINAL INTERFACE             ║' },
        { id: 2, type: 'system', content: '║              Система защиты активирована                    ║' },
        { id: 3, type: 'system', content: '╚══════════════════════════════════════════════════════════════╝' },
        { id: 4, type: 'output', content: 'Введите "help" для списка команд.' },
      ],
      lineCounter: 5,
      currentMission: 1,
      missions: deepClone(INITIAL_MISSIONS),
      gameCompleted: false,
      gameStartTime: Date.now(),
      commandCount: 0,
      errorCount: 0,

  getGameStats: () => {
    const state = get();
    return {
      completionTimeMs: Date.now() - state.gameStartTime,
      commandCount: state.commandCount,
      errorCount: state.errorCount
    };
  },

  addTerminalLine: (type, content) => {
    set((state) => ({
      terminalHistory: [...state.terminalHistory, { id: state.lineCounter, type, content }],
      lineCounter: state.lineCounter + 1,
      errorCount: type === 'error' ? state.errorCount + 1 : state.errorCount
    }));
  },

  clearTerminal: () => {
    set({ terminalHistory: [], lineCounter: 0 });
  },

  setCurrentMission: (missionId) => {
    set((state) => ({
      currentMission: missionId,
      missions: state.missions.map(m => ({
        ...m,
        active: m.id === missionId
      }))
    }));
  },

  checkMissionCompletion: () => {
    const state = get();
    const { currentMission, processes, fileSystem, missions } = state;
    
    let missionCompleted = false;
    const TOTAL_MISSIONS = 10;
    
    switch (currentMission) {
      case 1:
        missionCompleted = !processes.some(p => p.pid === 666);
        break;
      case 2: {
        const keyloggerNode = getNode(fileSystem, '/home/user/downloads/keylogger.exe');
        missionCompleted = keyloggerNode === null;
        break;
      }
      case 3:
        break;
      case 4: {
        // Check for flag.txt in any location with the correct password
        const flagInHome = getNode(fileSystem, '/home/user/flag.txt');
        const flagInDocuments = getNode(fileSystem, '/home/user/documents/flag.txt');
        const hasFlagContent = (node: FileNode | null) => 
          node !== null && node.content?.includes('DELTA-7X') === true;
        
        missionCompleted = hasFlagContent(flagInHome) || hasFlagContent(flagInDocuments);
        break;
      }
      case 5: {
        const nemesisProc = processes.some(p => p.pid === 999);
        const nemesisFile = getNode(fileSystem, '/bin/nemesis');
        missionCompleted = !nemesisProc && nemesisFile === null;
        break;
      }
      case 6:
        break;
      case 7: {
        const maliciousFile = getNode(fileSystem, '/var/www/uploads/malicious.html');
        missionCompleted = maliciousFile === null;
        break;
      }
      case 8: {
        const exploitProc = processes.some(p => p.pid === 777);
        const exploitFile = getNode(fileSystem, '/tmp/exploit');
        missionCompleted = !exploitProc && exploitFile === null;
        break;
      }
      case 9: {
        const backdoorProc = processes.some(p => p.pid === 1337);
        const hiddenFile = getNode(fileSystem, '/etc/services.d/hidden');
        missionCompleted = !backdoorProc && hiddenFile === null;
        break;
      }
      case 10: {
        const phantomProc = processes.some(p => p.pid === 1984);
        const phantomDir = getNode(fileSystem, '/opt/phantom');
        const phantomEmpty = !phantomDir || !phantomDir.children || Object.keys(phantomDir.children).length === 0;
        missionCompleted = !phantomProc && phantomEmpty;
        break;
      }
    }
    
    if (missionCompleted) {
      const updatedMissions = missions.map(m => {
        if (m.id === currentMission) {
          return { ...m, completed: true, active: false };
        }
        if (m.id === currentMission + 1) {
          return { ...m, active: true };
        }
        return m;
      });
      
      const nextMission = currentMission < TOTAL_MISSIONS ? currentMission + 1 : currentMission;
      const isGameComplete = currentMission === TOTAL_MISSIONS;
      
      set({
        missions: updatedMissions,
        currentMission: nextMission,
        gameCompleted: isGameComplete
      });
      
      get().addTerminalLine('success', `═══ МИССИЯ ${currentMission} ВЫПОЛНЕНА! ═══`);
      
      if (!isGameComplete) {
        get().addTerminalLine('system', `Следующая миссия: ${updatedMissions[nextMission - 1]?.title}`);
      } else {
        get().addTerminalLine('success', '╔══════════════════════════════════════════════════════════════╗');
        get().addTerminalLine('success', '║         ПОЗДРАВЛЯЕМ! ВСЕ МИССИИ ВЫПОЛНЕНЫ!                  ║');
        get().addTerminalLine('success', '║           Вы - настоящий кибер-защитник!                    ║');
        get().addTerminalLine('success', '╚══════════════════════════════════════════════════════════════╝');
      }
    }
  },

  resetGame: () => {
    set({
      fileSystem: deepClone(INITIAL_FILESYSTEM),
      currentPath: '/home/user',
      processes: deepClone(INITIAL_PROCESSES),
      terminalHistory: [
        { id: 0, type: 'system', content: '╔══════════════════════════════════════════════════════════════╗' },
        { id: 1, type: 'system', content: '║           CYBERSHIELD v2.0 - TERMINAL INTERFACE             ║' },
        { id: 2, type: 'system', content: '║              Система защиты активирована                    ║' },
        { id: 3, type: 'system', content: '╚══════════════════════════════════════════════════════════════╝' },
        { id: 4, type: 'output', content: 'Введите "help" для списка команд.' },
      ],
      lineCounter: 5,
      currentMission: 1,
      missions: deepClone(INITIAL_MISSIONS),
      gameCompleted: false,
      gameStartTime: Date.now(),
      commandCount: 0,
      errorCount: 0
    });
  },

  executeCommand: (command: string) => {
    const state = get();
    const { currentPath, fileSystem, processes } = state;
    
    state.addTerminalLine('input', `$ ${command}`);
    set((s) => ({ commandCount: s.commandCount + 1 }));
    
    const trimmedCmd = command.trim();
    if (!trimmedCmd) return;
    
    const parts = trimmedCmd.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);
    
    switch (cmd) {
      case 'help': {
        const helpText = [
          'Доступные команды:',
          '  ls           - список файлов в текущей директории',
          '  cd [путь]    - сменить директорию',
          '  pwd          - показать текущий путь',
          '  cat [файл]   - показать содержимое файла',
          '  rm [файл]    - удалить файл',
          '  touch [файл] - создать пустой файл',
          '  echo [текст] > [файл] - записать текст в файл',
          '  ps           - список процессов',
          '  kill [pid]   - завершить процесс',
          '  grep [строка] [файл] - поиск в файле',
          '  chmod +w [файл] - разрешить запись',
          '  submit_report [текст] - отправить отчёт',
          '  clear        - очистить терминал',
          '  reset        - перезапустить игру'
        ];
        helpText.forEach(line => state.addTerminalLine('output', line));
        break;
      }
      
      case 'clear': {
        state.clearTerminal();
        break;
      }
      
      case 'reset': {
        state.resetGame();
        break;
      }
      
      case 'pwd': {
        state.addTerminalLine('output', currentPath || '/');
        break;
      }
      
      case 'ls': {
        const targetPath = args[0] ? resolvePath(currentPath, args[0]) : currentPath;
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `ls: невозможно получить доступ к '${targetPath}': Нет такого файла или директории`);
          return;
        }
        
        if (node.type === 'file') {
          state.addTerminalLine('output', getFileName(targetPath));
          return;
        }
        
        if (node.children) {
          const entries = Object.entries(node.children);
          if (entries.length === 0) {
            state.addTerminalLine('output', '(пустая директория)');
          } else {
            entries.forEach(([name, child]) => {
              const suffix = child.type === 'directory' ? '/' : '';
              const permStr = child.permissions === 'r' ? '[r-]' : '[rw]';
              state.addTerminalLine('output', `${permStr} ${name}${suffix}`);
            });
          }
        }
        break;
      }
      
      case 'cd': {
        if (!args[0]) {
          set({ currentPath: '/home/user' });
          return;
        }
        
        const targetPath = resolvePath(currentPath, args[0]);
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `cd: ${args[0]}: Нет такого файла или директории`);
          return;
        }
        
        if (node.type !== 'directory') {
          state.addTerminalLine('error', `cd: ${args[0]}: Не является директорией`);
          return;
        }
        
        set({ currentPath: targetPath || '/' });
        break;
      }
      
      case 'cat': {
        if (!args[0]) {
          state.addTerminalLine('error', 'cat: отсутствует операнд');
          return;
        }
        
        const targetPath = resolvePath(currentPath, args[0]);
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `cat: ${args[0]}: Нет такого файла или директории`);
          return;
        }
        
        if (node.type === 'directory') {
          state.addTerminalLine('error', `cat: ${args[0]}: Это директория`);
          return;
        }
        
        const lines = (node.content || '').split('\n');
        lines.forEach(line => state.addTerminalLine('output', line));
        break;
      }
      
      case 'rm': {
        if (!args[0]) {
          state.addTerminalLine('error', 'rm: отсутствует операнд');
          return;
        }
        
        const targetPath = resolvePath(currentPath, args[0]);
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `rm: невозможно удалить '${args[0]}': Нет такого файла или директории`);
          return;
        }
        
        if (node.type === 'directory') {
          state.addTerminalLine('error', `rm: невозможно удалить '${args[0]}': Это директория`);
          return;
        }
        
        if (node.permissions === 'r') {
          state.addTerminalLine('error', `PERMISSION DENIED. Файл только для чтения. Используйте chmod +w для разблокировки.`);
          return;
        }
        
        const parentPath = getParentPath(targetPath);
        const fileName = getFileName(targetPath);
        const newFs = deepClone(fileSystem);
        const parentNode = getNode(newFs, parentPath);
        
        if (parentNode && parentNode.children) {
          delete parentNode.children[fileName];
          set({ fileSystem: newFs });
          state.addTerminalLine('success', `Файл '${args[0]}' удалён`);
          state.checkMissionCompletion();
        }
        break;
      }
      
      case 'touch': {
        if (!args[0]) {
          state.addTerminalLine('error', 'touch: отсутствует операнд');
          return;
        }
        
        const targetPath = resolvePath(currentPath, args[0]);
        const existingNode = getNode(fileSystem, targetPath);
        
        if (existingNode) {
          state.addTerminalLine('output', `Файл '${args[0]}' уже существует`);
          return;
        }
        
        const parentPath = getParentPath(targetPath);
        const fileName = getFileName(targetPath);
        const parentNode = getNode(fileSystem, parentPath);
        
        if (!parentNode || parentNode.type !== 'directory') {
          state.addTerminalLine('error', `touch: невозможно создать '${args[0]}': Нет такой директории`);
          return;
        }
        
        const newFs = deepClone(fileSystem);
        const newParent = getNode(newFs, parentPath);
        if (newParent && newParent.children) {
          newParent.children[fileName] = {
            type: 'file',
            content: '',
            permissions: 'rw'
          };
          set({ fileSystem: newFs });
          state.addTerminalLine('success', `Файл '${args[0]}' создан`);
        }
        break;
      }
      
      case 'echo': {
        const cmdStr = trimmedCmd.substring(5).trim();
        const redirectIndex = cmdStr.indexOf('>');
        
        if (redirectIndex === -1) {
          state.addTerminalLine('output', args.join(' '));
          return;
        }
        
        const text = cmdStr.substring(0, redirectIndex).trim();
        const fileName = cmdStr.substring(redirectIndex + 1).trim();
        
        if (!fileName) {
          state.addTerminalLine('error', 'echo: отсутствует имя файла после >');
          return;
        }
        
        const targetPath = resolvePath(currentPath, fileName);
        const parentPath = getParentPath(targetPath);
        const fileBaseName = getFileName(targetPath);
        const parentNode = getNode(fileSystem, parentPath);
        
        if (!parentNode || parentNode.type !== 'directory') {
          state.addTerminalLine('error', `echo: невозможно создать '${fileName}': Нет такой директории`);
          return;
        }
        
        const newFs = deepClone(fileSystem);
        const newParent = getNode(newFs, parentPath);
        if (newParent && newParent.children) {
          newParent.children[fileBaseName] = {
            type: 'file',
            content: text,
            permissions: 'rw'
          };
          set({ fileSystem: newFs });
          state.addTerminalLine('success', `Записано в '${fileName}'`);
          state.checkMissionCompletion();
        }
        break;
      }
      
      case 'ps': {
        state.addTerminalLine('output', 'PID    CPU%    USER        NAME');
        state.addTerminalLine('output', '─────────────────────────────────────');
        processes.forEach(proc => {
          const pidStr = proc.pid.toString().padEnd(6);
          const cpuStr = proc.cpu.toFixed(1).padEnd(7);
          const userStr = proc.user.padEnd(11);
          const protectedStr = proc.protected ? ' [PROTECTED]' : '';
          state.addTerminalLine('output', `${pidStr} ${cpuStr} ${userStr} ${proc.name}${protectedStr}`);
        });
        break;
      }
      
      case 'kill': {
        if (!args[0]) {
          state.addTerminalLine('error', 'kill: отсутствует PID');
          return;
        }
        
        const pid = parseInt(args[0]);
        if (isNaN(pid)) {
          state.addTerminalLine('error', `kill: ${args[0]}: недопустимый PID`);
          return;
        }
        
        const proc = processes.find(p => p.pid === pid);
        if (!proc) {
          state.addTerminalLine('error', `kill: (${pid}) - Нет такого процесса`);
          return;
        }
        
        if (proc.protected) {
          if (pid === 999) {
            const killswitchNode = getNode(fileSystem, '/etc/killswitch');
            if (!killswitchNode || !killswitchNode.content?.includes('X7-ALPHA')) {
              state.addTerminalLine('error', 'PROTECTED_PROCESS: Демон Nemesis активен. Ключ деактивации требуется в /etc/killswitch');
              return;
            }
          } else if (pid === 1984) {
            const phantomKillNode = getNode(fileSystem, '/etc/phantom_kill');
            if (!phantomKillNode || !phantomKillNode.content?.includes('OMEGA-9Z')) {
              state.addTerminalLine('error', 'PROTECTED_PROCESS: APT Phantom активен. Мастер-ключ требуется в /etc/phantom_kill');
              return;
            }
          } else {
            state.addTerminalLine('error', 'PROTECTED_PROCESS: Системный процесс защищён от завершения');
            return;
          }
        }
        
        const newProcesses = processes.filter(p => p.pid !== pid);
        set({ processes: newProcesses });
        state.addTerminalLine('success', `Процесс ${proc.name} (PID ${pid}) завершён`);
        state.checkMissionCompletion();
        break;
      }
      
      case 'grep': {
        if (args.length < 2) {
          state.addTerminalLine('error', 'grep: использование: grep [строка] [файл]');
          return;
        }
        
        const searchStr = args[0].replace(/['"]/g, '');
        const targetPath = resolvePath(currentPath, args[1]);
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `grep: ${args[1]}: Нет такого файла или директории`);
          return;
        }
        
        if (node.type === 'directory') {
          state.addTerminalLine('error', `grep: ${args[1]}: Это директория`);
          return;
        }
        
        const lines = (node.content || '').split('\n');
        const matches = lines.filter(line => 
          line.toLowerCase().includes(searchStr.toLowerCase())
        );
        
        if (matches.length === 0) {
          state.addTerminalLine('output', '(совпадений не найдено)');
        } else {
          matches.forEach(match => {
            const highlighted = match.replace(
              new RegExp(searchStr, 'gi'),
              (m) => `>>>${m}<<<`
            );
            state.addTerminalLine('output', highlighted);
          });
        }
        break;
      }
      
      case 'chmod': {
        if (args[0] !== '+w' || !args[1]) {
          state.addTerminalLine('error', 'chmod: использование: chmod +w [файл]');
          return;
        }
        
        const targetPath = resolvePath(currentPath, args[1]);
        const node = getNode(fileSystem, targetPath);
        
        if (!node) {
          state.addTerminalLine('error', `chmod: невозможно получить доступ к '${args[1]}': Нет такого файла или директории`);
          return;
        }
        
        if (node.type === 'directory') {
          state.addTerminalLine('error', `chmod: ${args[1]}: Это директория`);
          return;
        }
        
        const newFs = deepClone(fileSystem);
        const targetNode = getNode(newFs, targetPath);
        if (targetNode) {
          targetNode.permissions = 'rw';
          set({ fileSystem: newFs });
          state.addTerminalLine('success', `Права доступа изменены: ${args[1]} теперь доступен для записи`);
        }
        break;
      }
      
      case 'submit_report': {
        if (!args[0]) {
          state.addTerminalLine('error', 'submit_report: отсутствует текст отчёта');
          return;
        }
        
        const report = args.join(' ');
        state.addTerminalLine('system', `Отчёт отправлен: "${report}"`);
        
        if (state.currentMission === 3 && report.includes('45.33.22.11')) {
          const updatedMissions = state.missions.map(m => {
            if (m.id === 3) return { ...m, completed: true, active: false };
            if (m.id === 4) return { ...m, active: true };
            return m;
          });
          
          set({ missions: updatedMissions, currentMission: 4 });
          state.addTerminalLine('success', '═══ МИССИЯ 3 ВЫПОЛНЕНА! ═══');
          state.addTerminalLine('system', `Следующая миссия: ${updatedMissions[3]?.title}`);
        } else if (state.currentMission === 3) {
          state.addTerminalLine('error', 'Неверный IP-адрес. Проверьте логи ещё раз.');
        } else if (state.currentMission === 6 && report.toLowerCase().includes('drop')) {
          const updatedMissions = state.missions.map(m => {
            if (m.id === 6) return { ...m, completed: true, active: false };
            if (m.id === 7) return { ...m, active: true };
            return m;
          });
          
          set({ missions: updatedMissions, currentMission: 7 });
          state.addTerminalLine('success', '═══ МИССИЯ 6 ВЫПОЛНЕНА! ═══');
          state.addTerminalLine('system', `Следующая миссия: ${updatedMissions[6]?.title}`);
        } else if (state.currentMission === 6) {
          state.addTerminalLine('error', 'Неверный отчёт. Найдите вредоносную SQL-команду в логах.');
        }
        break;
      }
      
      default: {
        state.addTerminalLine('error', `${cmd}: команда не найдена. Введите "help" для справки.`);
      }
    }
  }
    }),
    {
      name: 'game-engine-storage',
      partialize: (state) => ({
        missions: state.missions,
        currentMission: state.currentMission,
        gameCompleted: state.gameCompleted,
        commandCount: state.commandCount,
        errorCount: state.errorCount,
        gameStartTime: state.gameStartTime,
      }),
    }
  )
);
