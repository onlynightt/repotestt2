
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "create",
  aliases: ["touch", "new"],
  description: "Create a new file with content (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    if (!args[0]) {
      return message.reply("❌ Please provide a file path to create.\nExample: `create test.js console.log('Hello World');`");
    }

    const filePath = args[0];
    const content = args.slice(1).join(' ') || '';
    
    // Security check - only allow creating files in the project directory
    const fullPath = path.resolve(filePath);
    const projectRoot = process.cwd();
    if (!fullPath.startsWith(projectRoot)) {
      return message.reply("❌ You can only create files within the project directory.");
    }

    // Check if file already exists
    if (fs.existsSync(filePath)) {
      return message.reply(`❌ File \`${filePath}\` already exists. Use the edit command to modify it.`);
    }

    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Create the file
      fs.writeFileSync(filePath, content);

      const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ File Created Successfully')
        .addFields(
          { name: 'File Path', value: `\`${filePath}\``, inline: true },
          { name: 'Size', value: `${content.length} characters`, inline: true },
          { name: 'Content Preview', value: content.length > 0 ? `\`\`\`\n${content.substring(0, 500)}${content.length > 500 ? '...' : ''}\n\`\`\`` : 'Empty file', inline: false }
        )
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      return message.reply(`❌ Error creating file: ${error.message}`);
    }
  }
};
