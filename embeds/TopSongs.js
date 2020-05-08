const Discord = require('discord.js');

const TopSongs = (userData, displayName, songs, time) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`${displayName}'s Top Songs`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(`Here are ${displayName}'s top songs in the ${time}.`)
        .setThumbnail(userData.photoURL);

    songs.map((v, i) => {
        embed = embed.addField(v.artist, `[${v.name}](${v.url})`);
    });

    embed = embed.addField(
        'More',
        'Want to see more? Click [here](https://musictaste.space/insights/all) to see a full list.',
    );

    return embed;
};

module.exports = TopSongs;
