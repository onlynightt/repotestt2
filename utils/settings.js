const fs = require("fs");
const path = require("path");

function getSettings(guildId) {
  const file = path.join(__dirname, `../data/settings/${guildId}.json`);
  if (!fs.existsSync(file)) {
    return { prefix: "!", logChannel: null };
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function saveSettings(guildId, settings) {
  const file = path.join(__dirname, `../data/settings/${guildId}.json`);
  fs.writeFileSync(file, JSON.stringify(settings, null, 2));
}

module.exports = { getSettings, saveSettings };