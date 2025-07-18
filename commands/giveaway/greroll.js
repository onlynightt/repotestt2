
const { EmbedBuilder } = require("discord.js");

module.exports = {
    name: "greroll",
    description: "Reroll a giveaway by message ID",
    category: "giveaway",
    ownerOnly: false,
    async execute(client, message, args) {
        await message.delete().catch(() => {});
        
        if (!message.member.permissions.has("ManageMessages")) {
            return message.channel.send("❌ You need `Manage Messages` permission.").then(m => setTimeout(() => m.delete(), 5000));
        }

        const messageId = args[0];
        if (!messageId) {
            return message.channel.send("❌ Provide the giveaway message ID.").then(m => setTimeout(() => m.delete(), 5000));
        }

        try {
            const targetMessage = await message.channel.messages.fetch(messageId);
            if (!targetMessage) {
                return message.channel.send("❌ Message not found.");
            }

            // Check if it's a reaction-based giveaway
            const reaction = targetMessage.reactions.cache.get("🎉");
            if (!reaction) {
                return message.channel.send("❌ No 🎉 reaction found on this message. This might not be a valid giveaway.");
            }

            const users = await reaction.users.fetch();
            const entrants = users.filter(u => !u.bot).map(u => u);

            if (entrants.length === 0) {
                return message.channel.send("❌ No entries found to reroll.");
            }

            const newWinner = entrants[Math.floor(Math.random() * entrants.length)];
            
            // Update the giveaway message to show new winner
            await targetMessage.edit({
                embeds: [EmbedBuilder.from(targetMessage.embeds[0])
                    .setColor("Purple")
                    .setTitle("🎊 Giveaway Rerolled!")
                    .setDescription(`🎉 Giveaway rerolled! New winner: ${newWinner}`)
                ]
            });

            message.channel.send(`🔁 Rerolled winner: ${newWinner}`);
        } catch (error) {
            console.error('Error rerolling giveaway:', error);
            message.channel.send("❌ Couldn't reroll. Check the message ID and ensure it's a valid giveaway.");
        }
    }
};
