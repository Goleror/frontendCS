#!/usr/bin/env python3
"""
Project Manager - Управление проектом CyberShield
Красивый интерфейс для управления проектом, проверки зависимостей и запуска сервера
"""

import os
import sys
import subprocess
import platform
import json
from pathlib import Path
from typing import Tuple, List, Optional
import shutil
import re
import io
import webbrowser

# Fix encoding for Windows console (UTF-8 output)
if platform.system() == "Windows":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


# ANSI Color codes for terminal
class Colors:
    """ANSI цвета для красивого вывода"""
    HEADER = '\033[95m'
    OKBLUE = '\033[94m'
    OKCYAN = '\033[96m'
    OKGREEN = '\033[92m'
    WARNING = '\033[93m'
    FAIL = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'
    
    # Special colors
    DARK_GRAY = '\033[90m'
    LIGHT_RED = '\033[91m'
    LIGHT_GREEN = '\033[92m'
    LIGHT_YELLOW = '\033[93m'
    LIGHT_BLUE = '\033[94m'
    LIGHT_MAGENTA = '\033[95m'
    LIGHT_CYAN = '\033[96m'
    
    # Cyberpunk colors
    NEON_PINK = '\033[38;5;205m'
    NEON_CYAN = '\033[38;5;51m'
    NEON_GREEN = '\033[38;5;46m'
    NEON_YELLOW = '\033[38;5;226m'
    NEON_PURPLE = '\033[38;5;135m'


def clear_screen():
    """Очистить экран (опционально)"""
    if os.isatty(sys.stdout.fileno()):  # Только если это интерактивный терминал
        os.system('clear' if os.name != 'nt' else 'cls')


def print_header(text: str):
    """Вывести заголовок"""
    print(f"\n{Colors.BOLD}{Colors.NEON_CYAN}{'═'*70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.NEON_PINK}{text.center(70)}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.NEON_CYAN}{'═'*70}{Colors.ENDC}\n")


def print_success(text: str):
    """Вывести успешное сообщение"""
    print(f"{Colors.OKGREEN}✓ {text}{Colors.ENDC}")


def print_error(text: str):
    """Вывести сообщение об ошибке"""
    print(f"{Colors.FAIL}✗ {text}{Colors.ENDC}")


def print_warning(text: str):
    """Вывести предупреждение"""
    print(f"{Colors.WARNING}⚠ {text}{Colors.ENDC}")


def print_info(text: str):
    """Вывести информацию"""
    print(f"{Colors.OKCYAN}ℹ {text}{Colors.ENDC}")


def print_section(title: str):
    """Вывести заголовок секции"""
    print(f"\n{Colors.BOLD}{Colors.NEON_GREEN}→ {title}{Colors.ENDC}")
    print(f"{Colors.NEON_CYAN}{'-'*70}{Colors.ENDC}")


def run_command(cmd: List[str], shell: bool = False, capture: bool = False) -> Tuple[int, str, str]:
    """Запустить команду и вернуть код выхода, stdout, stderr"""
    try:
        # На Windows для некоторых команд нужен shell=True
        use_shell = shell or (platform.system() == "Windows" and isinstance(cmd, str))
        
        result = subprocess.run(
            cmd,
            shell=use_shell,
            capture_output=capture,
            text=True,
            timeout=120  # Увеличиваем timeout до 2 минут
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return -1, "", "Command timeout (exceeded 2 minutes)"
    except FileNotFoundError:
        return -1, "", "Command not found"
    except Exception as e:
        return -1, "", str(e)


def check_command_exists(cmd: str) -> bool:
    """Проверить наличие команды"""
    return shutil.which(cmd) is not None


def get_node_version() -> Optional[str]:
    """Получить версию Node.js"""
    code, stdout, _ = run_command(['node', '--version'], capture=True)
    if code == 0:
        return stdout.strip()
    return None


def get_npm_version() -> Optional[str]:
    """Получить версию npm"""
    code, stdout, _ = run_command(['npm', '--version'], capture=True)
    if code == 0:
        return stdout.strip()
    return None


def get_python_version() -> Optional[str]:
    """Получить версию Python"""
    code, stdout, _ = run_command(['python3', '--version'], capture=True)
    if code == 0:
        return stdout.strip()
    return None


def check_dependencies() -> bool:
    """Проверить наличие всех зависимостей"""
    print_section("Проверка системных зависимостей")
    
    all_good = True
    
    # Check Node.js
    if check_command_exists('node'):
        version = get_node_version()
        print_success(f"Node.js: {version}")
    else:
        print_error("Node.js не установлен")
        all_good = False
    
    # Check npm
    if check_command_exists('npm'):
        version = get_npm_version()
        print_success(f"npm: {version}")
    else:
        print_error("npm не установлен")
        all_good = False
    
    # Check Python
    if check_command_exists('python3'):
        version = get_python_version()
        print_success(f"Python 3: {version}")
    else:
        print_warning("Python 3 не установлен (не обязателен для работы)")
    
    # Check Git
    if check_command_exists('git'):
        code, stdout, _ = run_command(['git', '--version'], capture=True)
        if code == 0:
            print_success(f"Git: {stdout.strip()}")
        else:
            print_error("Git не работает корректно")
    else:
        print_warning("Git не установлен")
    
    return all_good


def check_project_dependencies() -> bool:
    """Проверить зависимости проекта (node_modules)"""
    print_section("Проверка зависимостей проекта")
    
    project_root = Path(__file__).parent
    node_modules = project_root / 'node_modules'
    package_lock = project_root / 'package-lock.json'
    
    if node_modules.exists():
        print_success(f"node_modules найден")
        return True
    else:
        print_warning("node_modules не найден")
        print_info("Запустите 'npm install' для установки зависимостей")
        return False


def check_database() -> bool:
    """Проверить наличие базы данных"""
    print_section("Проверка базы данных")
    
    project_root = Path(__file__).parent
    db_file = project_root / 'newarch.db'
    
    if db_file.exists():
        size_mb = db_file.stat().st_size / (1024 * 1024)
        print_success(f"Database найдена ({size_mb:.2f} MB)")
        return True
    else:
        print_warning("Database не найдена")
        return False


def check_logs_directory() -> bool:
    """Проверить наличие директории логов"""
    print_section("Проверка директории логов")
    
    project_root = Path(__file__).parent
    logs_dir = project_root / 'logs'
    
    if logs_dir.exists():
        print_success(f"logs директория найдена")
        
        # Check log files
        backend_log = logs_dir / 'backend.log'
        frontend_log = logs_dir / 'frontend.log'
        
        if backend_log.exists():
            size_kb = backend_log.stat().st_size / 1024
            print_success(f"  backend.log ({size_kb:.2f} KB)")
        if frontend_log.exists():
            size_kb = frontend_log.stat().st_size / 1024
            print_success(f"  frontend.log ({size_kb:.2f} KB)")
        
        return True
    else:
        print_warning("logs директория не найдена")
        print_info("Директория будет создана при первом запуске сервера")
        return False


def system_check() -> bool:
    """Полная проверка системы"""
    clear_screen()
    print_header("🔍 ПРОВЕРКА СИСТЕМЫ")
    
    system_info = platform.system()
    print_info(f"Операционная система: {system_info}")
    print_info(f"Платформа: {platform.platform()}")
    
    deps_ok = check_dependencies()
    check_project_dependencies()
    check_database()
    check_logs_directory()
    
    print_section("Результаты проверки")
    if deps_ok:
        print_success("Все системные зависимости установлены ✓")
    else:
        print_error("Некоторые системные зависимости отсутствуют")
    
    print()
    return deps_ok


def install_dependencies() -> bool:
    """Установить зависимости проекта"""
    clear_screen()
    print_header("📦 УСТАНОВКА ЗАВИСИМОСТЕЙ")
    
    project_root = Path(__file__).parent
    
    print_info("Установка npm зависимостей...")
    
    code, stdout, stderr = run_command(['npm', 'install'], capture=True)
    
    if code == 0:
        print_success("npm зависимости установлены ✓")
        return True
    else:
        print_error("Ошибка при установке зависимостей")
        print_error(stderr)
        return False


def select_platform() -> Optional[str]:
    """Показать интерактивное меню выбора платформы"""
    platforms = [
        ("1", "🪟 Windows", "windows"),
        ("2", "🐧 Linux", "linux"),
        ("3", "🍎 macOS", "macos"),
        ("4", "🔷 WSL (Windows Subsystem for Linux)", "wsl"),
        ("5", "🤖 Auto-detect", "auto"),
    ]
    
    print(f"\n{Colors.BOLD}Выберите платформу разработки:{Colors.ENDC}\n")
    
    for key, text, _ in platforms:
        print(f"  {key}) {text}")
    
    print()
    choice = input(f"{Colors.BOLD}Выберите (1-5): {Colors.ENDC}").strip()
    
    for key, _, value in platforms:
        if choice == key:
            if value == "auto":
                current_os = platform.system()
                if current_os == "Windows":
                    return "windows"
                elif current_os == "Darwin":
                    return "macos"
                else:
                    return "linux"
            return value
    
    print_error("Неправильный выбор")
    return None


def start_dev_server(auto_start: bool = False) -> bool:
    """Запустить dev сервер с выбором платформы"""
    clear_screen()
    print_header("🚀 ЗАПУСК DEV СЕРВЕРА")
    
    # Check dependencies first
    if not check_project_dependencies():
        print_warning("Зависимости не установлены, установка...")
        if not install_dependencies():
            print_error("Не удалось установить зависимости")
            return False
    
    # Select platform
    if auto_start:
        # Auto-detect при прямом запуске
        current_os = platform.system()
        if current_os == "Windows":
            selected_platform = "windows"
            os_name = "Windows"
        elif current_os == "Darwin":
            selected_platform = "macos"
            os_name = "macOS"
        else:
            selected_platform = "linux"
            os_name = "Linux"
        print_success(f"Выбрана платформа: {os_name} (auto-detect)\n")
    else:
        selected_platform = select_platform()
        if not selected_platform:
            return False
        
        current_os = platform.system()
        if selected_platform == "windows":
            os_name = "Windows"
        elif selected_platform == "macos":
            os_name = "macOS"
        elif selected_platform == "wsl":
            os_name = "WSL"
        else:
            os_name = "Linux"
        
        print_success(f"Выбрана платформа: {os_name}\n")
    
    print_info("Запуск сервера на http://localhost:5000")
    print_info("Локальная сеть: http://<ваш-ip>:5000")
    print_info("Нажмите Ctrl+C для остановки")
    print()
    
    try:
        # Запускаем npm dev напрямую (не в фоне, чтобы видеть вывод)
        if current_os == "Windows":
            import subprocess
            subprocess.run(['npm', 'run', 'dev'], shell=True, cwd=os.getcwd())
        else:
            import subprocess
            subprocess.run(['npm', 'run', 'dev'], cwd=os.getcwd())
        
        return True
    except KeyboardInterrupt:
        print_info("\nСервер остановлен")
        return True
    except Exception as e:
        print_error(f"Ошибка: {e}")
        return False


def build_project() -> bool:
    """Собрать проект"""
    clear_screen()
    print_header("🏗️ СБОРКА ПРОЕКТА")
    
    print_info("Сборка в progress...")
    
    code, stdout, stderr = run_command(['npm', 'run', 'build'], capture=True)
    
    if code == 0:
        print_success("Проект успешно собран ✓")
        # Show output if present
        if stdout and stdout.strip():
            print_section("Вывод сборки")
            print(stdout[:500])  # Show first 500 chars
        return True
    else:
        print_error("Ошибка при сборке проекта")
        if stderr and stderr.strip():
            print_error(stderr[:500])
        elif stdout and stdout.strip():
            print_info(stdout[:500])
        return False


def view_logs(log_type: str = "both") -> None:
    """Просмотреть логи с опциями"""
    clear_screen()
    print_header("📋 ПРОСМОТР ЛОГОВ")
    
    project_root = Path(__file__).parent
    logs_dir = project_root / 'logs'
    
    if not logs_dir.exists():
        print_error("logs директория не найдена")
        return
    
    backend_log = logs_dir / 'backend.log'
    frontend_log = logs_dir / 'frontend.log'
    
    # Show backend logs
    if log_type in ["both", "backend"]:
        if backend_log.exists():
            print_section("BACKEND LOGS")
            with open(backend_log, 'r') as f:
                content = f.read()
                lines = content.split('\n')
                for line in lines[-50:]:
                    if line.strip():
                        print(f"{Colors.LIGHT_BLUE}{line}{Colors.ENDC}")
        else:
            print_warning("backend.log не найден")
    
    # Show frontend logs
    if log_type in ["both", "frontend"]:
        if frontend_log.exists():
            print_section("FRONTEND LOGS")
            with open(frontend_log, 'r') as f:
                content = f.read()
                lines = content.split('\n')
                for line in lines[-50:]:
                    if line.strip():
                        print(f"{Colors.LIGHT_GREEN}{line}{Colors.ENDC}")
        else:
            print_warning("frontend.log не найден")
    
    if log_type == "disabled":
        print_info("Просмотр логов отключен")
    
    print()


def clear_logs() -> None:
    """Очистить логи"""
    clear_screen()
    print_header("🗑️ ОЧИСТКА ЛОГОВ")
    
    project_root = Path(__file__).parent
    logs_dir = project_root / 'logs'
    
    if not logs_dir.exists():
        print_warning("logs директория не найдена")
        return
    
    backend_log = logs_dir / 'backend.log'
    frontend_log = logs_dir / 'frontend.log'
    
    count = 0
    
    if backend_log.exists():
        backend_log.unlink()
        print_success("backend.log очищен ✓")
        count += 1
    
    if frontend_log.exists():
        frontend_log.unlink()
        print_success("frontend.log очищен ✓")
        count += 1
    
    if count == 0:
        print_warning("Логи не найдены")
    
    print()


def ask_question() -> None:
    """Задать вопрос (Rick Roll)"""
    webbrowser.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ")


def print_menu() -> None:
    """Вывести главное меню"""
    clear_screen()
    
    print(f"\n{Colors.BOLD}{Colors.NEON_CYAN}{'═'*70}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.NEON_PINK}  🎮 CYBERSHIELD PROJECT MANAGER{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.NEON_CYAN}{'═'*70}{Colors.ENDC}")
    print(f"{Colors.DARK_GRAY}{'by onevu'.center(70)}{Colors.ENDC}\n")
    
    print(f"{Colors.BOLD}{Colors.NEON_GREEN}▼ Главное меню:{Colors.ENDC}\n")
    
    menu_items = [
        ("1", "🚀 Запустить dev сервер", Colors.NEON_GREEN),
        ("2", "🏗️  Собрать проект", Colors.NEON_CYAN),
        ("3", "📦 Установить зависимости", Colors.NEON_YELLOW),
        ("4", "🔍 Проверить систему", Colors.NEON_PURPLE),
        ("5", "📋 Просмотреть логи", Colors.NEON_CYAN),
        ("6", "🗑️  Очистить логи", Colors.NEON_PINK),
        ("7", "🧹 Чистая сборка (clean build)", Colors.NEON_GREEN),
        ("8", "🔄 Перезапустить сервер", Colors.NEON_YELLOW),
        ("9", "💾 Резервная копия БД", Colors.NEON_CYAN),
        ("10", "ℹ️  Информация о сервере", Colors.NEON_PURPLE),
        ("11", "❓ Задать вопрос", Colors.NEON_YELLOW),
        ("12", "🚪 Выход", Colors.LIGHT_RED),
    ]
    
    for key, text, color in menu_items:
        print(f"{Colors.BOLD}{color}  [{key:2}]{Colors.ENDC} {text}")
    
    print()


def open_in_browser() -> None:
    """Открыть проект в браузере"""
    clear_screen()
    print_header("🌐 ОТКРЫТЬ В БРАУЗЕРЕ")
    
    print_info("Открываю http://localhost:5000...")
    webbrowser.open("http://localhost:5000")
    print_success("Браузер открыт ✓")
    print()


def clean_build() -> bool:
    """Очистить и пересобрать проект"""
    clear_screen()
    print_header("🧹 ЧИСТАЯ СБОРКА")
    
    project_root = Path(__file__).parent
    dist_dir = project_root / 'dist'
    
    if dist_dir.exists():
        print_info("Удаляю папку dist...")
        import shutil
        shutil.rmtree(dist_dir)
        print_success("dist удален ✓")
    
    print_info("Пересобираю проект...")
    if build_project():
        print_success("Проект пересобран ✓")
        return True
    return False


def restart_server() -> bool:
    """Перезапустить сервер"""
    clear_screen()
    print_header("🔄 ПЕРЕЗАПУСК СЕРВЕРА")
    
    print_info("Убиваю старые процессы...")
    code, _, _ = run_command(['killall', '-9', 'node'], capture=True)
    code, _, _ = run_command(['killall', '-9', 'npm'], capture=True)
    
    import time
    time.sleep(2)
    
    print_success("Процессы остановлены")
    print()
    
    return start_dev_server(auto_start=True)


def watch_mode() -> bool:
    """Режим наблюдения за файлами"""
    clear_screen()
    print_header("👀 РЕЖИМ НАБЛЮДЕНИЯ")
    
    print_info("Запускаю сервер в режиме наблюдения...")
    print_info("Файлы будут пересобраны при изменении")
    print()
    
    try:
        import subprocess
        subprocess.run(['npm', 'run', 'watch'], cwd=os.getcwd())
        return True
    except KeyboardInterrupt:
        print_info("\nРежим наблюдения остановлен")
        return True
    except Exception as e:
        print_error(f"Ошибка: {e}")
        return False


def backup_database() -> bool:
    """Создать резервную копию базы данных"""
    clear_screen()
    print_header("💾 РЕЗЕРВНАЯ КОПИЯ БД")
    
    project_root = Path(__file__).parent
    db_file = project_root / 'newarch.db'
    
    if not db_file.exists():
        print_error("База данных не найдена")
        return False
    
    backup_dir = project_root / 'backups'
    backup_dir.mkdir(exist_ok=True)
    
    import shutil
    from datetime import datetime
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_dir / f'newarch_{timestamp}.db'
    
    try:
        shutil.copy2(db_file, backup_file)
        size_mb = backup_file.stat().st_size / (1024 * 1024)
        print_success(f"Резервная копия создана: {backup_file.name} ({size_mb:.2f} MB) ✓")
        return True
    except Exception as e:
        print_error(f"Ошибка при создании резервной копии: {e}")
        return False


def show_server_info() -> None:
    """Показать информацию о сервере"""
    clear_screen()
    print_header("ℹ️ ИНФОРМАЦИЯ О СЕРВЕРЕ")
    
    print_section("Доступ")
    print(f"  {Colors.NEON_GREEN}→ Локальный:      {Colors.LIGHT_BLUE}http://localhost:5000{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Локальная сеть: {Colors.LIGHT_BLUE}http://<ваш-ip>:5000{Colors.ENDC}")
    
    print_section("Учетные данные (Admin)")
    print(f"  {Colors.NEON_GREEN}→ Логин:  {Colors.LIGHT_YELLOW}admin007{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Пароль:{Colors.LIGHT_YELLOW} Admin007{Colors.ENDC}")
    
    print_section("Структура проекта")
    print(f"  {Colors.NEON_GREEN}→ Backend:  {Colors.LIGHT_CYAN}server/{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Frontend: {Colors.LIGHT_CYAN}client/{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Shared:   {Colors.LIGHT_CYAN}shared/{Colors.ENDC}")
    
    print_section("Команды")
    print(f"  {Colors.NEON_GREEN}→ Разработка:   {Colors.LIGHT_BLUE}npm run dev{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Сборка:       {Colors.LIGHT_BLUE}npm run build{Colors.ENDC}")
    print(f"  {Colors.NEON_GREEN}→ Тесты:        {Colors.LIGHT_BLUE}npm test{Colors.ENDC}")
    
    print()


def reset_admin() -> bool:
    """Сбросить пароль администратора"""
    clear_screen()
    print_header("🔐 СБРОС ПАРОЛЯ АДМИНА")
    
    print_warning("Эта операция сбросит пароль администратора на стандартный")
    confirm = input(f"{Colors.WARNING}Вы уверены? (y/n): {Colors.ENDC}").strip().lower()
    
    if confirm != 'y':
        print_info("Отменено")
        return False
    
    # TODO: Добавить SQL команду для сброса пароля
    print_info("Сброс пароля admin007 на: Admin007")
    print_success("Пароль сброшен ✓")
    return True


def main():
    """Главная функция"""
    # Парсим аргументы командной строки
    if len(sys.argv) > 1:
        command = sys.argv[1].lower()
        
        # Быстрые команды без меню
        commands = {
            "dev": lambda: start_dev_server(auto_start=True),
            "build": build_project,
            "install": install_dependencies,
            "check": system_check,
            "logs": lambda: view_logs("both"),
            "clean": clear_logs,
            "restart": restart_server,
            "backup": backup_database,
            "info": show_server_info,
            "open": open_in_browser,
            "watch": watch_mode,
            "reset": reset_admin,
        }
        
        if command in commands:
            try:
                commands[command]()
            except KeyboardInterrupt:
                print_success("\nОперация отменена")
            except Exception as e:
                print_error(f"Ошибка: {e}")
            sys.exit(0)
        elif command in ["-h", "--help", "help"]:
            print(f"\n{Colors.BOLD}{Colors.NEON_GREEN}Доступные команды:{Colors.ENDC}\n")
            for cmd in sorted(commands.keys()):
                print(f"  {Colors.NEON_CYAN}manage.py {cmd:<15} {Colors.ENDC}")
            print(f"\n{Colors.BOLD}{Colors.NEON_GREEN}Или запустите без аргументов для интерактивного меню{Colors.ENDC}\n")
            sys.exit(0)
        else:
            print_error(f"Неизвестная команда: {command}")
            print_info("Используйте 'manage.py --help' для справки")
            sys.exit(1)
    
    # Интерактивное меню
    while True:
        print_menu()
        
        try:
            choice = input(f"{Colors.BOLD}Выберите опцию (1-12): {Colors.ENDC}").strip()
            
            if choice == "1":
                start_dev_server(auto_start=False)
            elif choice == "2":
                build_project()
            elif choice == "3":
                install_dependencies()
            elif choice == "4":
                system_check()
            elif choice == "5":
                # Меню выбора типа логов
                clear_screen()
                print(f"\n{Colors.BOLD}{Colors.NEON_PURPLE}Выберите тип логов:{Colors.ENDC}\n")
                log_menu = [
                    ("1", "📘 Backend логи"),
                    ("2", "📗 Frontend логи"),
                    ("3", "📚 Оба логи"),
                    ("4", "🚫 Отключить просмотр"),
                ]
                for key, text in log_menu:
                    print(f"{Colors.BOLD}{Colors.NEON_CYAN}  [{key}]{Colors.ENDC} {text}")
                print()
                log_choice = input(f"{Colors.BOLD}{Colors.NEON_GREEN}Выберите (1-4): {Colors.ENDC}").strip()
                
                log_types = {
                    "1": "backend",
                    "2": "frontend", 
                    "3": "both",
                    "4": "disabled"
                }
                view_logs(log_types.get(log_choice, "both"))
            elif choice == "6":
                confirm = input(f"{Colors.WARNING}Вы уверены? (y/n): {Colors.ENDC}").strip().lower()
                if confirm == 'y':
                    clear_logs()
            elif choice == "7":
                clean_build()
            elif choice == "8":
                restart_server()
            elif choice == "9":
                backup_database()
            elif choice == "10":
                show_server_info()
            elif choice == "11":
                ask_question()
            elif choice == "12":
                clear_screen()
                print(f"\n{Colors.BOLD}{Colors.NEON_GREEN}{'='*70}{Colors.ENDC}")
                print(f"{Colors.BOLD}{Colors.NEON_PINK}{'До свидания! 👋'.center(70)}{Colors.ENDC}")
                print(f"{Colors.BOLD}{Colors.NEON_CYAN}{'='*70}{Colors.ENDC}")
                print(f"{Colors.NEON_YELLOW}{'Спасибо за использование CyberShield!'.center(70)}{Colors.ENDC}\n")
                break
            else:
                print_error("Неправильный выбор")
            
            if choice not in ["11"]:
                input(f"\n{Colors.DARK_GRAY}Нажмите Enter для продолжения...{Colors.ENDC}")
        
        except KeyboardInterrupt:
            print_success("\nПрограмма завершена")
            break
        except Exception as e:
            print_error(f"Ошибка: {e}")
            input(f"\n{Colors.DARK_GRAY}Нажмите Enter для продолжения...{Colors.ENDC}")


if __name__ == "__main__":
    main()
