
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { getSettings, saveSettings } = require('../../utils/settings');

module.exports = {
  name: "settings",
  description: "Configure server settings like log channel and prefix",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ You need Manage Server permission to configure settings.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['set', 'view', 'reset'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⚙️ Server Settings')
        .addFields(
          { name: 'View Settings', value: '`settings view`', inline: false },
          { name: 'Set Log Channel', value: '`settings set logchannel #channel`', inline: false },
          { name: 'Set Prefix', value: '`settings set prefix !`', inline: false },
          { name: 'Reset Settings', value: '`settings reset`', inline: false }
        )
        .setFooter({ text: 'Configure your server settings' });
      return message.reply({ embeds: [embed] });
    }

    const currentSettings = getSettings(message.guild.id);

    if (action === 'view') {
      const logChannel = currentSettings.logChannel ? 
        message.guild.channels.cache.get(currentSettings.logChannel) : null;
      
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('⚙️ Current Server Settings')
        .addFields(
          { name: 'Prefix', value: `\`${currentSettings.prefix}\``, inline: true },
          { name: 'Log Channel', value: logChannel ? `${logChannel}` : 'Not set', inline: true }
        )
        .setTimestamp();
      
      return message.reply({ embeds: [embed] });
    }

    if (action === 'set') {
      const setting = args[1]?.toLowerCase();
      const value = args.slice(2).join(' ');

      if (!setting || !['logchannel', 'prefix'].includes(setting)) {
        return message.reply("❌ Please specify: `logchannel` or `prefix`");
      }

      if (!value) {
        return message.reply("❌ Please provide a value for the setting.");
      }

      if (setting === 'logchannel') {
        const channel = message.mentions.channels.first() || 
                       message.guild.channels.cache.get(value);
        
        if (!channel) {
          return message.reply("❌ Please mention a valid channel or provide a channel ID.");
        }

        if (!channel.isTextBased()) {
          return message.reply("❌ Log channel must be a text channel.");
        }

        currentSettings.logChannel = channel.id;
        saveSettings(message.guild.id, currentSettings);
        
        return message.reply(`✅ Log channel set to ${channel}`);
      }

      if (setting === 'prefix') {
        if (value.length > 3) {
          return message.reply("❌ Prefix must be 3 characters or less.");
        }

        currentSettings.prefix = value;
        saveSettings(message.guild.id, currentSettings);
        
        return message.reply(`✅ Prefix set to \`${value}\``);
      }
    }

    if (action === 'reset') {
      const defaultSettings = { prefix: "!", logChannel: null };
      saveSettings(message.guild.id, defaultSettings);
      
      return message.reply("✅ Settings have been reset to default values.");
    }
  }
};
