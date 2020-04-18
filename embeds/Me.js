const Discord = require('discord.js');
const { prefix } = require('../config.json');

const Me = (userData, displayName, additional, genres) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(userData.displayName)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `Here is ${userData.displayName}'s musictaste.space info.`,
        )
        .setThumbnail(userData.photoURL);
    if (additional) {
        if (additional.trackLT) {
            const v = additional.trackLT[0];
            embed = embed.addField(
                'Top Track - Long Term',
                `[${v.name}](${v.url})\n_${v.artist}_`,
            );
        }
        if (additional.trackMT) {
            const v = additional.trackMT[0];
            embed = embed.addField(
                'Top Track - Medium Term',
                `[${v.name}](${v.url})\n_${v.artist}_`,
            );
        }
        if (additional.trackST) {
            const v = additional.trackST[0];
            embed = embed.addField(
                'Top Track - Short Term',
                `[${v.name}](${v.url})\n_${v.artist}_`,
            );
        }
        if (additional.artists) {
            const artists = additional.artists;
            embed = embed.addField(
                'Top Artists',
                artists.map((v) => `[${v.name}](${v.url})`).join('\n'),
                true,
            );
        }
        if (genres) {
            genres = genres.slice(0, 5);
            embed = embed.addField(
                'Top Genres',
                genres
                    .map((v) => v[0])
                    .map((v) => v[0].toUpperCase() + v.slice(1))
                    .join('\n'),
                true,
            );
        }
    }
    embed = embed
        .addField('Match Command', `${prefix} match @${displayName}`)
        .setFooter('musictaste.space created by Kalana Vithana');

    return embed;
};

module.exports = Me;
