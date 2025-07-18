
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "edit",
  aliases: ["change", "modify"],
  description: "Edit files in the bot's codebase (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    if (!args[0]) {
      return message.reply("❌ Please provide a file path to edit.\nExample: `edit commands/utility/ping.js`");
    }

    const filePath = args[0];
    const fullPath = path.resolve(filePath);
    
    // Security check - only allow editing files in the project directory
    const projectRoot = process.cwd();
    if (!fullPath.startsWith(projectRoot)) {
      return message.reply("❌ You can only edit files within the project directory.");
    }

    if (!fs.existsSync(filePath)) {
      return message.reply(`❌ File \`${filePath}\` not found.`);
    }

    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const lines = fileContent.split('\n');
      
      // Show file content with line numbers
      const showFileContent = (startLine = 1, endLine = Math.min(lines.length, 50)) => {
        const displayLines = lines.slice(startLine - 1, endLine).map((line, index) => {
          const lineNum = startLine + index;
          return `${lineNum.toString().padStart(3, ' ')}: ${line}`;
        }).join('\n');

        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`📝 Editing: ${filePath}`)
          .setDescription(`\`\`\`javascript\n${displayLines.slice(0, 1900)}\n\`\`\``)
          .addFields(
            { name: 'Lines', value: `${startLine}-${endLine} of ${lines.length}`, inline: true },
            { name: 'Instructions', value: 'Reply with: `<startLine>-<endLine> <newCode>`\nExample: `5-7 console.log("Hello World!");`', inline: false }
          )
          .setFooter({ text: 'Type "cancel" to cancel editing' });

        return embed;
      };

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('view_more')
            .setLabel('View More Lines')
            .setStyle(ButtonStyle.Secondary),
          new ButtonBuilder()
            .setCustomId('cancel_edit')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Danger)
        );

      const initialMessage = await message.reply({
        embeds: [showFileContent()],
        components: [row]
      });

      // Button collector
      const buttonCollector = initialMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 300000 // 5 minutes
      });

      buttonCollector.on('collect', async interaction => {
        if (interaction.customId === 'view_more') {
          await interaction.reply({
            content: "Reply with the line range you want to view (e.g., `51-100`) or continue with editing instructions.",
            ephemeral: true
          });
        } else if (interaction.customId === 'cancel_edit') {
          await interaction.update({
            embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('❌ Edit Cancelled')],
            components: []
          });
          return;
        }
      });

      // Message collector for edit commands
      const messageCollector = message.channel.createMessageCollector({
        filter: m => m.author.id === message.author.id,
        time: 300000 // 5 minutes
      });

      messageCollector.on('collect', async (msg) => {
        if (msg.content.toLowerCase() === 'cancel') {
          await initialMessage.edit({
            embeds: [new EmbedBuilder().setColor('#ff0000').setTitle('❌ Edit Cancelled')],
            components: []
          });
          messageCollector.stop();
          return;
        }

        // Check if it's a view range command (e.g., "51-100")
        const viewRangeMatch = msg.content.match(/^(\d+)-(\d+)$/);
        if (viewRangeMatch) {
          const start = parseInt(viewRangeMatch[1]);
          const end = parseInt(viewRangeMatch[2]);
          
          if (start > 0 && end <= lines.length && start <= end) {
            await initialMessage.edit({
              embeds: [showFileContent(start, end)],
              components: [row]
            });
            await msg.delete().catch(() => {});
            return;
          }
        }

        // Check if it's an edit command (e.g., "5-7 console.log('hello');")
        const editMatch = msg.content.match(/^(\d+)-(\d+)\s+(.+)$/s);
        if (editMatch) {
          const startLine = parseInt(editMatch[1]);
          const endLine = parseInt(editMatch[2]);
          const newCode = editMatch[3];

          if (startLine > 0 && endLine <= lines.length && startLine <= endLine) {
            try {

              // Apply the edit
              const newLines = [...lines];
              const replacementLines = newCode.split('\n');
              newLines.splice(startLine - 1, endLine - startLine + 1, ...replacementLines);
              
              const newContent = newLines.join('\n');
              fs.writeFileSync(filePath, newContent);

              const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ File Edited Successfully')
                .addFields(
                  { name: 'File', value: filePath, inline: true },
                  { name: 'Lines Modified', value: `${startLine}-${endLine}`, inline: true },
                  { name: 'Backup Created', value: backupPath, inline: true }
                )
                .setTimestamp();

              await initialMessage.edit({
                embeds: [successEmbed],
                components: []
              });

              await msg.delete().catch(() => {});
              messageCollector.stop();
            } catch (error) {
              await msg.reply(`❌ Error editing file: ${error.message}`);
            }
          } else {
            await msg.reply("❌ Invalid line range. Please check the line numbers.");
          }
        } else {
          await msg.reply("❌ Invalid format. Use: `<startLine>-<endLine> <newCode>`");
        }
      });

      messageCollector.on('end', () => {
        buttonCollector.stop();
      });

    } catch (error) {
      return message.reply(`❌ Error reading file: ${error.message}`);
    }
  }
};
