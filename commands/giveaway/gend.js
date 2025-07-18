
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "gend",
    description: "Ends a giveaway by message ID",
    category: "giveaway",
    async execute(client, message, args) {
        await message.delete().catch(() => {});

        if (!message.member.permissions.has("ManageMessages")) {
            return message.channel.send("❌ You need `Manage Messages` permission.").then(m => setTimeout(() => m.delete(), 5000));
        }

        const messageId = args[0];
        if (!messageId) {
            return message.reply(`❌ Usage: \`${client.config.prefix}gend <message_id>\`\nYou must provide the message ID of the giveaway.`);
        }

        try {
            const targetMessage = await message.channel.messages.fetch(messageId);
            if (!targetMessage) {
                return message.reply("❌ Message not found.");
            }

            // Check if it's a reaction-based giveaway
            const reaction = targetMessage.reactions.cache.get("🎉");
            if (!reaction) {
                return message.reply("❌ No 🎉 reaction found on this message.");
            }

            const users = await reaction.users.fetch();
            const entrants = users.filter(u => !u.bot).map(u => u);

            if (entrants.length === 0) {
                await targetMessage.edit({
                    embeds: [EmbedBuilder.from(targetMessage.embeds[0])
                        .setColor("Red")
                        .setDescription("🎉 Giveaway ended! No one entered.")
                        .setTitle("🎊 Giveaway Ended!")
                    ]
                });
                return message.channel.send("❌ Giveaway ended, but no users joined.");
            }

            const winner = entrants[Math.floor(Math.random() * entrants.length)];

            await targetMessage.edit({
                embeds: [EmbedBuilder.from(targetMessage.embeds[0])
                    .setColor("Green")
                    .setTitle("🎊 Giveaway Ended!")
                    .setDescription(`🎉 Giveaway ended! Winner: ${winner}`)
                ]
            });

            message.channel.send(`🎊 Giveaway ended! Winner: ${winner}`);
        } catch (err) {
            console.error(err);
            message.channel.send("❌ Failed to end giveaway. Make sure the message ID is correct.");
        }
    }
};
