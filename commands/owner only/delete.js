
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "delete",
  aliases: ["del", "remove", "rm"],
  description: "Delete a file or directory (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    if (!args[0]) {
      return message.reply("❌ Please provide a file or directory path to delete.\nExample: `delete test.js` or `delete folder/`");
    }

    const targetPath = args[0];
    
    // Security check - only allow deleting files in the project directory
    const fullPath = path.resolve(targetPath);
    const projectRoot = process.cwd();
    if (!fullPath.startsWith(projectRoot)) {
      return message.reply("❌ You can only delete files within the project directory.");
    }

    // Check if file/directory exists
    if (!fs.existsSync(targetPath)) {
      return message.reply(`❌ File or directory \`${targetPath}\` not found.`);
    }

    // Prevent deletion of critical files
    const criticalFiles = ['index.js', 'package.json', 'config.json', '.replit'];
    const fileName = path.basename(targetPath);
    if (criticalFiles.includes(fileName)) {
      return message.reply(`❌ Cannot delete critical file \`${fileName}\`.`);
    }

    try {
      const stats = fs.statSync(targetPath);
      const isDirectory = stats.isDirectory();
      
      // Show confirmation dialog
      const embed = new EmbedBuilder()
        .setColor('#ff9900')
        .setTitle('⚠️ Confirm Deletion')
        .setDescription(`Are you sure you want to delete this ${isDirectory ? 'directory' : 'file'}?`)
        .addFields(
          { name: 'Path', value: `\`${targetPath}\``, inline: true },
          { name: 'Type', value: isDirectory ? 'Directory' : 'File', inline: true }
        );

      if (isDirectory) {
        const files = fs.readdirSync(targetPath);
        embed.addFields({ name: 'Contains', value: `${files.length} items`, inline: true });
      } else {
        embed.addFields({ name: 'Size', value: `${stats.size} bytes`, inline: true });
      }

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('confirm_delete')
            .setLabel('Delete')
            .setStyle(ButtonStyle.Danger),
          new ButtonBuilder()
            .setCustomId('cancel_delete')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
        );

      const confirmMessage = await message.reply({
        embeds: [embed],
        components: [row]
      });

      const collector = confirmMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 30000
      });

      collector.on('collect', async interaction => {
        if (interaction.customId === 'confirm_delete') {
          try {
            if (isDirectory) {
              fs.rmSync(targetPath, { recursive: true, force: true });
            } else {
              fs.unlinkSync(targetPath);
            }

            const successEmbed = new EmbedBuilder()
              .setColor('#00ff00')
              .setTitle('✅ Deletion Successful')
              .setDescription(`${isDirectory ? 'Directory' : 'File'} \`${targetPath}\` has been deleted.`)
              .setTimestamp();

            await interaction.update({
              embeds: [successEmbed],
              components: []
            });
          } catch (error) {
            await interaction.update({
              embeds: [new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('❌ Deletion Failed')
                .setDescription(`Error: ${error.message}`)],
              components: []
            });
          }
        } else if (interaction.customId === 'cancel_delete') {
          await interaction.update({
            embeds: [new EmbedBuilder()
              .setColor('#999999')
              .setTitle('❌ Deletion Cancelled')
              .setDescription('The file/directory was not deleted.')],
            components: []
          });
        }
      });

      collector.on('end', () => {
        if (!collector.ended) {
          confirmMessage.edit({
            embeds: [new EmbedBuilder()
              .setColor('#999999')
              .setTitle('⏰ Confirmation Timeout')
              .setDescription('Deletion cancelled due to timeout.')],
            components: []
          });
        }
      });

    } catch (error) {
      return message.reply(`❌ Error accessing file: ${error.message}`);
    }
  }
};
