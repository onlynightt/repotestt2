
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const giveawayPath = path.join(__dirname, '../../data/giveaway.json');

module.exports = {
  name: "gemoji",
  description: "Set the giveaway emoji for this server",
  category: "giveaway",
  aliases: ["giveawayemoji", "setemoji"],
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return message.reply("❌ You need Manage Server permission to configure giveaway settings.");
    }

    const emoji = args[0];
    if (!emoji) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Invalid Usage')
        .setDescription(`Usage: \`${client.config.prefix}gemoji <emoji>\``)
        .addFields({ name: 'Example', value: `\`${client.config.prefix}gemoji 🎉\``, inline: false });
      return message.reply({ embeds: [embed] });
    }

    // Ensure giveaway data file exists
    if (!fs.existsSync(giveawayPath)) {
      fs.writeFileSync(giveawayPath, JSON.stringify({}));
    }

    try {
      const giveawayData = JSON.parse(fs.readFileSync(giveawayPath, 'utf8'));
      const guildId = message.guild.id;

      if (!giveawayData[guildId]) {
        giveawayData[guildId] = {};
      }

      giveawayData[guildId].emoji = emoji;
      fs.writeFileSync(giveawayPath, JSON.stringify(giveawayData, null, 2));

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Giveaway Emoji Updated')
        .setDescription(`The giveaway emoji for this server has been set to ${emoji}`)
        .setTimestamp();

      message.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Error setting giveaway emoji:', error);
      message.reply('❌ An error occurred while setting the giveaway emoji.');
    }
  }
};
