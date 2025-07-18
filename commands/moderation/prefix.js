
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../../data/config.json');

module.exports = {
  name: "prefix",
  description: "Change the bot's prefix for this server",
  category: "moderation",
  aliases: ["setprefix"],
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ You need Manage Server permission to change the prefix.");
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Invalid Usage')
        .setDescription(`Usage: \`${client.config.prefix}prefix <new_prefix>\``)
        .addFields({ name: 'Current Prefix', value: `\`${client.config.prefix}\``, inline: true });
      return message.reply({ embeds: [embed] });
    }

    if (newPrefix.length > 5) {
      return message.reply("❌ Prefix cannot be longer than 5 characters.");
    }

    try {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      config.prefix = newPrefix;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
      client.config.prefix = newPrefix;

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Prefix Updated')
        .setDescription(`Bot prefix has been changed to: \`${newPrefix}\``)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error updating prefix:', error);
      message.reply("❌ An error occurred while updating the prefix.");
    }
  }
};
