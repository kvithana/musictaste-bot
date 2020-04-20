const Discord = require('discord.js');
const { shortPrefix } = require('../config.json');

const RecommendedTrack = (original, rec) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`Recommendation For: ${original.name}`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `Here's your recommendation for your track ${original.name} by ${original.artist}:`,
        )
        .setThumbnail(rec.image);
    embed = embed
        .addField(
            'Your Track',
            `[${original.name}](${original.url})\n_${original.artist}_`,
        )
        .addField(
            'My Recommendation',
            `[${rec.name}](${rec.url})\n_${rec.artist}_`,
        )
        .setFooter('Recommendations powered by Spotify recommendation API.');

    return embed;
};

module.exports = RecommendedTrack;
