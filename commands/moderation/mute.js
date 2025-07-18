const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "mute",
  description: "Mute a user",
  category: "moderation",
  usage: "<user> [duration] [reason]",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return message.reply("❌ You don't have permission to mute members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);

    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot mute yourself.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot mute administrators.");
    }

    let muteRole = message.guild.roles.cache.find(role => role.name === 'Muted');

    if (!muteRole) {
      return message.reply("❌ Muted role not found. Please create a 'Muted' role first.");
    }

    if (target.roles.cache.has(muteRole.id)) {
      return message.reply("❌ This user is already muted.");
    }

    const reason = args.slice(1).join(' ') || 'No reason provided';

    try {
      await target.roles.add(muteRole, reason);

      const embed = new EmbedBuilder()
        .setColor('#666666')
        .setTitle('🔇 Member Muted')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true },
          { name: 'Reason', value: reason, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to mute the user. Check my permissions and role hierarchy.");
    }
  }
};