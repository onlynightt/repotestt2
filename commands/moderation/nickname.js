
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "nickname",
  description: "Changes a user's nickname",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return message.reply("❌ You don't have permission to manage nicknames.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (target.permissions.has(PermissionsBitField.Flags.Administrator) && target.id !== message.author.id) {
      return message.reply("❌ You cannot change nicknames of administrators.");
    }

    const newNickname = args.slice(1).join(' ') || null;

    try {
      const oldNickname = target.nickname || target.user.username;
      await target.setNickname(newNickname);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('📝 Nickname Changed')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Old Nickname', value: oldNickname, inline: true },
          { name: 'New Nickname', value: newNickname || 'None', inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to change nickname. Check my permissions and role hierarchy.");
    }
  }
};
