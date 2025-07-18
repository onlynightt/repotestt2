
const { PermissionsBitField, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
  name: "channel",
  description: "Advanced channel management commands",
  category: "moderation",
  async execute(client, message, args) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return message.reply("❌ You don't have permission to manage channels.");
    }

    const action = args[0]?.toLowerCase();
    
    if (!action || !['clone', 'sync', 'nuke', 'lock', 'unlock', 'slowmode'].includes(action)) {
      const embed = new EmbedBuilder()
        .setColor('#0099ff')
        .setTitle('📁 Channel Management')
        .addFields(
          { name: 'Clone Channel', value: '`channel clone [#channel]`', inline: false },
          { name: 'Sync Permissions', value: '`channel sync [#source] [#target]`', inline: false },
          { name: 'Nuke Channel', value: '`channel nuke [#channel]`', inline: false },
          { name: 'Lock/Unlock', value: '`channel lock/unlock [#channel]`', inline: false },
          { name: 'Slowmode', value: '`channel slowmode [#channel] [seconds]`', inline: false }
        );
      return message.reply({ embeds: [embed] });
    }

    if (action === 'clone') {
      const channel = message.mentions.channels.first() || message.channel;
      
      try {
        const cloned = await channel.clone({
          name: `${channel.name}-clone`,
          reason: `Cloned by ${message.author.tag}`
        });
        
        return message.reply(`✅ Channel cloned: ${cloned}`);
      } catch (error) {
        return message.reply("❌ Failed to clone channel.");
      }
    }

    if (action === 'sync') {
      const source = message.mentions.channels.first();
      const target = message.mentions.channels.array()[1];
      
      if (!source || !target) {
        return message.reply("❌ Please mention source and target channels.");
      }

      try {
        await target.permissionOverwrites.set(source.permissionOverwrites.cache);
        return message.reply(`✅ Permissions synced from ${source} to ${target}`);
      } catch (error) {
        return message.reply("❌ Failed to sync permissions.");
      }
    }

    if (action === 'nuke') {
      const channel = message.mentions.channels.first() || message.channel;
      
      if (channel.type !== ChannelType.GuildText) {
        return message.reply("❌ Can only nuke text channels.");
      }

      try {
        const position = channel.position;
        const cloned = await channel.clone({
          reason: `Nuked by ${message.author.tag}`
        });
        
        await cloned.setPosition(position);
        await channel.delete();
        
        await cloned.send(`🔥 Channel nuked by ${message.author}`);
      } catch (error) {
        return message.reply("❌ Failed to nuke channel.");
      }
    }

    if (action === 'lock' || action === 'unlock') {
      const channel = message.mentions.channels.first() || message.channel;
      const isLocking = action === 'lock';
      
      try {
        await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
          SendMessages: !isLocking
        });
        
        return message.reply(`✅ Channel ${isLocking ? 'locked' : 'unlocked'}.`);
      } catch (error) {
        return message.reply(`❌ Failed to ${action} channel.`);
      }
    }

    if (action === 'slowmode') {
      const channel = message.mentions.channels.first() || message.channel;
      const seconds = parseInt(args[args.length - 1]);
      
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply("❌ Slowmode must be between 0 and 21600 seconds (6 hours).");
      }

      try {
        await channel.setRateLimitPerUser(seconds);
        return message.reply(`✅ Slowmode set to ${seconds} seconds.`);
      } catch (error) {
        return message.reply("❌ Failed to set slowmode.");
      }
    }
  }
};
