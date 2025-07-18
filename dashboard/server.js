
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const app = express();

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session management
const sessions = new Map();

// Helper function to get user info from session or Replit headers
function getUserInfo(req) {
    // Check session first (for OAuth2)
    const sessionId = req.headers['x-session-id'];
    if (sessionId && sessions.has(sessionId)) {
        return sessions.get(sessionId);
    }
    
    // Fallback to Replit headers
    const replitUser = {
        id: req.headers['x-replit-user-id'],
        name: req.headers['x-replit-user-name'],
        roles: req.headers['x-replit-user-roles']
    };
    
    if (replitUser.id) {
        return replitUser;
    }
    
    return null;
}

// Routes
// Load config
const config = require('../data/config.json');

// OAuth2 configuration
const DISCORD_CLIENT_ID = config.clientId;
const DISCORD_CLIENT_SECRET = config.clientSecret;
const REDIRECT_URI = config.redirectUri;

app.get('/', (req, res) => {
    const user = getUserInfo(req);
    if (user && user.id) {
        res.redirect('/dashboard');
    } else {
        res.render('login', { 
            discordAuthUrl: `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`,
            hasOAuth: !!(DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET)
        });
    }
});

// OAuth2 callback
app.get('/auth/callback', async (req, res) => {
    const { code } = req.query;
    if (!code) {
        return res.redirect('/?error=no_code');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: REDIRECT_URI,
            }),
        });

        const tokenData = await tokenResponse.json();
        
        if (!tokenData.access_token) {
            return res.redirect('/?error=token_error');
        }

        // Get user info
        const userResponse = await fetch('https://discord.com/api/users/@me', {
            headers: {
                Authorization: `Bearer ${tokenData.access_token}`,
            },
        });

        const userData = await userResponse.json();
        
        // Create session
        const sessionId = Math.random().toString(36).substring(2, 15);
        sessions.set(sessionId, {
            id: userData.id,
            name: userData.username,
            avatar: userData.avatar,
            access_token: tokenData.access_token
        });

        res.cookie('session_id', sessionId, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 24 hours
        res.redirect('/dashboard');
    } catch (error) {
        console.error('OAuth error:', error);
        res.redirect('/?error=auth_failed');
    }
});

app.get('/logout', (req, res) => {
    const sessionId = req.cookies.session_id;
    if (sessionId) {
        sessions.delete(sessionId);
        res.clearCookie('session_id');
    }
    res.redirect('/');
});

app.get('/dashboard', (req, res) => {
    const user = getUserInfo(req);
    if (!user || !user.id) {
        return res.redirect('/');
    }

    // Load bot stats
    let config;
    let client;
    
    try {
        config = require('../data/config.json');
        const botModule = require('../index.js');
        client = botModule.client;
    } catch (error) {
        console.error('Error loading bot data:', error);
        config = { prefix: '!' };
        client = null;
    }
    
    const stats = {
        guilds: client && client.guilds ? client.guilds.cache.size : 0,
        users: client && client.users ? client.users.cache.size : 0,
        uptime: process.uptime(),
        status: client && client.readyAt ? 'Online' : 'Offline'
    };

    res.render('dashboard', { user, stats, config });
});

app.get('/api/guilds', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = require('../index.js').client;
    if (!client) {
        return res.json([]);
    }

    const guilds = client.guilds.cache.map(guild => ({
        id: guild.id,
        name: guild.name,
        memberCount: guild.memberCount,
        icon: guild.iconURL()
    }));

    res.json(guilds);
});

app.get('/api/commands', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = require('../index.js').client;
    if (!client || !client.commands) {
        return res.json([]);
    }

    const commands = Array.from(client.commands.values())
        .filter((cmd, index, arr) => arr.findIndex(c => c.name === cmd.name) === index)
        .map(cmd => ({
            name: cmd.name,
            description: cmd.description || 'No description',
            category: cmd.category || 'Uncategorized',
            aliases: cmd.aliases || []
        }));

    res.json(commands);
});

app.post('/api/config/prefix', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { prefix } = req.body;
    if (!prefix || prefix.length > 5) {
        return res.status(400).json({ error: 'Invalid prefix' });
    }

    try {
        const config = require('../data/config.json');
        config.prefix = prefix;
        fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
        res.json({ success: true, prefix });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update prefix' });
    }
});

// Get warnings data
app.get('/api/warnings', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const warnings = require('../data/warnings.json');
        res.json(warnings);
    } catch (error) {
        res.json({});
    }
});

// Get automod settings
app.get('/api/automod', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const automod = require('../data/automod.json');
        res.json(automod);
    } catch (error) {
        res.json({});
    }
});

// Update automod settings
app.post('/api/automod', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const automodData = req.body;
        fs.writeFileSync('./data/automod.json', JSON.stringify(automodData, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update automod settings' });
    }
});

// Get giveaway data
app.get('/api/giveaways', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const giveaways = require('../data/giveaway.json');
        res.json(giveaways);
    } catch (error) {
        res.json({});
    }
});

// Get bot logs
app.get('/api/logs', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Read recent logs (last 100 lines)
        const logs = [];
        res.json(logs);
    } catch (error) {
        res.json([]);
    }
});

// Bot control endpoints
app.post('/api/bot/restart', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Restart the bot
        setTimeout(() => {
            process.exit(0);
        }, 1000);
        res.json({ success: true, message: 'Bot restarting...' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to restart bot' });
    }
});

// Update bot status
app.post('/api/bot/status', (req, res) => {
    const user = getUserInfo(req);
    if (!user.id) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const { status, activityType, activityText } = req.body;
    
    try {
        const config = require('../data/config.json');
        config.status = status;
        config.presence = {
            type: activityType,
            text: activityText
        };
        fs.writeFileSync('./data/config.json', JSON.stringify(config, null, 2));
        
        // Update bot presence if client is available
        const client = require('../index.js').client;
        if (client && client.user) {
            client.user.setPresence({
                status: status,
                activities: [{
                    name: activityText,
                    type: activityType
                }]
            });
        }
        
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update bot status' });
    }
});

const PORT = config.dashboardPort || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dashboard server running on port ${PORT}`);
});

module.exports = app;
