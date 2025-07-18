
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "rd",
  description: "Deletes a role by name, ID, or mention",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    if (!args[0]) {
      return message.reply("❌ Please specify a role name, ID, or mention.");
    }

    let role = message.mentions.roles.first() || 
               message.guild.roles.cache.get(args[0]) ||
               message.guild.roles.cache.find(r => r.name.toLowerCase() === args.join(' ').toLowerCase());

    if (!role) {
      return message.reply("❌ Role not found.");
    }

    if (role.id === message.guild.id) {
      return message.reply("❌ You cannot delete the @everyone role.");
    }

    if (role.managed) {
      return message.reply("❌ You cannot delete bot roles or integration roles.");
    }

    const roleName = role.name;

    try {
      await role.delete();

      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('🗑️ Role Deleted')
        .addFields(
          { name: 'Role', value: roleName, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to delete the role. Check my permissions and role hierarchy.");
    }
  }
};
