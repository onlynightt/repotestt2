
const cooldowns = new Map();

function setCooldown(userId, commandName, duration = 3000) {
    if (!cooldowns.has(commandName)) {
        cooldowns.set(commandName, new Map());
    }
    
    const now = Date.now();
    const timestamps = cooldowns.get(commandName);
    timestamps.set(userId, now + duration);
    
    // Clean up expired cooldowns
    setTimeout(() => {
        timestamps.delete(userId);
        if (timestamps.size === 0) {
            cooldowns.delete(commandName);
        }
    }, duration);
}

function getCooldown(userId, commandName) {
    if (!cooldowns.has(commandName)) return null;
    
    const timestamps = cooldowns.get(commandName);
    const userCooldown = timestamps.get(userId);
    
    if (!userCooldown) return null;
    
    const now = Date.now();
    if (now >= userCooldown) {
        timestamps.delete(userId);
        return null;
    }
    
    return userCooldown - now;
}

function isOnCooldown(userId, commandName) {
    return getCooldown(userId, commandName) !== null;
}

function getRemainingCooldown(userId, commandName) {
    const remaining = getCooldown(userId, commandName);
    return remaining ? Math.ceil(remaining / 1000) : 0;
}

module.exports = {
    setCooldown,
    getCooldown,
    isOnCooldown,
    getRemainingCooldown
};
