const Discord = require('discord.js');
const { shortPrefix } = require('../config.json');
const date = require('date-fns');

const SongChallengeHistory = (prompt, responses, d) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`${date.format(d, 'dd MMM')}: ${prompt}`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `Here's what people responded for this prompt on ${date.format(
                d,
                'dd MMM',
            )}`,
        )
        .setThumbnail(
            responses.length
                ? responses[0].track.image
                : 'https://musictaste.space/discord-icon.png',
        );
    responses.map((r) => {
        embed = embed.addField(
            r.displayName,
            `[${r.track.name}](${r.track.url})\n_${r.track.artist}_`,
        );
    });
    embed = embed
        .addField(
            'History',
            `See another date by typing \`${shortPrefix} prompt history <date>\``,
        )
        .addField(
            'Playlist',
            `Get a link to the Spotify playlist by typing \`${shortPrefix} prompt playlist\`.`,
        );

    return embed;
};

module.exports = SongChallengeHistory;
