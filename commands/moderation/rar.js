
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "rar",
  description: "Removes all roles from the specified user",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.id === message.author.id) {
      return message.reply("❌ You cannot remove your own roles.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You cannot remove roles from administrators.");
    }

    const userRoles = target.roles.cache.filter(role => role.id !== message.guild.id);
    
    if (userRoles.size === 0) {
      return message.reply("❌ This user has no roles to remove.");
    }

    try {
      await target.roles.set([]);

      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('🗑️ All Roles Removed')
        .addFields(
          { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true },
          { name: 'Roles Removed', value: `${userRoles.size}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to remove roles. Check my permissions and role hierarchy.");
    }
  }
};
