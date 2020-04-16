const Discord = require('discord.js');
const { prefix } = require('../config.json');

const Me = (userData, displayName) => {
    const embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(userData.displayName)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/favicon.ico',
            'https://musictaste.space',
        )
        .setDescription(
            `Here is ${userData.displayName}'s musictaste.space info.`,
        )
        .addField(
            'Match Link',
            `https://musictaste.space/match?request=${userData.matchCode}`,
        )
        .addField('Match Command', `${prefix} match ${displayName}`)
        .setThumbnail(userData.photoURL);

    return embed;
};

module.exports = Me;
