
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
  name: "warn",
  description: "Warns a member and logs reason, author, and time",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don't have permission to warn members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot warn yourself.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot warn administrators.");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    let warnings = {};
    try {
      warnings = JSON.parse(fs.readFileSync('./data/warnings.json', 'utf8'));
    } catch (error) {
      warnings = {};
    }

    if (!warnings[target.id]) {
      warnings[target.id] = [];
    }

    const warning = {
      id: warnings[target.id].length + 1,
      reason: reason,
      moderator: message.author.id,
      timestamp: new Date().toISOString(),
      guildId: message.guild.id
    };

    warnings[target.id].push(warning);

    fs.writeFileSync('./data/warnings.json', JSON.stringify(warnings, null, 2));

    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('⚠️ Member Warned')
      .addFields(
        { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
        { name: 'Moderator', value: `${message.author.tag}`, inline: true },
        { name: 'Reason', value: reason, inline: false },
        { name: 'Total Warnings', value: `${warnings[target.id].length}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });

    try {
      await target.send(`⚠️ You have been warned in **${message.guild.name}** for: ${reason}`);
    } catch (error) {
      console.log('Could not DM user about warning');
    }
  }
};
