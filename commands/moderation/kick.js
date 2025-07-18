const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "kick",
  description: "Kick a user from the server",
  category: "moderation",
  usage: "<user> [reason]",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);

    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot kick yourself.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot kick administrators.");
    }

    if (!target.kickable) {
      return message.reply("❌ I cannot kick this user. Check role hierarchy and permissions.");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.send(`⚠️ You have been kicked from **${message.guild.name}** for: ${reason}`);
    } catch (error) {
      console.log('Could not DM user about kick');
    }

    try {
      await target.kick(reason);

        const embed = new EmbedBuilder()
          .setColor('#ff9900')
          .setTitle('👢 User Kicked')
          .addFields(
            { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
            { name: 'By', value: `${message.author.tag}`, inline: true },
            { name: 'Reason', value: reason, inline: false }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });

        // Log the action
        const logAction = require('../../utils/logger');
        await logAction(client, message.guild, {
          action: 'User Kicked',
          target: target.user,
          executor: message.author,
          reason: reason
        });
    } catch (error) {
      message.reply("❌ Failed to kick the user. Check my permissions and role hierarchy.");
    }
  }
};