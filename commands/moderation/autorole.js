
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const autoRolesPath = './data/autoroles.json';
if (!fs.existsSync(autoRolesPath)) {
  fs.writeFileSync(autoRolesPath, JSON.stringify({}));
}

module.exports = {
  name: "autorole",
  description: "Configure automatic role assignment for new members",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return message.reply("❌ You don't have permission to manage roles.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['add', 'remove', 'list', 'clear'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Auto Role Commands')
        .addFields(
          { name: 'Add Role', value: '`autorole add @role`', inline: false },
          { name: 'Remove Role', value: '`autorole remove @role`', inline: false },
          { name: 'List Roles', value: '`autorole list`', inline: false },
          { name: 'Clear All', value: '`autorole clear`', inline: false }
        );
      return message.reply({ embeds: [embed] });
    }

    const autoRoles = JSON.parse(fs.readFileSync(autoRolesPath));
    const guildId = message.guild.id;

    if (!autoRoles[guildId]) {
      autoRoles[guildId] = [];
    }

    if (action === 'list') {
      if (autoRoles[guildId].length === 0) {
        return message.reply("❌ No auto roles configured for this server.");
      }

      const roles = autoRoles[guildId]
        .map(roleId => message.guild.roles.cache.get(roleId))
        .filter(role => role)
        .map(role => role.name);

      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('🤖 Auto Roles')
        .setDescription(roles.join('\n') || 'None');
      
      return message.reply({ embeds: [embed] });
    }

    if (action === 'clear') {
      autoRoles[guildId] = [];
      fs.writeFileSync(autoRolesPath, JSON.stringify(autoRoles, null, 2));
      return message.reply("✅ All auto roles cleared.");
    }

    const role = message.mentions.roles.first() || 
                 message.guild.roles.cache.get(args[1]);

    if (!role) {
      return message.reply("❌ Please mention a role or provide its ID.");
    }

    if (action === 'add') {
      if (autoRoles[guildId].includes(role.id)) {
        return message.reply("❌ This role is already in the auto role list.");
      }

      autoRoles[guildId].push(role.id);
      fs.writeFileSync(autoRolesPath, JSON.stringify(autoRoles, null, 2));
      return message.reply(`✅ Added ${role.name} to auto roles.`);
    }

    if (action === 'remove') {
      const index = autoRoles[guildId].indexOf(role.id);
      if (index === -1) {
        return message.reply("❌ This role is not in the auto role list.");
      }

      autoRoles[guildId].splice(index, 1);
      fs.writeFileSync(autoRolesPath, JSON.stringify(autoRoles, null, 2));
      return message.reply(`✅ Removed ${role.name} from auto roles.`);
    }
  }
};
