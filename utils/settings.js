
const fs = require("fs");
const path = require("path");
const { Logger } = require("./logger");

const settingsDir = path.join(__dirname, "../data/settings");

// Ensure settings directory exists
if (!fs.existsSync(settingsDir)) {
    fs.mkdirSync(settingsDir, { recursive: true });
}

const defaultSettings = {
    prefix: "!",
    logChannel: null,
    welcomeChannel: null,
    welcomeMessage: "Welcome to {guild}, {user}!",
    automod: {
        enabled: false,
        filterBadWords: false,
        filterSpam: false,
        maxMentions: 5
    },
    moderation: {
        dmOnWarn: true,
        dmOnKick: true,
        dmOnBan: true
    }
};

function getSettings(guildId) {
    if (!guildId) {
        Logger.warn("Attempted to get settings without guild ID");
        return { ...defaultSettings };
    }

    const file = path.join(settingsDir, `${guildId}.json`);
    
    if (!fs.existsSync(file)) {
        Logger.info(`Creating default settings for guild ${guildId}`);
        saveSettings(guildId, defaultSettings);
        return { ...defaultSettings };
    }

    try {
        const settings = JSON.parse(fs.readFileSync(file, "utf8"));
        // Merge with defaults to ensure all properties exist
        return { ...defaultSettings, ...settings };
    } catch (error) {
        Logger.error(`Failed to read settings for guild ${guildId}`, error);
        return { ...defaultSettings };
    }
}

function saveSettings(guildId, settings) {
    if (!guildId) {
        Logger.warn("Attempted to save settings without guild ID");
        return false;
    }

    const file = path.join(settingsDir, `${guildId}.json`);
    
    try {
        // Validate settings before saving
        const validatedSettings = validateSettings(settings);
        fs.writeFileSync(file, JSON.stringify(validatedSettings, null, 2));
        Logger.info(`Settings saved for guild ${guildId}`);
        return true;
    } catch (error) {
        Logger.error(`Failed to save settings for guild ${guildId}`, error);
        return false;
    }
}

function validateSettings(settings) {
    const validated = { ...defaultSettings };
    
    // Validate prefix
    if (typeof settings.prefix === 'string' && settings.prefix.length <= 5) {
        validated.prefix = settings.prefix;
    }
    
    // Validate channel IDs
    if (typeof settings.logChannel === 'string' || settings.logChannel === null) {
        validated.logChannel = settings.logChannel;
    }
    
    if (typeof settings.welcomeChannel === 'string' || settings.welcomeChannel === null) {
        validated.welcomeChannel = settings.welcomeChannel;
    }
    
    // Validate welcome message
    if (typeof settings.welcomeMessage === 'string' && settings.welcomeMessage.length <= 2000) {
        validated.welcomeMessage = settings.welcomeMessage;
    }
    
    // Validate automod settings
    if (settings.automod && typeof settings.automod === 'object') {
        validated.automod = { ...defaultSettings.automod, ...settings.automod };
    }
    
    // Validate moderation settings
    if (settings.moderation && typeof settings.moderation === 'object') {
        validated.moderation = { ...defaultSettings.moderation, ...settings.moderation };
    }
    
    return validated;
}

module.exports = { getSettings, saveSettings, defaultSettings };
