module.exports = {
    name: "say",
    aliases: [],
    description: "Make the bot say a message",
    category: "public",
    async execute(client, message, args) {
        const text = args.join(" ");
        if (!text) return message.reply("❌ Please provide a message for me to say.");

        // Delete author's message if possible
        if (message.deletable) {
            await message.delete().catch(() => {});
        }

        // Prevent mass pings and role mentions
        // Replace @everyone, @here, and role mentions with harmless text
        const sanitized = text
            .replace(/@everyone/gi, "[everyone]")
            .replace(/@here/gi, "[here]")
            .replace(/<@&\d+>/g, "[role]");

        // Send sanitized message without mentions
        message.channel.send({
            content: sanitized,
            allowedMentions: { parse: [] } // disables all pings
        });
    }
};