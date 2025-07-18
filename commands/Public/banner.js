module.exports = {
    name: "banner",
    aliases: ["b"],
    description: "View the user's banner (if available)",
    category: "public",
    async execute(client, message, args) {
        const user = message.mentions.users.first() || message.author;

        try {
            const fetchedUser = await client.users.fetch(user.id, { force: true });
            const bannerURL = fetchedUser.bannerURL({ dynamic: true, size: 2048 });

            if (!bannerURL) {
                const noBannerEmbed = {
                    color: 0xE74C3C,
                    description: `❌ **${fetchedUser.tag}** does not have a banner.`
                };
                return message.channel.send({ embeds: [noBannerEmbed] });
            }

            const embed = {
                color: 0x3498db,
                title: `🎨 Banner for ${fetchedUser.tag}`,
                image: { url: bannerURL }
            };

            message.channel.send({ embeds: [embed] });
        } catch (err) {
            console.error(err);
            const errorEmbed = {
                color: 0xE74C3C,
                description: "❌ Failed to fetch banner."
            };
            message.channel.send({ embeds: [errorEmbed] });
        }
    }
};