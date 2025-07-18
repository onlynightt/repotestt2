
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const util = require('util');

module.exports = {
  name: "eval",
  description: "Execute Node.js code (Owner only)",
  category: "owner",
  aliases: ["e", "evaluate"],
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    const code = args.join(' ');
    if (!code) {
      return message.reply("❌ Please provide code to evaluate.");
    }

    try {
      let evaled = eval(code);
      
      if (typeof evaled !== 'string') {
        evaled = util.inspect(evaled, { depth: 0, maxArrayLength: null });
      }

      if (evaled.length > 1950) {
        const output = evaled.substring(0, 1950) + '...';
        const embed = new EmbedBuilder()
          .setColor('#00ff00')
          .setTitle('✅ Evaluation Result (Truncated)')
          .addFields(
            { name: 'Input', value: `\`\`\`js\n${code.substring(0, 1000)}\n\`\`\``, inline: false },
            { name: 'Output', value: `\`\`\`js\n${output}\n\`\`\``, inline: false }
          )
          .setTimestamp();
        return message.reply({ embeds: [embed] });
      }

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Evaluation Result')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\``, inline: false },
          { name: 'Output', value: `\`\`\`js\n${evaled}\n\`\`\``, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setTitle('❌ Evaluation Error')
        .addFields(
          { name: 'Input', value: `\`\`\`js\n${code}\n\`\`\``, inline: false },
          { name: 'Error', value: `\`\`\`js\n${error.message}\n\`\`\``, inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    }
  }
};
