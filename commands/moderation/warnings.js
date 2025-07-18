
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: "warnings",
  description: "Displays all warnings for a specified user",
  category: "moderation",
  async execute(client, message, args) {
    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    let warnings = {};
    try {
      warnings = JSON.parse(fs.readFileSync('./data/warnings.json', 'utf8'));
    } catch (error) {
      warnings = {};
    }

    const userWarnings = warnings[target.id] || [];

    if (userWarnings.length === 0) {
      return message.reply(`✅ ${target.user.tag} has no warnings.`);
    }

    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle(`⚠️ Warnings for ${target.user.tag}`)
      .setDescription(`Total warnings: ${userWarnings.length}`)
      .setTimestamp();

    userWarnings.forEach((warning, index) => {
      const moderator = client.users.cache.get(warning.moderator);
      const date = new Date(warning.timestamp).toLocaleDateString();
      
      embed.addFields({
        name: `Warning #${index + 1}`,
        value: `**Reason:** ${warning.reason}\n**Moderator:** ${moderator ? moderator.tag : 'Unknown'}\n**Date:** ${date}`,
        inline: false
      });
    });

    message.reply({ embeds: [embed] });
  }
};
