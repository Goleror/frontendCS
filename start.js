#!/usr/bin/env node

/**
 * Universal Project Launcher with Platform Selection
 * Supports Windows, macOS, Linux, and WSL
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const readline = require('readline');

const PROJECT_DIR = __dirname;
const LOGS_DIR = path.join(PROJECT_DIR, 'logs');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  blue: '\x1b[94m',
  green: '\x1b[92m',
  cyan: '\x1b[96m',
  yellow: '\x1b[93m',
  magenta: '\x1b[95m',
};

const print = {
  header: () => {
    console.clear();
    console.log(`\n${colors.bold}${colors.blue}${'='.repeat(50)}${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}  🎮 CYBERSHIELD PROJECT LAUNCHER${colors.reset}`);
    console.log(`${colors.bold}${colors.blue}${'='.repeat(50)}${colors.reset}\n`);
  },
  info: (msg) => console.log(`${colors.cyan}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`\x1b[91m✗ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
};

// Detect current OS
const getCurrentOS = () => {
  const platform = process.platform;
  if (platform === 'win32') return 'windows';
  if (platform === 'darwin') return 'macos';
  if (platform === 'linux') {
    // Check if running in WSL
    try {
      const wslCheck = execSync('uname -r').toString();
      if (wslCheck.toLowerCase().includes('microsoft')) return 'wsl';
    } catch (e) {}
    return 'linux';
  }
  return 'unknown';
};

// Create logs directory
if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

// Platform menu
const platformMenu = [
  { id: 1, name: '🪟 Windows', value: 'windows' },
  { id: 2, name: '🐧 Linux', value: 'linux' },
  { id: 3, name: '🍎 macOS', value: 'macos' },
  { id: 4, name: '🔷 WSL (Windows Subsystem for Linux)', value: 'wsl' },
  { id: 5, name: '🤖 Auto-detect', value: 'auto' },
];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const showMenu = () => {
  print.header();
  print.info('Select your development platform:');
  console.log('');
  platformMenu.forEach((item) => {
    console.log(`  ${colors.magenta}${item.id}${colors.reset}) ${item.name}`);
  });
  console.log('');
};

const askQuestion = (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
};

const checkDependencies = async () => {
  if (!fs.existsSync(path.join(PROJECT_DIR, 'node_modules'))) {
    print.header();
    print.warning('node_modules not found');
    print.info('Installing dependencies with npm install...');
    console.log('');

    try {
      execSync('npm install', { cwd: PROJECT_DIR, stdio: 'inherit' });
      print.success('Dependencies installed successfully');
    } catch (err) {
      print.error('Failed to install dependencies');
      process.exit(1);
    }
  }
};

const getPlatformInfo = (platform) => {
  const info = {
    windows: {
      name: 'Windows',
      shell: 'cmd',
      info: ['Access: http://localhost:5000', 'Press Ctrl+C to stop'],
    },
    linux: {
      name: 'Linux',
      shell: '/bin/bash',
      info: ['Access: http://localhost:5000', 'Press Ctrl+C to stop'],
    },
    macos: {
      name: 'macOS',
      shell: '/bin/bash',
      info: ['Access: http://localhost:5000', 'Press Ctrl+C to stop'],
    },
    wsl: {
      name: 'WSL',
      shell: '/bin/bash',
      info: ['Access: http://localhost:5000', 'Press Ctrl+C to stop'],
    },
  };
  return info[platform] || info.linux;
};

const launchServer = (platform) => {
  const platformInfo = getPlatformInfo(platform);

  print.header();
  console.log(`${colors.bold}Platform: ${colors.magenta}${platformInfo.name}${colors.reset}\n`);
  print.success('Starting development server...');
  console.log('');
  print.info('Server information:');
  platformInfo.info.forEach((item) => {
    console.log(`  ${colors.cyan}→${colors.reset} ${item}`);
  });
  console.log('');

  // Run npm dev with proper stdio inheritance
  const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const proc = spawn(npmCmd, ['run', 'dev'], {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
    shell: true,
  });

  proc.on('error', (err) => {
    print.error(`Failed to start: ${err.message}`);
    process.exit(1);
  });

  process.on('SIGINT', () => {
    console.log('\n');
    print.info('Shutting down server...');
    proc.kill();
    rl.close();
    process.exit(0);
  });
};

const main = async () => {
  showMenu();

  const choice = await askQuestion(`${colors.magenta}Enter your choice (1-5): ${colors.reset}`);
  const selectedItem = platformMenu.find((item) => item.id === parseInt(choice));

  if (!selectedItem) {
    print.error('Invalid choice. Please try again.');
    rl.close();
    process.exit(1);
  }

  let selectedPlatform = selectedItem.value;

  if (selectedPlatform === 'auto') {
    selectedPlatform = getCurrentOS();
    print.header();
    print.success(`Auto-detected platform: ${getPlatformInfo(selectedPlatform).name}`);
    console.log('');
  }

  rl.close();

  // Check and install dependencies
  await checkDependencies();

  // Launch server
  launchServer(selectedPlatform);
};

main().catch((err) => {
  print.error(`Error: ${err.message}`);
  process.exit(1);
});

