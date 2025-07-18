
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "massban",
  description: "Bans multiple users at once",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ You don't have permission to ban members.");
    }

    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return message.reply("❌ You need Administrator permission to use mass ban.");
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
          failed.push(`${userId} (cannot ban yourself)`);
          continue;
        }
        
        if (member.permissions.has(PermissionsBitField.Flags.Administrator)) {
          failed.push(`${member.user.tag} (administrator)`);
          continue;
        }
        
        if (!member.bannable) {
          failed.push(`${member.user.tag} (not bannable)`);
          continue;
        }
        
        targets.push(member);
      } else {
        failed.push(`${userId} (not found)`);
      }
    }

    if (targets.length === 0) {
      return message.reply("❌ No valid users found to ban.");
    }

    const reason = 'Mass ban by ' + message.author.tag;
    const banned = [];

    for (const target of targets) {
      try {
        await target.ban({ reason: reason, deleteMessageDays: 1 });
        banned.push(target.user.tag);
      } catch (error) {
        failed.push(`${target.user.tag} (ban failed)`);
      }
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🔨 Mass Ban Complete')
      .addFields(
        { name: 'Banned Users', value: banned.length > 0 ? banned.join('\n') : 'None', inline: false },
        { name: 'Failed', value: failed.length > 0 ? failed.join('\n') : 'None', inline: false },
        { name: 'Moderator', value: `${message.author.tag}`, inline: true }
      )
      .setTimestamp();

    message.reply({ embeds: [embed] });
  }
};
