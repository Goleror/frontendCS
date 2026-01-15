import { useState } from 'react';
import { Target, Mail, BookOpen, Trophy, Zap, Crown, ChevronRight, CheckCircle, Circle, AlertTriangle } from 'lucide-react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { AchievementPanel } from './AchievementPanel';
import { BonusMissions } from './BonusMissions';
import { Leaderboard } from './Leaderboard';
import { Wiki } from './Wiki';

const EMAILS = [
  {
    id: 1,
    from: "security@cybershield.net",
    subject: "Обнаружена подозрительная активность",
    date: "15.12.2024 08:15",
    content: "Агент,\n\nНаши системы мониторинга обнаружили криптомайнер в сети. Процесс 'miner_x' потребляет критические ресурсы.\n\nНемедленно нейтрализуйте угрозу.\n\n— Центр безопасности",
    read: true
  },
  {
    id: 2,
    from: "admin@cybershield.net",
    subject: "Кейлоггер в системе пользователя",
    date: "15.12.2024 09:30",
    content: "СРОЧНО!\n\nОбнаружен кейлоггер в папке загрузок. Файл маскируется под обычное приложение.\n\nПуть: /home/user/downloads/keylogger.exe\n\nУдалите немедленно!\n\n— Системный администратор",
    read: false
  },
  {
    id: 3,
    from: "forensics@cybershield.net",
    subject: "Анализ атаки — требуется расследование",
    date: "15.12.2024 10:45",
    content: "Агент,\n\nЗафиксированы множественные попытки брутфорса SSH.\n\nПроанализируйте /var/log/auth.log и идентифицируйте IP атакующего.\n\nОтправьте отчёт командой submit_report.\n\n— Отдел криминалистики",
    read: false
  },
  {
    id: 4,
    from: "crypto@cybershield.net",
    subject: "Расшифровка данных",
    date: "15.12.2024 11:20",
    content: "Обнаружен дамп памяти с возможным паролем доступа.\n\nФайл: /home/user/documents/dump.txt\n\nФормат пароля: PASS:XXXX\n\nСохраните найденный пароль в flag.txt\n\n— Криптоаналитик",
    read: false
  },
  {
    id: 5,
    from: "emergency@cybershield.net",
    subject: "КРИТИЧНО: Руткит NEMESIS",
    date: "15.12.2024 12:00",
    content: "КРАСНЫЙ УРОВЕНЬ УГРОЗЫ!\n\nОбнаружен продвинутый руткит 'Nemesis'. Процесс защищён демоном, файл заблокирован.\n\nПлан действий:\n1. Найди KILL_CODE в syslog\n2. Запиши код в /etc/killswitch\n3. Убей процесс PID 999\n4. Разблокируй и удали /bin/nemesis\n\nУдачи, агент.\n\n— Экстренная группа реагирования",
    read: false
  },
  {
    id: 6,
    from: "webapp@cybershield.net",
    subject: "SQL-инъекция в веб-приложении",
    date: "15.12.2024 13:00",
    content: "ВНИМАНИЕ!\n\nОбнаружена атака на базу данных через SQL-инъекцию.\n\nПроанализируйте /var/log/webapp.log и найдите вредоносный SQL-запрос.\n\nОтправьте отчёт с найденной командой DROP.\n\n— Команда веб-безопасности",
    read: false
  },
  {
    id: 7,
    from: "xss-alert@cybershield.net",
    subject: "XSS-атака через загрузки",
    date: "15.12.2024 14:15",
    content: "Агент,\n\nВ папке загрузок пользователей обнаружены файлы с вредоносными скриптами.\n\nПроверьте /var/www/uploads/ и удалите все файлы содержащие <script>.\n\n— Отдел безопасности контента",
    read: false
  },
  {
    id: 8,
    from: "privesc@cybershield.net",
    subject: "Попытка повышения привилегий",
    date: "15.12.2024 15:30",
    content: "ОБНАРУЖЕН ЭКСПЛОЙТ!\n\nВ /tmp найден бинарник с SUID-битом для повышения привилегий.\n\nПлан:\n1. Убей процесс exploit_runner (PID 777)\n2. Удали /tmp/exploit\n\n— Отдел мониторинга угроз",
    read: false
  },
  {
    id: 9,
    from: "backdoor@cybershield.net",
    subject: "Скрытый бэкдор обнаружен",
    date: "15.12.2024 16:45",
    content: "КРИТИЧЕСКАЯ УГРОЗА!\n\nОбнаружен бэкдор-сервис на нестандартном порту.\n\nДействия:\n1. Изучи /etc/services.d/hidden\n2. Найди порт бэкдора\n3. Убей процесс backdoor_svc (PID 1337)\n4. Удали конфигурационный файл\n\n— Группа реагирования",
    read: false
  },
  {
    id: 10,
    from: "apt-response@cybershield.net",
    subject: "APT PHANTOM - КРАСНЫЙ УРОВЕНЬ",
    date: "15.12.2024 18:00",
    content: "!!!! МАКСИМАЛЬНАЯ УГРОЗА !!!!\n\nОбнаружена Advanced Persistent Threat 'PHANTOM'.\n\nМногоступенчатая атака требует полной нейтрализации:\n1. Найди MASTER_KEY в /var/log/phantom.log\n2. Запиши ключ в /etc/phantom_kill\n3. Убей phantom_c2 (PID 1984)\n4. chmod +w для всех файлов в /opt/phantom/\n5. Удали все компоненты APT\n\nЭто финальное испытание, агент.\n\n— Командование CyberShield",
    read: false
  }
];

type TabType = 'missions' | 'mail' | 'wiki' | 'achievements' | 'bonus' | 'leaderboard';

export function CyberDeck() {
  const [activeTab, setActiveTab] = useState<TabType>('missions');
  const [selectedEmail, setSelectedEmail] = useState<number | null>(null);
  
  const { missions, gameCompleted } = useGameEngine();
  
  const renderTabButton = (tab: TabType, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setSelectedEmail(null);
      }}
      className={`flex items-center gap-2 px-3 py-3 text-sm font-medium transition-all ${
        activeTab === tab ? 'tab-active' : 'tab-inactive'
      }`}
    >
      {icon}
      <span className="hidden xl:inline">{label}</span>
    </button>
  );
  
  const renderMissions = () => (
    <div className="p-4 space-y-3 overflow-y-auto scrollbar-cyber h-full">
      {gameCompleted && (
        <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/50 mb-4">
          <div className="flex items-center gap-2 text-green-400 glow-text font-bold">
            <CheckCircle className="w-5 h-5" />
            ВСЕ МИССИИ ВЫПОЛНЕНЫ!
          </div>
        </div>
      )}
      
      {missions.map((mission) => (
        <div
          key={mission.id}
          className={`p-4 rounded-lg border transition-all ${
            mission.completed
              ? 'bg-green-500/10 border-green-500/30'
              : mission.active
              ? 'bg-yellow-500/10 border-yellow-500/50'
              : 'bg-white/5 border-white/10 opacity-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {mission.completed ? (
                <CheckCircle className="w-5 h-5 text-green-400" />
              ) : mission.active ? (
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              ) : (
                <Circle className="w-5 h-5 text-white/30" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  mission.completed
                    ? 'bg-green-500/30 text-green-400'
                    : mission.active
                    ? 'bg-yellow-500/30 text-yellow-400'
                    : 'bg-white/10 text-white/40'
                }`}>
                  {mission.completed ? 'ВЫПОЛНЕНО' : mission.active ? 'АКТИВНО' : 'ЗАБЛОКИРОВАНО'}
                </span>
              </div>
              <h3 className={`font-semibold mb-2 ${
                mission.completed ? 'text-green-400' : mission.active ? 'text-white' : 'text-white/40'
              }`}>
                {mission.title}
              </h3>
              <p className="text-sm text-white/60 mb-3">{mission.description}</p>
              {mission.active && (
                <div className="p-3 rounded bg-black/40 border border-yellow-500/30">
                  <div className="text-xs text-yellow-400 mb-1 font-semibold">ЦЕЛЬ:</div>
                  <div className="text-sm text-white/80 whitespace-pre-wrap">{mission.objective}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
  
  const renderMail = () => {
    if (selectedEmail !== null) {
      const email = EMAILS.find(e => e.id === selectedEmail);
      if (!email) return null;
      
      return (
        <div className="p-4 h-full flex flex-col">
          <button
            onClick={() => setSelectedEmail(null)}
            className="flex items-center gap-1 text-sm text-green-400 hover:text-green-300 mb-4"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Назад к списку
          </button>
          
          <div className="p-4 rounded-lg bg-black/40 border border-white/10 flex-1 overflow-y-auto scrollbar-cyber">
            <div className="border-b border-white/10 pb-3 mb-4">
              <div className="text-lg font-semibold text-white mb-2">{email.subject}</div>
              <div className="text-sm text-white/60">
                <span className="text-cyan-400">От:</span> {email.from}
              </div>
              <div className="text-sm text-white/60">
                <span className="text-cyan-400">Дата:</span> {email.date}
              </div>
            </div>
            <div className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">
              {email.content}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-4 space-y-2 overflow-y-auto scrollbar-cyber h-full">
        {EMAILS.map((email) => (
          <button
            key={email.id}
            onClick={() => setSelectedEmail(email.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-white/5 ${
              email.read ? 'bg-black/20 border-white/5' : 'bg-cyan-500/10 border-cyan-500/30'
            }`}
          >
            <div className="flex items-start gap-3">
              <Mail className={`w-4 h-4 mt-1 ${email.read ? 'text-white/40' : 'text-cyan-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`text-sm font-medium truncate ${email.read ? 'text-white/60' : 'text-white'}`}>
                    {email.from}
                  </span>
                  <span className="text-xs text-white/40 whitespace-nowrap">{email.date}</span>
                </div>
                <div className={`text-sm truncate ${email.read ? 'text-white/40' : 'text-white/80'}`}>
                  {email.subject}
                </div>
              </div>
              {!email.read && (
                <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2"></div>
              )}
            </div>
          </button>
        ))}
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col glass-panel rounded-lg overflow-hidden">
      <div className="flex items-center border-b border-white/10 bg-black/40">
        {renderTabButton('missions', <Target className="w-4 h-4" />, 'Миссии')}
        {renderTabButton('mail', <Mail className="w-4 h-4" />, 'Почта')}
        {renderTabButton('wiki', <BookOpen className="w-4 h-4" />, 'Wiki')}
        {renderTabButton('achievements', <Trophy className="w-4 h-4" />, 'Трофеи')}
        {renderTabButton('bonus', <Zap className="w-4 h-4" />, 'Бонус')}
        {renderTabButton('leaderboard', <Crown className="w-4 h-4" />, 'Топ')}
      </div>
      
      <div className="flex-1 overflow-hidden">
        {activeTab === 'missions' && renderMissions()}
        {activeTab === 'mail' && renderMail()}
        {activeTab === 'wiki' && <Wiki />}
        {activeTab === 'achievements' && <AchievementPanel />}
        {activeTab === 'bonus' && <BonusMissions />}
        {activeTab === 'leaderboard' && <Leaderboard />}
      </div>
    </div>
  );
}
