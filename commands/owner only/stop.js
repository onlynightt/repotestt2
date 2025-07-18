
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "stop",
  description: "Stop the bot completely (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    const embed = new EmbedBuilder()
      .setColor('#ff0000')
      .setTitle('🛑 Stopping Bot')
      .setDescription('Bot is shutting down completely...')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    console.log(`Bot shutdown initiated by ${message.author.tag}`);
    
    setTimeout(() => {
      process.exit(0); // Exit with code 0 for clean shutdown
    }, 2000);
  }
};
