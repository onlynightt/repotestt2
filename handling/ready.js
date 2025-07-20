
module.exports = async (client) => {
  console.log(`${client.user.tag} Is now online and Serving ${client.guilds.cache.size} servers with ${client.users.cache.size} users!`);

  const typeInput = client.config.presence?.type;
  const typeMap = {
    PLAYING: 0,
    STREAMING: 1,
    LISTENING: 2,
    WATCHING: 3,
    COMPETING: 5
  };

  const activityType = typeMap[typeInput] !== undefined ? typeMap[typeInput] : 0;

  try {
    await client.user.setPresence({
      activities: [{
        name: client.config.presence?.text,
        type: activityType
      }],
      status: client.config.status
    });
  //  console.log('\n✅ Done! Bot custom presence has been set successfully.');
  } catch (error) {
    console.error('❌ Error setting bot presence:', error);
  }

  // Initialize automod data if needed
  const fs = require('fs');
  const path = require('path');
  
  const automodPath = path.join(__dirname, '../data/automod.json');
  if (!fs.existsSync(automodPath)) {
    fs.writeFileSync(automodPath, JSON.stringify({}));
    console.log('📝 Created automod.json file');
  }

  const giveawayPath = path.join(__dirname, '../data/giveaway.json');
  if (!fs.existsSync(giveawayPath)) {
    fs.writeFileSync(giveawayPath, JSON.stringify({}));
    console.log('📝 Created giveaway.json file');
  }

  //console.log('\n✅ Done! All Bot initialization process has been complete!');
  console.log(`\n»» This bot was programmed by @reallnight.`)
};
