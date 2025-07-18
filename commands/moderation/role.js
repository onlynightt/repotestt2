
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "role",
  description: "Adds or removes a role from a user",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['add', 'remove'].includes(action)) {
      return message.reply("❌ Please specify 'add' or 'remove'.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[1]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    const role = message.mentions.roles.first() || 
                 message.guild.roles.cache.get(args[2]) ||
                 message.guild.roles.cache.find(r => r.name.toLowerCase() === args.slice(2).join(' ').toLowerCase());

    if (!role) {
      return message.reply("❌ Please mention a role, provide its ID, or name.");
    }

    if (role.id === message.guild.id) {
      return message.reply("❌ You cannot manage the @everyone role.");
    }

    if (role.managed) {
      return message.reply("❌ You cannot manage bot roles or integration roles.");
    }

    try {
      if (action === 'add') {
        if (target.roles.cache.has(role.id)) {
          return message.reply("❌ User already has this role.");
        }
        
        await target.roles.add(role);
        
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Role Added')
          .addFields(
            { name: 'User', value: `${target.user.tag}`, inline: true },
            { name: 'Role', value: `${role.name}`, inline: true },
            { name: 'Moderator', value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      } else {
        if (!target.roles.cache.has(role.id)) {
          return message.reply("❌ User doesn't have this role.");
        }
        
        await target.roles.remove(role);
        
        const embed = new EmbedBuilder()
          .setColor('#ff6600')
          .setTitle('➖ Role Removed')
          .addFields(
            { name: 'User', value: `${target.user.tag}`, inline: true },
            { name: 'Role', value: `${role.name}`, inline: true },
            { name: 'Moderator', value: `${message.author.tag}`, inline: true }
          )
          .setTimestamp();

        message.reply({ embeds: [embed] });
      }
    } catch (error) {
      message.reply("❌ Failed to manage the role. Check my permissions and role hierarchy.");
    }
  }
};
