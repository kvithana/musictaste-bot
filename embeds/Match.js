const Discord = require('discord.js');
const _ = require('lodash');
const { prefix } = require('../config.json');

const good = ['🎉', '😍', '🤩', '😜', '🤪', '🥰', '😵', '🥳'];
const okay = ['😀', '😚', '😛', '😮'];
const meh = ['😋', '😌', '👍', '🤔', '🙂'];
const yikes = ['😫', '😢', '😓', '😬', '😕'];

const Match = (userData, matchData, displayName, matchDisplayName) => {
    let emoji;
    if (matchData.score > 0.75) {
        emoji = _.sample(good);
    } else if (matchData.score > 0.55) {
        emoji = _.sample(okay);
    } else if (matchData.score > 0.3) {
        emoji = _.sample(meh);
    } else {
        emoji = _.sample(yikes);
    }
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(
            `${displayName} × ${matchDisplayName} are ${Math.floor(
                matchData.score * 100,
            ).toString()}% compatible ${emoji}${
                matchData.score > 0.6 ? ' !' : ' .'
            }`,
        )
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `I compared the music tastes of ${displayName} and ${matchDisplayName}, and here's what they had in common:`,
        )
        .setURL(`https://musictaste.space/`);
    if (matchData.artist) {
        embed = embed.addField(
            'Top Artist In Common',
            `[${matchData.artist.name}](${matchData.artist.url})`,
            true,
        );
    }
    if (matchData.track) {
        embed = embed.addField(
            'Top Track In Common',
            `[${matchData.track.name}](${matchData.track.url})\n_${matchData.track.artist}_`,
            true,
        );
    }
    if (matchData.topTracksLT && matchData.topTracksLT.length) {
        embed = embed.addField(
            'Matched Tracks - All Time Faves',
            matchData.topTracksLT.map(
                (t) => `[${t.name}](${t.url}) - _${t.artist}_`,
            ),
        );
    }
    if (matchData.topTracksMT && matchData.topTracksMT.length) {
        embed = embed.addField(
            'Matched Tracks - Medium Term',
            matchData.topTracksMT.map(
                (t) => `[${t.name}](${t.url}) - _${t.artist}_`,
            ),
        );
    }
    if (matchData.topTracksST && matchData.topTracksST.length) {
        embed = embed.addField(
            'Matched Tracks - Recent Listens',
            matchData.topTracksST.map(
                (t) => `[${t.name}](${t.url}) - _${t.artist}_`,
            ),
        );
    }
    if (matchData.topArtistsLT && matchData.topArtistsLT.length) {
        embed = embed.addField(
            'Artists - All Time Faves',
            matchData.topArtistsLT.map((a) => `[${a.name}](${a.url})`),
        );
    }
    if (matchData.topArtistsMT && matchData.topArtistsMT.length) {
        embed = embed.addField(
            'Artists - Medium Term',
            matchData.topArtistsMT.map((a) => `[${a.name}](${a.url})`),
        );
    }
    if (matchData.topArtistsST && matchData.topArtistsST.length) {
        embed = embed.addField(
            'Artists - Recent Listens',
            matchData.topArtistsST.map((a) => `[${a.name}](${a.url})`),
        );
    }
    embed = embed
        .addField(
            'See Match',
            `[Click Here](https://musictaste.space/match/${matchData.matchId})`,
        )
        .addField('Match Command', `${prefix} match @${displayName}`)
        .setTimestamp(new Date(matchData.date))
        .setFooter('musictaste.space created by Kalana Vithana')
        .setThumbnail(
            matchData.artist ? matchData.artist.image : userData.photoURL,
        );
    return embed;
};

module.exports = Match;
