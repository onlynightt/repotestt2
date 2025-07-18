const Discord = require("discord.js-selfbot-v13");
const { joinVoiceChannel } = require('@discordjs/voice');
const data = require('./data.json');

const client = new Discord.Client({
  checkUpdate: false,
  autoRedeemNitro: false,
  ws: { 
    properties: { 
      browser: "Discord Android"
    } 
  },
  restTimeOffset: 500,
  retryLimit: 5
});

let checkForReactions;

client.on('error', (error) => {
  console.error('Discord client error:', error.message);
});

client.on('disconnect', (event) => {
  console.log(`Disconnected: ${event.code}. Reason: ${event.reason || 'Unknown'}`);
  if (event.code !== 1000) {
    setTimeout(() => client.login(data.account_token), 5000);
  }
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  checkForReactions();
  setInterval(checkForReactions, 5000);

  setInterval(async () => {
    if (!client.voice.adapters.size) {
      try {
        if (!data.voice_channel) {
          console.error('Voice channel not configured');
          return;
        }
        
        const channel = await client.channels.fetch(data.voice_channel).catch(err => {
          console.error('Could not fetch voice channel:', err.message);
          return null;
        });
        
        if (!channel) {
          console.error('Voice channel not found');
          return;
        }
        
        const isVoiceChannel = channel.type === 2 || channel.type === 'GUILD_VOICE';
        if (!isVoiceChannel) {
          console.error('Channel is not a voice channel');
          return;
        }
        
        joinVoiceChannel({
          channelId: channel.id,
          guildId: channel.guild.id,
          adapterCreator: channel.guild.voiceAdapterCreator,
          selfDeaf: false,
          selfMute: false
        });
        
        console.log('Joined voice channel');
      } catch (error) {
        console.error('Failed to join voice channel:', error.message);
      }
    }
  }, 10000);
});

checkForReactions = async () => {
  try {
    const targetServerId = data.reaction_server;
    const guild = client.guilds.cache.get(targetServerId);
    if (!guild) {
      console.error('Target server not found');
      return;
    }
    
    const targetChannelId = data.reaction_channel;
    const channel = guild.channels.cache.get(targetChannelId);
    if (!channel) {
      console.error('Target channel not found');
      return;
    }
    
    if (!channel.messages || typeof channel.messages.fetch !== 'function') {
      console.error('Cannot fetch messages from channel');
      return;
    }
    
    const messages = await channel.messages.fetch({ limit: 25 }).catch(err => {
      console.error('Failed to fetch messages:', err.message);
      return new Map();
    });
    
    if (!messages || messages.size === 0) {
      return;
    }
    
    for (const [messageId, message] of messages) {
      if (!message.author.bot) continue;
      
      if (message.reactions.cache.size > 0) {
        const existingReactions = Array.from(message.reactions.cache.values());
        
        for (const reaction of existingReactions) {
          try {
            let emoji = reaction.emoji.id || reaction.emoji.name;
            
            const hasReacted = await reaction.users.fetch().then(users => users.has(client.user.id));
            
            if (hasReacted) continue;
            
            await message.react(emoji);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('Error adding reaction:', error.message);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking for reactions:', error.message);
  }
};

client.on("messageCreate", async msg => {
  const isTargetChannel = msg.guild && 
                         msg.guild.id === data.reaction_server && 
                         msg.channel.id === data.reaction_channel;
  
  if (isTargetChannel && msg.author.bot) {
    try {
      const fetchedMsg = await msg.channel.messages.fetch(msg.id);
      
      if (fetchedMsg.reactions.cache.size > 0) {
        const existingReactions = Array.from(fetchedMsg.reactions.cache.values());
        
        for (const reaction of existingReactions) {
          try {
            let emoji = reaction.emoji.id || reaction.emoji.name;
            
            const hasReacted = await reaction.users.fetch().then(users => users.has(client.user.id));
            
            if (hasReacted) continue;
            
            await fetchedMsg.react(emoji);
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (error) {
            console.error('Error adding reaction:', error.message);
          }
        }
      }
    } catch (error) {
      console.error('Error handling reactions:', error.message);
    }
  }
});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.id === client.user.id) return;
  
  const message = reaction.message;
  
  if (message.guild && 
      message.guild.id === data.reaction_server && 
      message.channel.id === data.reaction_channel &&
      message.author.bot) {
    
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (error) {
        console.error('Error fetching reaction:', error.message);
        return;
      }
    }
    
    const userReactions = message.reactions.cache.get(reaction.emoji.id || reaction.emoji.name);
    if (userReactions) {
      const hasReacted = await userReactions.users.fetch().then(users => users.has(client.user.id));
      if (hasReacted) return;
    }
    
    try {
      let emoji = reaction.emoji.id || reaction.emoji.name;
      await message.react(emoji);
    } catch (error) {
      console.error('Error adding reaction:', error.message);
    }
  }
});

process.on('SIGTERM', () => {
  if (client) client.destroy();
  process.exit(0);
});

process.on('SIGINT', () => {
  if (client) client.destroy();
  process.exit(0);
});

if (!data.account_token) {
  console.error('Discord token not configured');
  process.exit(1);
} else {
  client.login(data.account_token);
}