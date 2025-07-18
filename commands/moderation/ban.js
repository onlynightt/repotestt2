const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "ban",
  description: "Ban a user from the server",
  category: "moderation",
  usage: "<user> [reason]",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);

    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot ban yourself.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot ban administrators.");
    }

    if (!target.bannable) {
      return message.reply("❌ I cannot ban this user. Check role hierarchy and permissions.");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.send(`⛔ You have been banned from **${message.guild.name}** for: ${reason}`);
    } catch (error) {
      console.log('Could not DM user about ban');
    }

    try {
      await target.ban({ reason: reason, deleteMessageDays: 7 });

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🔨 Member Banned')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });

        // Log the action
        const logAction = require('../../utils/logger');
        await logAction(client, message.guild, {
          action: 'User Banned',
          target: target.user,
          executor: message.author,
          reason: reason
        });
    } catch (error) {
      message.reply("❌ Failed to ban the user. Check my permissions and role hierarchy.");
    }
  }
};