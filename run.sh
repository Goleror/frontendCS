#!/bin/bash

# CyberShield Project Launcher
# Быстрый запуск проекта

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGS_DIR="$PROJECT_DIR/logs"

# ANSI Colors
BOLD='\033[1m'
BLUE='\033[94m'
GREEN='\033[92m'
YELLOW='\033[93m'
RED='\033[91m'
CYAN='\033[96m'
NC='\033[0m'

# Functions
print_header() {
    echo -e "\n${BOLD}${BLUE}========================================${NC}"
    echo -e "${BOLD}${BLUE}  🎮 CYBERSHIELD PROJECT LAUNCHER${NC}"
    echo -e "${BOLD}${BLUE}========================================${NC}\n"
}

print_info() {
    echo -e "${CYAN}ℹ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Create logs directory if not exists
mkdir -p "$LOGS_DIR"

# Check if node_modules exists
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    print_header
    print_info "node_modules не найден, установка зависимостей..."
    cd "$PROJECT_DIR"
    npm install
    print_success "Зависимости установлены"
fi

print_header
print_info "Запуск сервера..."
print_info "Доступ: http://localhost:5000"
print_info "Локальная сеть: http://<ваш-ip>:5000"
print_info "Нажмите Ctrl+C для остановки"
echo ""

cd "$PROJECT_DIR"
npm run dev
