
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "massrole",
  description: "Add or remove roles from multiple users",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['add', 'remove', 'all', 'bots', 'humans'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('👥 Mass Role Commands')
        .addFields(
          { name: 'Add to users', value: '`massrole add @role @user1 @user2...`', inline: false },
          { name: 'Remove from users', value: '`massrole remove @role @user1 @user2...`', inline: false },
          { name: 'Add to all members', value: '`massrole all @role`', inline: false },
          { name: 'Add to all bots', value: '`massrole bots @role`', inline: false },
          { name: 'Add to all humans', value: '`massrole humans @role`', inline: false }
        );
      return message.reply({ embeds: [embed] });
    }

    const role = message.mentions.roles.first();
    if (!role) {
      return message.reply("❌ Please mention a role.");
    }

    if (role.id === message.guild.id) {
      return message.reply("❌ You cannot manage the @everyone role.");
    }

    let targets = [];
    
    if (['all', 'bots', 'humans'].includes(action)) {
      await message.guild.members.fetch();
      
      if (action === 'all') {
        targets = [...message.guild.members.cache.values()];
      } else if (action === 'bots') {
        targets = [...message.guild.members.cache.filter(m => m.user.bot).values()];
      } else if (action === 'humans') {
        targets = [...message.guild.members.cache.filter(m => !m.user.bot).values()];
      }
    } else {
      // Get mentioned users
      targets = message.mentions.members.array();
      
      if (targets.length === 0) {
        return message.reply("❌ Please mention users to add/remove roles from.");
      }
    }

    if (targets.length === 0) {
      return message.reply("❌ No valid targets found.");
    }

    const isAdding = action === 'add' || ['all', 'bots', 'humans'].includes(action);
    const successful = [];
    const failed = [];

    for (const target of targets) {
      try {
        if (isAdding) {
          if (!target.roles.cache.has(role.id)) {
            await target.roles.add(role);
            successful.push(target.user.tag);
          }
        } else {
          if (target.roles.cache.has(role.id)) {
            await target.roles.remove(role);
            successful.push(target.user.tag);
          }
        }
      } catch (error) {
        failed.push(target.user.tag);
      }
    }

    const embed = new EmbedBuilder()
      .setColor(isAdding ? '#00ff00' : '#ff6600')
      .setTitle(`👥 Mass Role ${isAdding ? 'Added' : 'Removed'}`)
      .addFields(
        { name: 'Role', value: role.name, inline: false },
        { name: 'Successful', value: successful.length > 0 ? successful.slice(0, 10).join('\n') + (successful.length > 10 ? `\n...and ${successful.length - 10} more` : '') : 'None', inline: true },
        { name: 'Failed', value: failed.length > 0 ? failed.slice(0, 10).join('\n') + (failed.length > 10 ? `\n...and ${failed.length - 10} more` : '') : 'None', inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
