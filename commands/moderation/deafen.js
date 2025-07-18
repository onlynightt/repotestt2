
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "deafen",
  description: "Server-deafens a user in a voice channel",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.DeafenMembers)) {
      return message.reply("❌ You don't have permission to deafen members.");
    }

    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]);
    
    if (!target) {
      return message.reply("❌ Please mention a user or provide their ID.");
    }

    if (!target.voice.channel) {
      return message.reply("❌ The user is not in a voice channel.");
    }

    if (target.voice.serverDeaf) {
      return message.reply("❌ This user is already deafened.");
    }

    try {
      await target.voice.setDeaf(true);

      const embed = new EmbedBuilder()
        .setColor('#ff6600')
        .setTitle('🔇 Member Deafened')
        .addFields(
          { name: 'User', value: `${target.user.tag}`, inline: true },
          { name: 'Voice Channel', value: `${target.voice.channel.name}`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to deafen the user. Check my permissions and role hierarchy.");
    }
  }
};
