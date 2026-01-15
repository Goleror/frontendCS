import { useState } from 'react';
import { ChevronDown, ChevronUp, Shield, Terminal as TerminalIcon, AlertTriangle } from 'lucide-react';

interface WikiEntry {
  id: number;
  title: string;
  category: 'commands' | 'tools' | 'threats';
  description: string;
  details?: string;
  danger?: 'low' | 'medium' | 'high' | 'critical';
}

const WIKI_DATABASE: WikiEntry[] = [
  // КОМАНДЫ
  {
    id: 1,
    title: 'ls',
    category: 'commands',
    description: 'Список файлов в директории',
    details: 'Показывает содержимое папки. Пример: ls /home/user'
  },
  {
    id: 2,
    title: 'cd',
    category: 'commands',
    description: 'Переход в директорию',
    details: 'Навигация по папкам. Пример: cd /etc/config'
  },
  {
    id: 3,
    title: 'cat',
    category: 'commands',
    description: 'Показать содержимое файла',
    details: 'Выводит полный текст файла. Пример: cat /etc/passwd'
  },
  {
    id: 4,
    title: 'pwd',
    category: 'commands',
    description: 'Текущая директория',
    details: 'Показывает путь к текущей папке'
  },
  {
    id: 5,
    title: 'mkdir',
    category: 'commands',
    description: 'Создать папку',
    details: 'Создание новой директории. Пример: mkdir /home/newdir'
  },
  {
    id: 6,
    title: 'rm',
    category: 'commands',
    description: 'Удалить файл',
    details: 'Удаление файла или папки. Пример: rm /tmp/file.txt'
  },
  {
    id: 7,
    title: 'cp',
    category: 'commands',
    description: 'Копировать файл',
    details: 'Копирование файла. Пример: cp source.txt dest.txt'
  },
  {
    id: 8,
    title: 'mv',
    category: 'commands',
    description: 'Переместить/переименовать',
    details: 'Перемещение или переименование файла. Пример: mv old.txt new.txt'
  },
  {
    id: 9,
    title: 'chmod',
    category: 'commands',
    description: 'Изменить права доступа',
    details: 'Изменение прав на файл. Пример: chmod 755 script.sh. +w разрешает запись.'
  },
  {
    id: 10,
    title: 'grep',
    category: 'commands',
    description: 'Поиск текста',
    details: 'Поиск строк содержащих текст. Пример: grep "password" /etc/shadow'
  },
  {
    id: 11,
    title: 'find',
    category: 'commands',
    description: 'Поиск файлов',
    details: 'Рекурсивный поиск файлов. Пример: find / -name "*.conf"'
  },
  {
    id: 12,
    title: 'kill',
    category: 'commands',
    description: 'Завершить процесс',
    details: 'Завершение работы процесса по PID. Пример: kill 1234'
  },
  {
    id: 13,
    title: 'ps',
    category: 'commands',
    description: 'Список процессов',
    details: 'Показывает все активные процессы в системе'
  },
  {
    id: 14,
    title: 'sudo',
    category: 'commands',
    description: 'Выполнение с админом правами',
    details: 'Выполнение команды с повышенными правами'
  },
  {
    id: 15,
    title: 'ssh',
    category: 'commands',
    description: 'Удалённое подключение',
    details: 'Безопасное подключение к удалённому серверу. Пример: ssh user@192.168.1.1'
  },
  {
    id: 16,
    title: 'netstat',
    category: 'commands',
    description: 'Состояние сети',
    details: 'Показывает активные подключения и прослушиваемые порты'
  },
  {
    id: 17,
    title: 'curl',
    category: 'commands',
    description: 'Загрузка с веб-сервера',
    details: 'Отправка HTTP запросов. Пример: curl http://api.com/data'
  },

  // ИНСТРУМЕНТЫ
  {
    id: 101,
    title: 'nmap',
    category: 'tools',
    description: 'Сканирование портов и сервисов',
    details: 'Мощный инструмент для разведки сети и поиска открытых портов',
    danger: 'high'
  },
  {
    id: 102,
    title: 'metasploit',
    category: 'tools',
    description: 'Фреймворк для тестирования',
    details: 'Профессиональный фреймворк для поиска и эксплуатации уязвимостей',
    danger: 'critical'
  },
  {
    id: 103,
    title: 'burp suite',
    category: 'tools',
    description: 'Тестирование веб-приложений',
    details: 'Анализ безопасности веб-приложений, перехват и модификация запросов',
    danger: 'high'
  },
  {
    id: 104,
    title: 'hashcat',
    category: 'tools',
    description: 'Перебор хешей паролей',
    details: 'Мощная утилита для подбора паролей по их хешам',
    danger: 'critical'
  },
  {
    id: 105,
    title: 'john the ripper',
    category: 'tools',
    description: 'Крак паролей',
    details: 'Популярный инструмент для взлома паролей методом брутфорса',
    danger: 'critical'
  },
  {
    id: 106,
    title: 'hydra',
    category: 'tools',
    description: 'Брутфорс учётных данных',
    details: 'Параллельный перебор логина и пароля к различным сервисам',
    danger: 'critical'
  },
  {
    id: 107,
    title: 'sqlmap',
    category: 'tools',
    description: 'Эксплуатация SQL инъекций',
    details: 'Автоматизированный инструмент для поиска и эксплуатации SQL инъекций',
    danger: 'critical'
  },
  {
    id: 108,
    title: 'wireshark',
    category: 'tools',
    description: 'Анализ сетевого трафика',
    details: 'Перехват и анализ пакетов в сети для выявления аномалий',
    danger: 'medium'
  },
  {
    id: 109,
    title: 'openssl',
    category: 'tools',
    description: 'Криптография и сертификаты',
    details: 'Инструмент для работы с шифрованием и SSL сертификатами',
    danger: 'low'
  },
  {
    id: 110,
    title: 'ssh-keygen',
    category: 'tools',
    description: 'Генерация SSH ключей',
    details: 'Создание пар ключей для безопасной аутентификации по SSH',
    danger: 'low'
  },

  // УГРОЗЫ
  {
    id: 201,
    title: 'DDoS атака',
    category: 'threats',
    description: 'Распределённый отказ в обслуживании',
    details: 'Перегрузка сервера огромным количеством запросов. Защита: WAF, Rate limiting, CDN',
    danger: 'critical'
  },
  {
    id: 202,
    title: 'SQL Injection',
    category: 'threats',
    description: 'Внедрение вредоносного SQL-кода',
    details: 'Пример: \' OR \'1\'=\'1. Защита: Parameterized queries, ORM',
    danger: 'critical'
  },
  {
    id: 203,
    title: 'XSS (Cross-Site Scripting)',
    category: 'threats',
    description: 'Внедрение JavaScript на веб-страницы',
    details: 'Пример: <script>alert("xss")</script>. Защита: Input sanitization, CSP',
    danger: 'high'
  },
  {
    id: 204,
    title: 'Man-in-the-Middle (MitM)',
    category: 'threats',
    description: 'Перехват трафика между клиентом и сервером',
    details: 'Защита: HTTPS, VPN, Криптография данных',
    danger: 'high'
  },
  {
    id: 205,
    title: 'Brute Force',
    category: 'threats',
    description: 'Перебор паролей методом перебора',
    details: 'Автоматический подбор пароля. Защита: Rate limiting, Account lockout, 2FA',
    danger: 'high'
  },
  {
    id: 206,
    title: 'Session Hijacking',
    category: 'threats',
    description: 'Перехват сессии пользователя',
    details: 'Захват токена сессии для выдачи себя за пользователя. Защита: Secure cookies, HTTPS',
    danger: 'high'
  },
  {
    id: 207,
    title: 'CSRF (Cross-Site Request Forgery)',
    category: 'threats',
    description: 'Выполнение действий от имени пользователя',
    details: 'Защита: CSRF tokens, SameSite cookies',
    danger: 'medium'
  },
  {
    id: 208,
    title: 'Privilege Escalation',
    category: 'threats',
    description: 'Повышение привилегий в системе',
    details: 'Получение доступа root или admin. Защита: Principle of least privilege',
    danger: 'critical'
  },
  {
    id: 209,
    title: 'Keylogger',
    category: 'threats',
    description: 'Запись всех нажатий клавиш',
    details: 'Вредоносное ПО для кражи паролей и конфиденциальных данных',
    danger: 'critical'
  },
  {
    id: 210,
    title: 'Rootkit',
    category: 'threats',
    description: 'Скрытое вредоносное ПО',
    details: 'Набор утилит для скрытия присутствия в системе и защиты от удаления',
    danger: 'critical'
  },
  {
    id: 211,
    title: 'Path Traversal',
    category: 'threats',
    description: 'Доступ к файлам вне разрешённой директории',
    details: 'Пример: ../../etc/passwd. Защита: Input validation',
    danger: 'medium'
  },
  {
    id: 212,
    title: 'Command Injection',
    category: 'threats',
    description: 'Выполнение системных команд через пользовательский ввод',
    details: 'Пример: ; rm -rf /. Защита: Избегать exec(), использовать API',
    danger: 'critical'
  },
  {
    id: 213,
    title: 'DNS Spoofing',
    category: 'threats',
    description: 'Подделка DNS ответов',
    details: 'Перенаправление на поддельный сайт. Защита: DNSSEC',
    danger: 'high'
  },
  {
    id: 214,
    title: 'Default Credentials',
    category: 'threats',
    description: 'Неизменённые стандартные пароли',
    details: 'Пример: admin/admin, 12345. Защита: Обязательное изменение при установке',
    danger: 'high'
  },
  {
    id: 215,
    title: '2FA/MFA',
    category: 'threats',
    description: 'Двухфакторная/многофакторная аутентификация',
    details: 'Защита: Требует дополнительное подтверждение личности помимо пароля',
    danger: 'low'
  }
];

interface WikiProps {
  expanded?: boolean;
}

export function Wiki({ expanded = true }: WikiProps) {
  const [activeCategory, setActiveCategory] = useState<'commands' | 'tools' | 'threats'>('commands');
  const [selectedEntry, setSelectedEntry] = useState<WikiEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = WIKI_DATABASE.filter(entry => {
    const matchesCategory = entry.category === activeCategory;
    const matchesSearch = entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          entry.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDangerColor = (danger?: string) => {
    switch (danger) {
      case 'critical':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-cyan-400';
    }
  };

  const getDangerBadge = (danger?: string) => {
    if (!danger) return null;
    const labels = { critical: '⚠️ КРИТИЧНО', high: '🔴 ВЫСОКИЙ', medium: '🟠 СРЕДНИЙ', low: '🟢 НИЗКИЙ' };
    return labels[danger as keyof typeof labels];
  };

  return (
    <div className="h-full flex flex-col bg-black border border-cyan-500 rounded text-xs overflow-hidden">
      {/* HEADER */}
      <div className="p-2 border-b border-cyan-500 bg-cyan-900/30">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span className="text-cyan-400 font-bold">WIKI БАЗА</span>
        </div>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-black border border-cyan-500 rounded px-2 py-1 text-cyan-400 text-xs focus:outline-none focus:border-cyan-300"
        />
      </div>

      {/* TABS */}
      <div className="flex border-b border-cyan-500 bg-black">
        <button
          onClick={() => setActiveCategory('commands')}
          className={`flex-1 px-2 py-1.5 border-r border-cyan-500 transition ${
            activeCategory === 'commands'
              ? 'bg-cyan-900/50 text-cyan-300 font-bold'
              : 'text-cyan-600 hover:bg-cyan-900/20'
          }`}
        >
          <TerminalIcon className="w-3 h-3 inline mr-1" />
          Команды
        </button>
        <button
          onClick={() => setActiveCategory('tools')}
          className={`flex-1 px-2 py-1.5 border-r border-cyan-500 transition ${
            activeCategory === 'tools'
              ? 'bg-cyan-900/50 text-cyan-300 font-bold'
              : 'text-cyan-600 hover:bg-cyan-900/20'
          }`}
        >
          🛠️ Инструменты
        </button>
        <button
          onClick={() => setActiveCategory('threats')}
          className={`flex-1 px-2 py-1.5 transition ${
            activeCategory === 'threats'
              ? 'bg-cyan-900/50 text-cyan-300 font-bold'
              : 'text-cyan-600 hover:bg-cyan-900/20'
          }`}
        >
          <AlertTriangle className="w-3 h-3 inline mr-1" />
          Угрозы
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {selectedEntry ? (
          /* DETAIL VIEW */
          <div className="p-2">
            <button
              onClick={() => setSelectedEntry(null)}
              className="text-cyan-400 hover:text-cyan-300 mb-2 flex items-center gap-1"
            >
              <ChevronUp className="w-3 h-3" />
              Назад
            </button>
            <div className="border border-cyan-500 rounded p-2 bg-cyan-900/20">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-cyan-300 font-bold">{selectedEntry.title}</h3>
                {selectedEntry.danger && (
                  <span className={`text-xs ${getDangerColor(selectedEntry.danger)}`}>
                    {getDangerBadge(selectedEntry.danger)}
                  </span>
                )}
              </div>
              <p className="text-cyan-400 mb-2">{selectedEntry.description}</p>
              {selectedEntry.details && (
                <div className="text-cyan-500 text-xs bg-black/50 p-2 rounded border border-cyan-700 leading-relaxed">
                  {selectedEntry.details}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* LIST VIEW */
          <div className="space-y-1 p-2">
            {filteredEntries.length > 0 ? (
              filteredEntries.map(entry => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="w-full text-left p-2 bg-black border border-cyan-600 hover:border-cyan-400 hover:bg-cyan-900/20 rounded transition group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-cyan-300 font-mono">{entry.title}</span>
                      <p className="text-cyan-500 text-xs mt-0.5">{entry.description}</p>
                    </div>
                    {entry.danger && (
                      <span className={`text-xs ${getDangerColor(entry.danger)} whitespace-nowrap ml-2`}>
                        {getDangerBadge(entry.danger)}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3 h-3 inline text-cyan-600 group-hover:text-cyan-400 transition" />
                </button>
              ))
            ) : (
              <div className="text-center text-cyan-600 py-4">Ничего не найдено</div>
            )}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-cyan-500 bg-black p-1 text-center text-cyan-600 text-xs">
        📚 CyberShield Wiki Database
      </div>
    </div>
  );
}
