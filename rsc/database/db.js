import fs from 'fs';
import path from 'path';
import { config } from '../../config.js';
import { Utilities } from '../core/utils.js';

export class Database {
    constructor() {
        this.data = {
            users: {},
            groups: {},
            settings: {},
            commands: {},
            autoreplies: {},
            banned: {},
            premium: {},
            stats: {
                totalMessages: 0,
                totalCommands: 0,
                totalDownloads: 0,
                startups: 0,
                errors: 0
            }
        };
        this.filePath = './sky_database.json';
        this.load();
    }

    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                const raw = fs.readFileSync(this.filePath, 'utf8');
                this.data = JSON.parse(raw);
                console.log('💾 Database loaded');
            }
        } catch (error) {
            console.log('💾 Creating new database...');
            this.save();
        }
    }

    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error('❌ Database save error:', error);
        }
    }

    getUser(jid) {
        if (!this.data.users[jid]) {
            this.data.users[jid] = {
                jid: jid,
                name: '',
                limit: config.limits.free,
                level: 1,
                xp: 0,
                premium: false,
                premiumExpire: 0,
                banned: false,
                registered: Date.now(),
                lastSeen: Date.now(),
                totalCommands: 0
            };
        }
        return this.data.users[jid];
    }

    updateUser(jid, data) {
        const user = this.getUser(jid);
        Object.assign(user, data);
        user.lastSeen = Date.now();
        this.save();
        return user;
    }

    getGroup(jid) {
        if (!this.data.groups[jid]) {
            this.data.groups[jid] = {
                jid: jid,
                name: '',
                antilink: false,
                antibadword: false,
                welcome: false,
                goodbye: false,
                warnedUsers: {}
            };
        }
        return this.data.groups[jid];
    }

    updateGroup(jid, data) {
        const group = this.getGroup(jid);
        Object.assign(group, data);
        this.save();
        return group;
    }

    addBan(jid, reason = '', duration = 0) {
        this.data.banned[jid] = {
            jid: jid,
            reason: reason,
            bannedAt: Date.now(),
            duration: duration,
            expires: duration > 0 ? Date.now() + duration : 0
        };
        this.save();
    }

    removeBan(jid) {
        delete this.data.banned[jid];
        this.save();
    }

    isBanned(jid) {
        const ban = this.data.banned[jid];
        if (!ban) return false;
        
        if (ban.expires > 0 && Date.now() > ban.expires) {
            this.removeBan(jid);
            return false;
        }
        
        return true;
    }

    incrementStat(stat) {
        if (this.data.stats[stat] !== undefined) {
            this.data.stats[stat]++;
            this.save();
        }
    }

    getAllUsers() {
        return Object.values(this.data.users);
    }
}
