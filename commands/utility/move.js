
const { EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "move",
    description: "Move files to a specified folder (Owner only)",
    category: "utility",
    usage: "move <source_file> <destination_folder>",
    ownerOnly: true,
    async execute(client, message, args) {
        if (args.length < 2) {
            return message.reply("❌ Usage: `move <source_file> <destination_folder>`");
        }

        const sourceFile = args[0];
        const destinationFolder = args[1];

        try {
            // Resolve paths
            const sourcePath = path.resolve(sourceFile);
            const destFolderPath = path.resolve(destinationFolder);
            
            // Check if source file exists
            if (!fs.existsSync(sourcePath)) {
                return message.reply(`❌ Source file \`${sourceFile}\` does not exist.`);
            }

            // Check if source is actually a file
            if (!fs.statSync(sourcePath).isFile()) {
                return message.reply(`❌ \`${sourceFile}\` is not a file.`);
            }

            // Create destination folder if it doesn't exist
            if (!fs.existsSync(destFolderPath)) {
                fs.mkdirSync(destFolderPath, { recursive: true });
            }

            // Check if destination is a directory
            if (fs.existsSync(destFolderPath) && !fs.statSync(destFolderPath).isDirectory()) {
                return message.reply(`❌ \`${destinationFolder}\` is not a directory.`);
            }

            // Get filename from source path
            const fileName = path.basename(sourcePath);
            const destinationPath = path.join(destFolderPath, fileName);

            // Check if file already exists in destination
            if (fs.existsSync(destinationPath)) {
                return message.reply(`❌ File \`${fileName}\` already exists in \`${destinationFolder}\`.`);
            }

            // Move the file
            fs.renameSync(sourcePath, destinationPath);

            const embed = new EmbedBuilder()
                .setTitle("📁 File Moved Successfully")
                .addFields(
                    { name: "Source", value: `\`${sourceFile}\``, inline: true },
                    { name: "Destination", value: `\`${destinationFolder}/${fileName}\``, inline: true }
                )
                .setColor("Green")
                .setTimestamp();

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error moving file:', error);
            
            const embed = new EmbedBuilder()
                .setTitle("❌ Error Moving File")
                .setDescription(`Failed to move file: ${error.message}`)
                .setColor("Red")
                .setTimestamp();

            await message.reply({ embeds: [embed] });
        }
    }
};
