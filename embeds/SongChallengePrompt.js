const Discord = require('discord.js');
const { shortPrefix } = require('../config.json');

const SongChallengePrompt = (prompt, responses) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`Today's Prompt: ${prompt}`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `Participate in today's song challenge by sending through a song which addresses the prompt! \
            Songs are added to a collaborative playlist for you to enjoy. ${
                responses.length
                    ? 'Here are the most recent responses:'
                    : 'Be the first to respond today!'
            }`,
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
            'Respond',
            `Respond to today's prompt by typing \`${shortPrefix} prompt respond <query>||<spotify track URL>||<spotify track URI>\``,
        )
        .addField(
            'Playlist',
            `Get a link to the Spotify playlist by typing \`${shortPrefix} prompt playlist\`.`,
        );

    return embed;
};

module.exports = SongChallengePrompt;
