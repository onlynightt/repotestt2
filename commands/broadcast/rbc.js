module.exports = {
    name: "rbc",
    description: "Broadcast to members with a specific role (use role ID)",
    category: "broadcast",
    ownerOnly: true,
    async execute(client, message) {
      //  await message.delete().catch(() => {});

        const input = message.content.slice(client.config.prefix.length + 3).trim();
        const [roleId, ...rest] = input.split(/\s+/);
        const messageText = input.replace(roleId, "").trim();

        if (!roleId || !messageText) {
            return message.channel.send("❌ Usage: `!rbc <roleID> <message>`");
        }

        const role = message.guild.roles.cache.get(roleId);
        if (!role) return message.channel.send("❌ Role not found.");

        const members = await message.guild.members.fetch({ force: true });
        const targets = members.filter(m =>
            !m.user.bot && m.roles.cache.has(role.id)
        );

        if (!targets.size) return message.channel.send("❌ No members found with that role.");

        message.channel.send(`📢 Sending message to ${targets.size} members with role ${role.name}...`);

        let sent = 0, failed = 0;
        const jobs = [...targets.values()].map(member => {
            const content = `${messageText}\n\n<@${member.id}>`;
            return client.limiter.schedule(() =>
                member.send(content).then(() => sent++).catch(() => failed++)
            );
        });

        await Promise.allSettled(jobs);
        message.channel.send(`✅ Message sent to ${sent} members.\n❌ Failed to message ${failed} members.`);
    }
};