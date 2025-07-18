const cooldowns = new Map();

function checkCooldown(userId, commandName, seconds) {
  const key = `${userId}-${commandName}`;
  const now = Date.now();

  if (cooldowns.has(key)) {
    const expires = cooldowns.get(key);
    if (now < expires) {
      return ((expires - now) / 1000).toFixed(1); // Return time left
    }
  }

  cooldowns.set(key, now + seconds * 1000);
  setTimeout(() => cooldowns.delete(key), seconds * 1000);
  return null; // No cooldown
}

module.exports = { checkCooldown };