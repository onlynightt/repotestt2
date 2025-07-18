
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "masskick",
  description: "Kicks multiple users at once",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return message.reply("❌ You don't have permission to kick members.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission to use mass kick.");
    }

    if (args.length === 0) {
      return message.reply("❌ Please provide user IDs or mentions separated by spaces.");
    }

    const targets = [];
    const failed = [];
    
    for (const arg of args) {
      const userId = arg.replace(/[<@!>]/g, '');
      const member = message.guild.members.cache.get(userId);
      
      if (member) {
        if (member.id === message.author.id) {
          failed.push(`${userId} (cannot kick yourself)`);
          continue;
        }
        
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          failed.push(`${member.user.tag} (administrator)`);
          continue;
        }
        
        if (!member.kickable) {
          failed.push(`${member.user.tag} (not kickable)`);
          continue;
        }
        
        targets.push(member);
      } else {
        failed.push(`${userId} (not found)`);
      }
    }

    if (targets.length === 0) {
      return message.reply("❌ No valid users found to kick.");
    }

    const reason = 'Mass kick by ' + message.author.tag;
    const kicked = [];

    for (const target of targets) {
      try {
        await target.kick(reason);
        kicked.push(target.user.tag);
      } catch (error) {
        failed.push(`${target.user.tag} (kick failed)`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#ff6600')
      .setTitle('👢 Mass Kick Complete')
      .addFields(
        { name: 'Kicked Users', value: kicked.length > 0 ? kicked.join('\n') : 'None', inline: false },
        { name: 'Failed', value: failed.length > 0 ? failed.join('\n') : 'None', inline: false },
        { name: 'Moderator', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
