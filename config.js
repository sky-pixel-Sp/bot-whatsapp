import fs from 'fs';
import path from 'path';

// Configuration file
export const config = {
    // Basic
    botName: "🤖 SKY BOT AI",
    prefix: ".",
    sessionName: "session-sky",
    
    // Authentication
    pairingCode: {
        enabled: true,
        length: 8,
        timeout: 300000 // 5 minutes
    },
    
    // Features
    metaAI: {
        enabled: process.env.META_AI_KEY ? true : false,
        apiKey: process.env.META_AI_KEY || "",
        model: "llama-3-70b",
        endpoint: "https://api.meta.ai/v1/chat/completions"
    },
    
    // Paths - FIXED: assets inside src/
    paths: {
        assets: "./src/assets",
        session: "./session",
        temp: "./temp",
        media: "./media",
        backups: "./backups",
        logs: "./logs"
    },
    
    // Limits
    limits: {
        free: 50,
        premium: 99999,
        maxFileSize: 150 * 1024 * 1024
    },
    
    // Menu
    menu: {
        image: "./src/assets/menu.jpg",
        video: "./src/assets/menu.mp4",
        showVideo: true
    },
    
    // API Endpoints
    apis: {
        tiktok: [
            "https://www.tikwm.com/api/",
            "https://api.tiklydown.eu.org/api/download",
            "https://savetik.co/api/ajaxSearch"
        ],
        youtube: "https://yt-downloader-api.com",
        instagram: "https://ig-downloader-api.com"
    },
    
    // 600+ Commands Categories
    categories: {
        core: 30,
        downloader: 50,
        media: 50,
        fun: 40,
        islamic: 30,
        group: 40,
        security: 30,
        search: 40,
        game: 40,
        ai: 30,
        spammer: 30,
        economy: 30,
        automation: 40,
        owner: 50,
        pairing: 3
    }
};

// Dynamic owners (will be loaded from database)
export let owners = [];

export function loadOwners() {
    try {
        if (fs.existsSync('./owners.json')) {
            const data = JSON.parse(fs.readFileSync('./owners.json', 'utf8'));
            owners = data.owners || [];
        }
        // Add from environment
        if (process.env.BOT_OWNER) {
            const envOwners = process.env.BOT_OWNER.split(',').map(num => num.trim() + '@s.whatsapp.net');
            owners = [...new Set([...owners, ...envOwners])];
        }
        
        // Default owner jika kosong
        if (owners.length === 0) {
            owners = ['6283116659962@s.whatsapp.net'];
        }
    } catch (error) {
        console.error('Error loading owners:', error);
        owners = ['6283116659962@s.whatsapp.net'];
    }
}

export function saveOwners() {
    try {
        fs.writeFileSync('./owners.json', JSON.stringify({ owners }, null, 2));
    } catch (error) {
        console.error('Error saving owners:', error);
    }
}

// Load owners on startup
loadOwners();