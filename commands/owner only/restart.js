
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: "restart",
  description: "Restart the bot (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    const embed = new EmbedBuilder()
      .setColor('#ff9900')
      .setTitle('🔄 Restarting Bot')
      .setDescription('Bot is restarting... Please wait.')
      .setTimestamp();

    await message.reply({ embeds: [embed] });

    console.log(`Bot restart initiated by ${message.author.tag}`);
    
    setTimeout(() => {
      process.exit(1); // Exit with code 1 to trigger auto-restart
    }, 2000);
  }
};
