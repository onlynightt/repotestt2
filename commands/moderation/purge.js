
const { PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  name: "purge",
  aliases: ["clear"],
  description: "Deletes messages in bulk",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return message.reply("❌ You don't have permission to manage messages.");
    }

    const amount = parseInt(args[0]);

    if (!amount || amount < 1 || amount > 100) {
      return message.reply("❌ Please specify a number between 1 and 100.");
    }

    try {
      const messages = await message.channel.bulkDelete(amount + 1, true);
      
      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('🧹 Messages Deleted')
        .addFields(
          { name: 'Amount', value: `${messages.size - 1}`, inline: true },
          { name: 'Moderator', value: `${message.author.tag}`, inline: true }
        )
        .setTimestamp();

      const reply = await message.channel.send({ embeds: [embed] });
      
      setTimeout(() => {
        reply.delete().catch(() => {});
      }, 5000);
    } catch (error) {
      message.reply("❌ Failed to delete messages. Messages might be older than 14 days.");
    }
  }
};
