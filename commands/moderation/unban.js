
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "unban",
  description: "Unbans a user by their ID or tag",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return message.reply("❌ You don't have permission to unban members.");
    }

    const userId = args[0];
    if (!userId) {
      return message.reply("❌ Please provide a user ID or tag.");
    }

    try {
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.find(ban => 
        ban.user.id === userId || 
        ban.user.tag === userId || 
        ban.user.username === userId
      );

      if (!bannedUser) {
        return message.reply("❌ User not found in ban list.");
      }

      await message.guild.members.unban(bannedUser.user.id);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Member Unbanned')
        .addFields(
          { name: 'User', value: `${bannedUser.user.tag} (${bannedUser.user.id})`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply("❌ Failed to unban the user. Make sure they are banned and I have proper permissions.");
    }
  }
};
