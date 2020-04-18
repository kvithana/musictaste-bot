const Discord = require('discord.js');

const TopArtists = (userData, displayName, songs, time) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`${displayName}'s Top Artists`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(`Here is ${displayName}'s top artists in the ${time}.`)
        .setThumbnail(userData.photoURL);

    songs.map((v, i) => {
        embed = embed.addField(
            `${i + 1}${Array.from({ length: 30 })
                .map((x) => '\u0020')
                .join('')}\u200B`,
            `[${v.name}](${v.url})`,
            true,
        );
    });

    return embed;
};

module.exports = TopArtists;

/**
 * `${'\u200B'}`
 */
