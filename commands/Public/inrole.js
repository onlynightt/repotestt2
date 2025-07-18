const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

module.exports = {
    name: "inrole",
    description: "View members in a specified role (with pagination buttons)",
    category: "public",
    ownerOnly: false,
    async execute(client, message, args) {
        if (!args.length)
            return message.reply("❌ Usage: `!inrole <roleName/mention/id>`");

        const roleQuery = args[0];
        const role =
            message.mentions.roles.first() ||
            message.guild.roles.cache.get(roleQuery) ||
            message.guild.roles.cache.find((r) => r.name === roleQuery);

        if (!role) return message.reply("❌ Role not found.");

        const membersInRole = role.members.map((m) => m);
        if (membersInRole.length === 0)
            return message.reply("✅ No members in this role.");

        const perPage = 25;
        const totalPages = Math.ceil(membersInRole.length / perPage);
        let page = 1;

        const getEmbed = () => {
            const start = (page - 1) * perPage;
            const end = start + perPage;
            const paged = membersInRole.slice(start, end);

            return new EmbedBuilder()
                .setTitle(`👥 Members in ${role.name}`)
                .setDescription(
                    paged
                        .map((m, i) => `${start + i + 1}. <@${m.id}> (\`${m.id}\`)`)
                        .join("\n")
                )
                .setFooter({ text: `Page ${page} / ${totalPages}` })
                .setColor("Blue");
        };

        const getRow = () =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("◀ Previous")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 1),
                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("Next ▶")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === totalPages)
            );

        const msg = await message.channel.send({
            embeds: [getEmbed()],
            components: [getRow()]
        });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 60000,
            filter: (i) => i.user.id === message.author.id
        });

        collector.on("collect", async (interaction) => {
            if (interaction.customId === "prev") page--;
            else if (interaction.customId === "next") page++;

            await interaction.update({
                embeds: [getEmbed()],
                components: [getRow()]
            });
        });

        collector.on("end", async () => {
            if (msg.editable) {
                await msg.edit({ components: [] }).catch(() => {});
            }
        });
    }
};