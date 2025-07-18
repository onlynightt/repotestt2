
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "list-folders",
  aliases: ["ls", "dir", "folders"],
  description: "List folders and files in a directory with file viewing (Owner only)",
  category: "owner",
  async execute(client, message, args) {
    if (message.author.id !== client.config.ownerId) {
      return message.reply("❌ This command is restricted to the bot owner only.");
    }

    let targetPath = args[0] || '.';
    
    // Security check - only allow listing files in the project directory
    const fullPath = path.resolve(targetPath);
    const projectRoot = process.cwd();
    if (!fullPath.startsWith(projectRoot)) {
      return message.reply("❌ You can only list files within the project directory.");
    }

    // Check if directory exists
    if (!fs.existsSync(targetPath)) {
      return message.reply(`❌ Directory \`${targetPath}\` not found.`);
    }

    try {
      const stats = fs.statSync(targetPath);
      if (!stats.isDirectory()) {
        return message.reply(`❌ \`${targetPath}\` is not a directory.`);
      }

      let items = fs.readdirSync(targetPath, { withFileTypes: true });
      let folders = items.filter(item => item.isDirectory()).sort();
      let files = items.filter(item => item.isFile()).sort();
      let currentMode = 'list'; // 'list' or 'viewing'
      let currentFile = null;

      const createListEmbed = (showFiles = false) => {
        const embed = new EmbedBuilder()
          .setColor('#0099ff')
          .setTitle(`📁 Directory Listing: ${targetPath === '.' ? 'Root' : targetPath}`)
          .setTimestamp();

        if (folders.length > 0) {
          const folderList = folders.map(folder => `📁 ${folder.name}/`).slice(0, 20).join('\n');
          embed.addFields({
            name: `Folders (${folders.length})`,
            value: folders.length > 20 ? folderList + '\n... and more' : folderList,
            inline: false
          });
        }

        if (showFiles && files.length > 0) {
          const fileList = files.map(file => {
            const filePath = path.join(targetPath, file.name);
            const fileStats = fs.statSync(filePath);
            const size = fileStats.size < 1024 ? `${fileStats.size}B` : `${Math.round(fileStats.size / 1024)}KB`;
            return `📄 ${file.name} (${size})`;
          }).slice(0, 15).join('\n');
          
          embed.addFields({
            name: `Files (${files.length})`,
            value: files.length > 15 ? fileList + '\n... and more' : fileList,
            inline: false
          });
        } else if (!showFiles && files.length > 0) {
          embed.addFields({
            name: `Files (${files.length})`,
            value: 'Click "Show Files" to view files',
            inline: false
          });
        }

        if (folders.length === 0 && files.length === 0) {
          embed.setDescription('This directory is empty.');
        }

        return embed;
      };

      const createFileViewEmbed = (filePath, startLine = 1, linesPerPage = 30) => {
        try {
          const content = fs.readFileSync(filePath, 'utf8');
          const lines = content.split('\n');
          const totalLines = lines.length;
          const endLine = Math.min(startLine + linesPerPage - 1, totalLines);
          
          const displayLines = lines.slice(startLine - 1, endLine).map((line, index) => {
            const lineNum = startLine + index;
            return `${lineNum.toString().padStart(3, ' ')} | ${line}`;
          }).join('\n');

          const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`📄 File Content: ${path.basename(filePath)}`)
            .setDescription(`\`\`\`\n${displayLines.slice(0, 1900)}\n\`\`\``)
            .addFields(
              { name: 'Lines', value: `${startLine}-${endLine} of ${totalLines}`, inline: true },
              { name: 'Size', value: `${content.length} bytes`, inline: true },
              { name: 'Path', value: filePath, inline: false }
            )
            .setTimestamp();

          return { embed, totalLines, currentStart: startLine, currentEnd: endLine };
        } catch (error) {
          return {
            embed: new EmbedBuilder()
              .setColor('#ff0000')
              .setTitle('❌ Error Reading File')
              .setDescription(`Could not read file: ${error.message}`),
            totalLines: 0,
            currentStart: 1,
            currentEnd: 1
          };
        }
      };

      const createButtons = (mode = 'list', showFiles = false, fileViewData = null) => {
        if (mode === 'list') {
          return new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('toggle_files')
                .setLabel(showFiles ? 'Hide Files' : 'Show Files')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(files.length === 0),
              new ButtonBuilder()
                .setCustomId('select_folder')
                .setLabel('Select Folder')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(folders.length === 0),
              new ButtonBuilder()
                .setCustomId('select_file')
                .setLabel('Select File')
                .setStyle(ButtonStyle.Success)
                .setDisabled(files.length === 0 || !showFiles),
              new ButtonBuilder()
                .setCustomId('go_parent')
                .setLabel('Parent Directory')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(targetPath === '.' || targetPath === '/'),
              new ButtonBuilder()
                .setCustomId('refresh')
                .setLabel('Refresh')
                .setStyle(ButtonStyle.Success)
            );
        } else if (mode === 'viewing') {
          const buttons = [
            new ButtonBuilder()
              .setCustomId('back_to_list')
              .setLabel('Back to List')
              .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
              .setCustomId('file_prev_page')
              .setLabel('Previous Page')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(!fileViewData || fileViewData.currentStart <= 1),
            new ButtonBuilder()
              .setCustomId('file_next_page')
              .setLabel('Next Page')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(!fileViewData || fileViewData.currentEnd >= fileViewData.totalLines)
          ];

          return new ActionRowBuilder().addComponents(buttons);
        }
      };

      const createSelectMenu = (type, items, timestamp = Date.now()) => {
        const options = items.slice(0, 25).map((item, index) => ({
          label: item.name,
          value: `${type}_${index}`,
          description: type === 'folder' ? 'Navigate to folder' : 'View file content',
          emoji: type === 'folder' ? '📁' : '📄'
        }));

        return new ActionRowBuilder()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId(`select_${type}_${timestamp}`)
              .setPlaceholder(`Choose a ${type}...`)
              .addOptions(options)
          );
      };

      let showFiles = false;
      let fileViewData = null;
      
      const listMessage = await message.reply({
        embeds: [createListEmbed(showFiles)],
        components: [createButtons('list', showFiles)]
      });

      const collector = listMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 600000 // 10 minutes
      });

      collector.on('collect', async interaction => {
        try {
          if (interaction.customId === 'toggle_files') {
            showFiles = !showFiles;
            currentMode = 'list';
            await interaction.update({
              embeds: [createListEmbed(showFiles)],
              components: [createButtons('list', showFiles)]
            });
          } 
          else if (interaction.customId === 'select_folder') {
            if (folders.length > 0) {
              const timestamp = Date.now();
              await interaction.update({
                embeds: [createListEmbed(showFiles)],
                components: [createButtons('list', showFiles), createSelectMenu('folder', folders, timestamp)]
              });
            }
          }
          else if (interaction.customId === 'select_file') {
            if (files.length > 0 && showFiles) {
              const timestamp = Date.now();
              await interaction.update({
                embeds: [createListEmbed(showFiles)],
                components: [createButtons('list', showFiles), createSelectMenu('file', files, timestamp)]
              });
            }
          }
          else if (interaction.customId.startsWith('select_folder_')) {
            const index = parseInt(interaction.values[0].split('_')[1]);
            const selectedFolder = folders[index];
            const newPath = path.join(targetPath, selectedFolder.name);
            
            targetPath = path.relative(projectRoot, path.resolve(newPath)) || '.';
            items = fs.readdirSync(targetPath, { withFileTypes: true });
            folders = items.filter(item => item.isDirectory()).sort();
            files = items.filter(item => item.isFile()).sort();
            
            await interaction.update({
              embeds: [createListEmbed(showFiles)],
              components: [createButtons('list', showFiles)]
            });
          }
          else if (interaction.customId.startsWith('select_file_')) {
            const index = parseInt(interaction.values[0].split('_')[1]);
            const selectedFile = files[index];
            const filePath = path.join(targetPath, selectedFile.name);
            
            currentFile = filePath;
            currentMode = 'viewing';
            fileViewData = createFileViewEmbed(filePath);
            
            await interaction.update({
              embeds: [fileViewData.embed],
              components: [createButtons('viewing', showFiles, fileViewData)]
            });
          }
          else if (interaction.customId === 'back_to_list') {
            currentMode = 'list';
            currentFile = null;
            fileViewData = null;
            await interaction.update({
              embeds: [createListEmbed(showFiles)],
              components: [createButtons('list', showFiles)]
            });
          }
          else if (interaction.customId === 'file_prev_page') {
            if (currentFile && fileViewData) {
              const newStart = Math.max(1, fileViewData.currentStart - 30);
              fileViewData = createFileViewEmbed(currentFile, newStart);
              await interaction.update({
                embeds: [fileViewData.embed],
                components: [createButtons('viewing', showFiles, fileViewData)]
              });
            }
          }
          else if (interaction.customId === 'file_next_page') {
            if (currentFile && fileViewData) {
              const newStart = fileViewData.currentEnd + 1;
              fileViewData = createFileViewEmbed(currentFile, newStart);
              await interaction.update({
                embeds: [fileViewData.embed],
                components: [createButtons('viewing', showFiles, fileViewData)]
              });
            }
          }
          else if (interaction.customId === 'go_parent') {
            targetPath = path.dirname(targetPath);
            items = fs.readdirSync(targetPath, { withFileTypes: true });
            folders = items.filter(item => item.isDirectory()).sort();
            files = items.filter(item => item.isFile()).sort();
            
            await interaction.update({
              embeds: [createListEmbed(showFiles)],
              components: [createButtons('list', showFiles)]
            });
          } 
          else if (interaction.customId === 'refresh') {
            items = fs.readdirSync(targetPath, { withFileTypes: true });
            folders = items.filter(item => item.isDirectory()).sort();
            files = items.filter(item => item.isFile()).sort();
            
            await interaction.update({
              embeds: [createListEmbed(showFiles)],
              components: [createButtons('list', showFiles)]
            });
          }
        } catch (error) {
          await interaction.reply({
            content: `❌ Error: ${error.message}`,
            ephemeral: true
          });
        }
      });

      // Handle folder navigation through messages
      const messageCollector = message.channel.createMessageCollector({
        filter: m => m.author.id === message.author.id && m.content.startsWith('cd '),
        time: 600000
      });

      messageCollector.on('collect', async (msg) => {
        const newPath = msg.content.slice(3).trim();
        const fullNewPath = path.resolve(targetPath, newPath);
        
        if (!fullNewPath.startsWith(projectRoot)) {
          return msg.reply("❌ Cannot navigate outside project directory.");
        }
        
        if (fs.existsSync(fullNewPath) && fs.statSync(fullNewPath).isDirectory()) {
          targetPath = path.relative(projectRoot, fullNewPath) || '.';
          items = fs.readdirSync(fullNewPath, { withFileTypes: true });
          folders = items.filter(item => item.isDirectory()).sort();
          files = items.filter(item => item.isFile()).sort();
          
          await listMessage.edit({
            embeds: [createListEmbed(showFiles)],
            components: [createButtons('list', showFiles)]
          });
          
          await msg.delete().catch(() => {});
        } else {
          await msg.reply("❌ Directory not found.");
        }
      });

      collector.on('end', () => {
        messageCollector.stop();
        listMessage.edit({
          components: []
        }).catch(() => {});
      });

    } catch (error) {
      return message.reply(`❌ Error reading directory: ${error.message}`);
    }
  }
};
