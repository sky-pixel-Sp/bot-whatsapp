#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SkyBot } from './src/core/bot.js';
import { config, owners, loadOwners, saveOwners } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.clear();

// Banner
console.log(chalk.cyan(figlet.textSync('SKY BOT AI', { font: 'Standard' })));
console.log(chalk.yellow('='.repeat(70)));
console.log(chalk.green('🤖 Ultimate WhatsApp Bot v7.0'));
console.log(chalk.cyan('📱 600+ Commands | 8-Digit Pairing Code | META AI'));
console.log(chalk.magenta('🔥 Optimized for Oppo A60 & Termux'));
console.log(chalk.yellow('='.repeat(70)));

// Check assets
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
    console.log(chalk.yellow('📁 Created assets directory'));
}

// Setup program
program
    .name('sky-bot')
    .description('Sky Bot AI - Ultimate WhatsApp Bot with 600+ Commands')
    .version('7.0.0');

program
    .command('start')
    .description('Start the bot')
    .option('-m, --mode <mode>', 'Authentication mode (qr/pairing)', 'pairing')
    .action(async (options) => {
        console.log(chalk.cyan('\n🚀 Starting Sky Bot AI...'));
        
        // Load owners
        loadOwners();
        if (owners.length === 0) {
            console.log(chalk.yellow('⚠️ No owners set. Using default owner.'));
            owners.push('6283116659962@s.whatsapp.net');
            saveOwners();
        }
        
        console.log(chalk.green(`👑 Owners: ${owners.length} owner(s)`));
        
        const bot = new SkyBot();
        await bot.initialize(options.mode);
    });

program
    .command('owner')
    .description('Owner management terminal')
    .action(() => {
        showOwnerTerminal().catch(console.error);
    });

program
    .command('setup')
    .description('Initial setup wizard')
    .action(() => {
        runSetupWizard().catch(console.error);
    });

program
    .command('menu')
    .description('Show all bot commands menu')
    .action(() => {
        showAllCommandsMenu().catch(console.error);
    });

program.parse();

// ===================== OWNER TERMINAL =====================
async function showOwnerTerminal() {
    console.clear();
    console.log(chalk.cyan('='.repeat(70)));
    console.log(chalk.yellow.bold('👑 SKY BOT AI OWNER TERMINAL'));
    console.log(chalk.cyan('='.repeat(70)));
    
    while (true) {
        const { action } = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Select action:',
                choices: [
                    '📝 Add Owner',
                    '🗑️ Remove Owner',
                    '📋 List Owners',
                    '📊 Bot Statistics',
                    '💾 Database Backup',
                    '🧹 Clear Cache',
                    '🔄 Restart Bot',
                    '🛑 Shutdown',
                    '⚡ Update Bot',
                    '🔧 Fix Issues',
                    '🚪 Exit'
                ]
            }
        ]);
        
        switch (action) {
            case '📝 Add Owner':
                await addOwner();
                break;
            case '🗑️ Remove Owner':
                await removeOwner();
                break;
            case '📋 List Owners':
                listOwners();
                break;
            case '📊 Bot Statistics':
                await showStatistics();
                break;
            case '💾 Database Backup':
                await backupDatabase();
                break;
            case '🧹 Clear Cache':
                await clearCache();
                break;
            case '🔄 Restart Bot':
                console.log(chalk.yellow('🔄 Restarting bot...'));
                process.exit(1);
                break;
            case '🛑 Shutdown':
                await shutdownBot();
                break;
            case '⚡ Update Bot':
                await updateBot();
                break;
            case '🔧 Fix Issues':
                await fixIssues();
                break;
            case '🚪 Exit':
                console.log(chalk.green('👋 Goodbye!'));
                return;
        }
        
        console.log('\n');
    }
}

async function addOwner() {
    const { number } = await inquirer.prompt([
        {
            type: 'input',
            name: 'number',
            message: 'Enter WhatsApp number (628xxxxxxx):',
            validate: input => /^628\d{8,}$/.test(input) ? true : 'Invalid WhatsApp number'
        }
    ]);
    
    const ownerJid = number + '@s.whatsapp.net';
    
    if (owners.includes(ownerJid)) {
        console.log(chalk.red('⚠️ Owner already exists!'));
        return;
    }
    
    owners.push(ownerJid);
    saveOwners();
    console.log(chalk.green(`✅ Added owner: ${number}`));
    console.log(chalk.cyan(`Total owners: ${owners.length}`));
}

async function removeOwner() {
    if (owners.length === 0) {
        console.log(chalk.red('❌ No owners to remove'));
        return;
    }
    
    const choices = owners.map((owner, index) => ({
        name: `${index + 1}. ${owner.split('@')[0]}`,
        value: owner
    }));
    
    const { selected } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selected',
            message: 'Select owner to remove:',
            choices
        }
    ]);
    
    const index = owners.indexOf(selected);
    if (index > -1) {
        owners.splice(index, 1);
        saveOwners();
        console.log(chalk.green(`✅ Removed owner: ${selected.split('@')[0]}`));
    }
}

function listOwners() {
    console.log(chalk.cyan('\n📋 LIST OF OWNERS'));
    console.log(chalk.yellow('='.repeat(40)));
    
    if (owners.length === 0) {
        console.log(chalk.red('No owners set'));
    } else {
        owners.forEach((owner, index) => {
            console.log(chalk.green(`${index + 1}. ${owner.split('@')[0]}`));
        });
    }
    
    console.log(chalk.yellow('='.repeat(40)));
}

async function showStatistics() {
    try {
        const dbPath = path.join(__dirname, 'sky_database.json');
        let stats = {};
        
        if (fs.existsSync(dbPath)) {
            const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            stats = dbData.stats || {};
        }
        
        console.log(chalk.cyan('\n📊 BOT STATISTICS'));
        console.log(chalk.yellow('='.repeat(50)));
        console.log(chalk.green(`👥 Total Users: ${Object.keys(stats.users || {}).length}`));
        console.log(chalk.green(`💬 Total Messages: ${stats.totalMessages || 0}`));
        console.log(chalk.green(`⚡ Total Commands: ${stats.totalCommands || 0}`));
        console.log(chalk.green(`📥 Total Downloads: ${stats.totalDownloads || 0}`));
        console.log(chalk.green(`🎮 Total Games: ${stats.totalGames || 0}`));
        console.log(chalk.green(`🖼️ Total Stickers: ${stats.totalStickers || 0}`));
        console.log(chalk.green(`❌ Total Errors: ${stats.errors || 0}`));
        console.log(chalk.green(`🔄 Startups: ${stats.startups || 0}`));
        console.log(chalk.yellow('='.repeat(50)));
        
    } catch (error) {
        console.error(chalk.red('Error getting stats:'), error);
    }
}

async function backupDatabase() {
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    const dbFile = path.join(__dirname, 'sky_database.json');
    
    if (!fs.existsSync(dbFile)) {
        console.log(chalk.red('❌ Database file not found!'));
        return;
    }
    
    fs.copyFileSync(dbFile, backupFile);
    console.log(chalk.green(`✅ Backup created: backups/backup-${timestamp}.json`));
}

async function clearCache() {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Clear temp files and cache?',
            default: false
        }
    ]);
    
    if (confirm) {
        try {
            const { exec } = await import('child_process');
            const { promisify } = await import('util');
            const execAsync = promisify(exec);
            
            await execAsync('rm -rf ./temp/* 2>/dev/null || true');
            await execAsync('rm -rf ./session/.wwebjs_auth/* 2>/dev/null || true');
            console.log(chalk.green('✅ Cache cleared!'));
        } catch (error) {
            console.error(chalk.red('Error clearing cache:'), error);
        }
    }
}

async function shutdownBot() {
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: 'Are you sure you want to shutdown the bot?',
            default: false
        }
    ]);
    
    if (confirm) {
        console.log(chalk.red('🛑 Shutting down bot...'));
        process.exit(0);
    }
}

async function updateBot() {
    console.log(chalk.yellow('🔄 Checking for updates...'));
    
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        const { stdout } = await execAsync('git pull');
        console.log(chalk.green('📥 Update output:'));
        console.log(chalk.gray(stdout));
        
        const { confirm } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: 'Install updated dependencies?',
                default: true
            }
        ]);
        
        if (confirm) {
            console.log(chalk.yellow('📦 Installing dependencies...'));
            const { stdout: installOutput } = await execAsync('npm install');
            console.log(chalk.green('✅ Dependencies updated'));
        }
        
    } catch (error) {
        console.error(chalk.red('Update error:'), error);
    }
}

async function fixIssues() {
    console.log(chalk.yellow('🔧 Fixing common issues...'));
    
    try {
        const { exec } = await import('child_process');
        const { promisify } = await import('util');
        const execAsync = promisify(exec);
        
        // Fix session issues
        if (fs.existsSync('./session')) {
            await execAsync('chmod -R 755 ./session');
            console.log(chalk.green('✅ Fixed session permissions'));
        }
        
        // Fix node_modules
        if (!fs.existsSync('./node_modules')) {
            console.log(chalk.yellow('📦 Installing missing node_modules...'));
            await execAsync('npm install');
        }
        
        // Check ffmpeg
        try {
            await execAsync('ffmpeg -version');
            console.log(chalk.green('✅ FFmpeg is installed'));
        } catch {
            console.log(chalk.red('❌ FFmpeg not found. Install with: pkg install ffmpeg'));
        }
        
        console.log(chalk.green('✅ Issue check completed'));
        
    } catch (error) {
        console.error(chalk.red('Fix error:'), error);
    }
}

// ===================== SETUP WIZARD =====================
async function runSetupWizard() {
    console.clear();
    console.log(chalk.cyan('='.repeat(70)));
    console.log(chalk.yellow.bold('⚙️ SKY BOT AI SETUP WIZARD'));
    console.log(chalk.cyan('='.repeat(70)));
    
    const questions = [
        {
            type: 'input',
            name: 'owner',
            message: 'Enter your WhatsApp number (628xxxxxxx):',
            validate: input => /^628\d{8,}$/.test(input) ? true : 'Invalid WhatsApp number'
        },
        {
            type: 'input',
            name: 'prefix',
            message: 'Bot command prefix:',
            default: '.'
        },
        {
            type: 'input',
            name: 'botName',
            message: 'Bot display name:',
            default: '🤖 Sky Bot AI'
        },
        {
            type: 'confirm',
            name: 'useMetaAI',
            message: 'Enable META AI (requires API key)?',
            default: false
        },
        {
            type: 'confirm',
            name: 'autoBackup',
            message: 'Enable auto backup every 6 hours?',
            default: true
        },
        {
            type: 'confirm',
            name: 'usePm2',
            message: 'Use PM2 for process management?',
            default: true
        }
    ];
    
    const answers = await inquirer.prompt(questions);
    
    // Save to config
    const configData = {
        botName: answers.botName,
        prefix: answers.prefix,
        owner: answers.owner + '@s.whatsapp.net',
        features: {
            metaAI: answers.useMetaAI,
            autoBackup: answers.autoBackup,
            pm2: answers.usePm2
        },
        setupCompleted: true,
        setupDate: new Date().toISOString()
    };
    
    fs.writeFileSync('./config.json', JSON.stringify(configData, null, 2));
    
    // Save owner
    owners.push(configData.owner);
    saveOwners();
    
    // Create .env if needed
    if (answers.useMetaAI) {
        const envContent = `# Sky Bot AI Configuration
BOT_OWNER=${answers.owner}
BOT_PREFIX=${answers.prefix}
BOT_NAME=${answers.botName}
META_AI_KEY=your_meta_ai_key_here
`;
        fs.writeFileSync('./.env', envContent);
        console.log(chalk.yellow('\n⚠️ Edit .env file to add your META AI key'));
    }
    
    console.log(chalk.green('\n✅ Setup completed!'));
    console.log(chalk.cyan('\nNext steps:'));
    console.log('1. Run: node main.js start');
    console.log('2. Use 8-digit pairing code to connect');
    console.log('3. Type .menu in WhatsApp to see commands');
}

// ===================== ALL COMMANDS MENU =====================
async function showAllCommandsMenu() {
    console.clear();
    console.log(chalk.cyan('='.repeat(80)));
    console.log(chalk.yellow.bold('📋 SKY BOT AI - ALL 600+ COMMANDS'));
    console.log(chalk.cyan('='.repeat(80)));
    
    const menu = `
${chalk.green.bold('🤖 CORE & INFO (30 Commands)')}
${config.prefix}menu, ${config.prefix}allmenu, ${config.prefix}ping, ${config.prefix}speed, ${config.prefix}runtime
${config.prefix}status, ${config.prefix}info, ${config.prefix}owner, ${config.prefix}rules, ${config.prefix}script
${config.prefix}changelog, ${config.prefix}report, ${config.prefix}donate, ${config.prefix}support, ${config.prefix}tutorial
${config.prefix}version, ${config.prefix}privacy, ${config.prefix}tos, ${config.prefix}faq, ${config.prefix}debug
${config.prefix}log, ${config.prefix}health, ${config.prefix}selftest, ${config.prefix}restart, ${config.prefix}shutdown

${chalk.green.bold('📥 DOWNLOADER (50+ Commands)')}
${config.prefix}play, ${config.prefix}ytmp3, ${config.prefix}ytmp4, ${config.prefix}ytshorts, ${config.prefix}ytdl
${config.prefix}ytsearch, ${config.prefix}tiktok, ${config.prefix}tiktoknowm, ${config.prefix}tiktokwm, ${config.prefix}tiktokhd
${config.prefix}tiktokslide, ${config.prefix}tiktokmusic, ${config.prefix}ig, ${config.prefix}igstory, ${config.prefix}igreels
${config.prefix}igphoto, ${config.prefix}igvideo, ${config.prefix}fb, ${config.prefix}twitter, ${config.prefix}threads
${config.prefix}spotify, ${config.prefix}joox, ${config.prefix}soundcloud, ${config.prefix}mediafire, ${config.prefix}gdrive

${chalk.green.bold('🖼️ MEDIA & CONVERTER (50+ Commands)')}
${config.prefix}sticker, ${config.prefix}swm, ${config.prefix}toimg, ${config.prefix}tovideo, ${config.prefix}togif
${config.prefix}tomp3, ${config.prefix}tovn, ${config.prefix}tourl, ${config.prefix}ttp, ${config.prefix}attp
${config.prefix}emojimix, ${config.prefix}removebg, ${config.prefix}resize, ${config.prefix}crop, ${config.prefix}compress
${config.prefix}enhance, ${config.prefix}upscale, ${config.prefix}hdr, ${config.prefix}blur, ${config.prefix}sharpen

${chalk.green.bold('😂 FUN & GAMES (40+ Commands)')}
${config.prefix}joke, ${config.prefix}darkjoke, ${config.prefix}quotes, ${config.prefix}pantun, ${config.prefix}bucin
${config.prefix}galau, ${config.prefix}bijak, ${config.prefix}puisi, ${config.prefix}cerpen, ${config.prefix}faktaunik
${config.prefix}truth, ${config.prefix}dare, ${config.prefix}wouldyourather, ${config.prefix}rate, ${config.prefix}cekjodoh
${config.prefix}cekhoki, ${config.prefix}siapakahaku, ${config.prefix}caklontong, ${config.prefix}tebaktebakan, ${config.prefix}tebakgambar

${chalk.green.bold('☪️ ISLAMIC (30+ Commands)')}
${config.prefix}jadwalsholat, ${config.prefix}alquran, ${config.prefix}ayat, ${config.prefix}ayatkursi, ${config.prefix}asmaulhusna
${config.prefix}doaharian, ${config.prefix}niatsholat, ${config.prefix}tahlil, ${config.prefix}istighfar, ${config.prefix}dzikir
${config.prefix}wirid, ${config.prefix}hadits, ${config.prefix}kisahnabi, ${config.prefix}kisahrasul, ${config.prefix}niatpuasa

${chalk.green.bold('👥 GROUP MANAGEMENT (40+ Commands)')}
${config.prefix}add, ${config.prefix}kick, ${config.prefix}promote, ${config.prefix}demote, ${config.prefix}tagall
${config.prefix}linkgc, ${config.prefix}resetlink, ${config.prefix}setppgc, ${config.prefix}setname, ${config.prefix}setdesc
${config.prefix}welcome, ${config.prefix}goodbye, ${config.prefix}open, ${config.prefix}close, ${config.prefix}lock
${config.prefix}unlock, ${config.prefix}mute, ${config.prefix}unmute, ${config.prefix}slowmode, ${config.prefix}revoke

${chalk.green.bold('🔐 SECURITY (30+ Commands)')}
${config.prefix}antilink, ${config.prefix}antilinkyt, ${config.prefix}antilinkig, ${config.prefix}antibadword, ${config.prefix}antispam
${config.prefix}antiflood, ${config.prefix}antivirtex, ${config.prefix}antibot, ${config.prefix}antiscam, ${config.prefix}antiporn
${config.prefix}antitoxic, ${config.prefix}warn, ${config.prefix}unwarn, ${config.prefix}kickwarn, ${config.prefix}clearwarn

${chalk.green.bold('🔎 SEARCH & INFO (40+ Commands)')}
${config.prefix}google, ${config.prefix}gimage, ${config.prefix}bing, ${config.prefix}duckduckgo, ${config.prefix}yahoo
${config.prefix}wikipedia, ${config.prefix}kbbi, ${config.prefix}translate, ${config.prefix}lirik, ${config.prefix}chord
${config.prefix}cuaca, ${config.prefix}news, ${config.prefix}covid, ${config.prefix}kodepos, ${config.prefix}jarak

${chalk.green.bold('🎮 GAME & RPG (40+ Commands)')}
${config.prefix}rpg, ${config.prefix}profilegame, ${config.prefix}hunt, ${config.prefix}mine, ${config.prefix}fishing
${config.prefix}adventure, ${config.prefix}battle, ${config.prefix}duel, ${config.prefix}shop, ${config.prefix}buy
${config.prefix}sell, ${config.prefix}craft, ${config.prefix}upgrade, ${config.prefix}heal, ${config.prefix}openchest
${config.prefix}dailyrpg, ${config.prefix}weeklyrpg, ${config.prefix}monthlyrpg, ${config.prefix}pet, ${config.prefix}feedpet

${chalk.green.bold('🧠 AI & CHAT (30+ Commands)')}
${config.prefix}ai, ${config.prefix}gemma, ${config.prefix}aion, ${config.prefix}aioff, ${config.prefix}aistatus
${config.prefix}aimode, ${config.prefix}aimode_fast, ${config.prefix}aimode_precise, ${config.prefix}aimode_creative
${config.prefix}aisetlang, ${config.prefix}aisetstyle, ${config.prefix}aisetlength, ${config.prefix}resetai, ${config.prefix}resetcontext

${chalk.green.bold('📢 SPAMMER (30+ Commands)')}
${config.prefix}spam, ${config.prefix}spamtext, ${config.prefix}spamemoji, ${config.prefix}spamquote, ${config.prefix}spamtag
${config.prefix}spammention, ${config.prefix}spambutton, ${config.prefix}spamimage, ${config.prefix}spamsticker, ${config.prefix}spamgif
${config.prefix}spamvideo, ${config.prefix}spamaudio, ${config.prefix}spamvn, ${config.prefix}spamloc, ${config.prefix}spamcontact

${chalk.green.bold('💰 ECONOMY (30+ Commands)')}
${config.prefix}bank, ${config.prefix}deposit, ${config.prefix}withdraw, ${config.prefix}transfer, ${config.prefix}pay
${config.prefix}tax, ${config.prefix}itemlist, ${config.prefix}refine, ${config.prefix}repair, ${config.prefix}durability
${config.prefix}petlist, ${config.prefix}adopt, ${config.prefix}renamepet, ${config.prefix}mount, ${config.prefix}farm

${chalk.green.bold('⚙️ AUTOMATION (40+ Commands)')}
${config.prefix}autoreply, ${config.prefix}setreply, ${config.prefix}delreply, ${config.prefix}listreply, ${config.prefix}keyword
${config.prefix}setcmd, ${config.prefix}delcmd, ${config.prefix}listcmd, ${config.prefix}broadcast, ${config.prefix}forward
${config.prefix}schedule, ${config.prefix}reminder, ${config.prefix}timer, ${config.prefix}polling, ${config.prefix}calc

${chalk.green.bold('👑 OWNER (50+ Commands)')}
${config.prefix}ban, ${config.prefix}unban, ${config.prefix}block, ${config.prefix}unblock, ${config.prefix}addpremium
${config.prefix}delpremium, ${config.prefix}resetlimit, ${config.prefix}setlimit, ${config.prefix}setppbot, ${config.prefix}setnamabot
${config.prefix}setbio, ${config.prefix}restart, ${config.prefix}shutdown, ${config.prefix}reload, ${config.prefix}update

${chalk.green.bold('🔑 PAIRING CODE (3 Commands)')}
${config.prefix}pairing, ${config.prefix}showcode, ${config.prefix}getcode

${chalk.cyan('='.repeat(80))}
${chalk.yellow.bold('📊 TOTAL: 600+ COMMANDS')}
${chalk.cyan('='.repeat(80))}
    `.trim();
    
    console.log(menu);
    
    // Pause
    await inquirer.prompt([
        {
            type: 'input',
            name: 'continue',
            message: 'Press Enter to return...'
        }
    ]);
}

// Handle errors
process.on('uncaughtException', (error) => {
    console.error(chalk.red('❌ Uncaught Exception:'), error);
    const logDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
    fs.appendFileSync(path.join(logDir, 'crash.log'), 
        `[${new Date().toISOString()}] ${error.stack}\n\n`);
});

process.on('SIGINT', () => {
    console.log(chalk.yellow('\n🛑 Shutting down gracefully...'));
    process.exit(0);
});