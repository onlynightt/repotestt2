
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const automodPath = './data/automod.json';
if (!fs.existsSync(automodPath)) {
  fs.writeFileSync(automodPath, JSON.stringify({}));
}

module.exports = {
  name: "automod",
  description: "Configure auto-moderation settings",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ You need Manage Server permission to configure auto-moderation.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['enable', 'disable', 'config', 'status'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🛡️ Auto-Moderation Commands')
        .addFields(
          { name: 'Enable/Disable', value: '`automod enable/disable [spam|caps|links|words]`', inline: false },
          { name: 'Configure', value: '`automod config [setting] [value]`', inline: false },
          { name: 'Status', value: '`automod status`', inline: false }
        );
      return message.reply({ embeds: [embed] });
    }

    const automodData = JSON.parse(fs.readFileSync(automodPath));
    const guildId = message.guild.id;

    if (!automodData[guildId]) {
      automodData[guildId] = {
        spam: { enabled: false, limit: 5, timeframe: 5000 },
        caps: { enabled: false, threshold: 70 },
        links: { enabled: false },
        words: { enabled: false, list: [] }
      };
    }

    if (action === 'status') {
      const config = automodData[guildId];
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🛡️ Auto-Moderation Status')
        .addFields(
          { name: 'Spam Protection', value: config.spam.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Caps Filter', value: config.caps.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Link Filter', value: config.links.enabled ? '✅ Enabled' : '❌ Disabled', inline: true },
          { name: 'Word Filter', value: config.words.enabled ? '✅ Enabled' : '❌ Disabled', inline: true }
        );
      return message.reply({ embeds: [embed] });
    }

    if (action === 'enable' || action === 'disable') {
      const type = args[1]?.toLowerCase();
      if (!type || !['spam', 'caps', 'links', 'words'].includes(type)) {
        return message.reply("❌ Please specify: spam, caps, links, or words");
      }

      automodData[guildId][type].enabled = action === 'enable';
      fs.writeFileSync(automodPath, JSON.stringify(automodData, null, 2));
      
      return message.reply(`✅ ${type} filter has been ${action}d.`);
    }

    if (action === 'config') {
      const setting = args[1]?.toLowerCase();
      const value = args[2];

      if (setting === 'addword' && value) {
        automodData[guildId].words.list.push(value.toLowerCase());
        fs.writeFileSync(automodPath, JSON.stringify(automodData, null, 2));
        return message.reply(`✅ Added "${value}" to word filter.`);
      }

      if (setting === 'removeword' && value) {
        const index = automodData[guildId].words.list.indexOf(value.toLowerCase());
        if (index > -1) {
          automodData[guildId].words.list.splice(index, 1);
          fs.writeFileSync(automodPath, JSON.stringify(automodData, null, 2));
          return message.reply(`✅ Removed "${value}" from word filter.`);
        }
        return message.reply("❌ Word not found in filter list.");
      }
    }
  }
};
