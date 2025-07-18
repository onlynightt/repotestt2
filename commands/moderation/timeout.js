
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "timeout",
  description: "Puts a user in timeout for a specific duration",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don't have permission to timeout members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot timeout yourself.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot timeout administrators.");
    }

    const duration = args[1];
    if (!duration) {
      return message.reply("❌ Please specify a duration (e.g., 10m, 1h, 1d).");
    }

    const timeRegex = /^(\d+)([smhd])$/;
    const match = duration.match(timeRegex);
    
    if (!match) {
      return message.reply("❌ Invalid duration format. Use: s (seconds), m (minutes), h (hours), d (days).");
    }

    const amount = parseInt(match[1]);
    const unit = match[2];
    
    let milliseconds;
    switch (unit) {
      case 's': milliseconds = amount * 1000; break;
      case 'm': milliseconds = amount * 60 * 1000; break;
      case 'h': milliseconds = amount * 60 * 60 * 1000; break;
      case 'd': milliseconds = amount * 24 * 60 * 60 * 1000; break;
    }

    if (milliseconds > 28 * 24 * 60 * 60 * 1000) {
      return message.reply("❌ Timeout duration cannot exceed 28 days.");
    }

    const reason = args.slice(2).join(' ') || 'No reason provided';

    try {
      await target.timeout(milliseconds, reason);

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔇 Member Timed Out')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true },
          { name: 'Duration', value: duration, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to timeout the user. Check my permissions and role hierarchy.");
    }
  }
};
