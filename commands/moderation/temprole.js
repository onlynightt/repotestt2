
const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const fs = require('fs');

const tempRolesPath = './data/temproles.json';
if (!fs.existsSync(tempRolesPath)) {
  fs.writeFileSync(tempRolesPath, JSON.stringify({}));
}

module.exports = {
  name: "temprole",
  description: "Give a user a role for a specific duration",
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

    const role = message.mentions.roles.first() || 
                 message.guild.roles.cache.get(args[1]) ||
                 message.guild.roles.cache.find(r => r.name.toLowerCase() === args[1]?.toLowerCase());

    if (!role) {
      return message.reply("❌ Please mention a role, provide its ID, or name.");
    }

    const duration = args[2];
    if (!duration) {
      return message.reply("❌ Please provide duration (e.g., 10m, 1h, 2d).");
    }

    const timeMatch = duration.match(/^(\d+)([mhd])$/);
    if (!timeMatch) {
      return message.reply("❌ Invalid duration format. Use: 10m, 1h, 2d");
    }

    const [, amount, unit] = timeMatch;
    const multipliers = { m: 60000, h: 3600000, d: 86400000 };
    const milliseconds = parseInt(amount) * multipliers[unit];

    if (milliseconds < 60000 || milliseconds > 7 * 86400000) {
      return message.reply("❌ Duration must be between 1 minute and 7 days.");
    }

    try {
      await target.roles.add(role);
      
      const tempRoles = JSON.parse(fs.readFileSync(tempRolesPath));
      const key = `${target.id}-${role.id}`;
      
      tempRoles[key] = {
        userId: target.id,
        roleId: role.id,
        guildId: message.guild.id,
        expiresAt: Date.now() + milliseconds,
        assignedBy: message.author.id
      };

      fs.writeFileSync(tempRolesPath, JSON.stringify(tempRoles, null, 2));

      setTimeout(async () => {
        try {
          const member = await message.guild.members.fetch(target.id);
          if (member && member.roles.cache.has(role.id)) {
            await member.roles.remove(role);
          }
          
          const updatedTempRoles = JSON.parse(fs.readFileSync(tempRolesPath));
          delete updatedTempRoles[key];
          fs.writeFileSync(tempRolesPath, JSON.stringify(updatedTempRoles, null, 2));
        } catch (error) {
          console.error('Error removing temporary role:', error);
        }
      }, milliseconds);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('⏱️ Temporary Role Assigned')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Role', value: `${role.name}`, inline: true },
          { name: 'Duration', value: `${amount}${unit}`, inline: true },
          { name: 'Expires', value: `<t:${Math.floor((Date.now() + milliseconds) / 1000)}:R>`, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to assign temporary role. Check my permissions and role hierarchy.");
    }
  }
};
