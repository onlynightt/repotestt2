module.exports = {
    name: "id",
    aliases: ["i"],
    description: "Get the ID of a user, role, or emoji",
    category: "public",
    async execute(client, message, args) {
        if (!args.length) {
            return message.reply("❌ Please mention a user, role, or emoji.");
        }

        const input = args[0];
        let idType = null;
        let idValue = null;
        let label = "";

        // Check if it's a user mention or ID
        const user = message.mentions.users.first() || await client.users.fetch(input).catch(() => null);
        if (user) {
            idType = "User";
            idValue = user.id;
            label = user.tag;
        }

        // Check if it's a role mention or ID
        if (!idValue) {
            const role = message.mentions.roles.first() || message.guild.roles.cache.get(input);
            if (role) {
                idType = "Role";
                idValue = role.id;
                label = `@${role.name}`;
            }
        }

        // Check if it's a custom emoji
        if (!idValue) {
            const emojiMatch = input.match(/^<a?:\w+:(\d+)>$/);
            if (emojiMatch) {
                idType = "Emoji";
                idValue = emojiMatch[1];
                label = input;
            }
        }

        if (!idValue) {
            return message.reply("❌ Couldn't identify a valid user, role, or emoji.");
        }

        const embed = {
            color: 0x2ecc71,
            title: `🔍 ${idType} ID`,
            fields: [
                { name: idType, value: label, inline: true },
                { name: "🆔 ID", value: `\`${idValue}\``, inline: true }
            ]
        };

        message.channel.send({ embeds: [embed] });
    }
};""