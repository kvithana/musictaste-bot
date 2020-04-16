const Discord = require('discord.js');
const _ = require('lodash');

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
            'https://musictaste.space/favicon.ico',
            'https://musictaste.space',
        )
        .setDescription(
            `We compared the music tastes of these two, and they share
            ${
                matchData.genres ? matchData.genres + ' most' : 'no genres'
            } in common.`,
        )
        .setURL(`https://musictaste.space/`);
    if (matchData.artist) {
        embed = embed
            .addField(
                'Top Artist In Common',
                `_${matchData.artist.name}_`,
                true,
            )
            .setImage(matchData.artist.image);
    }
    if (matchData.track) {
        embed = embed
            .addField(
                'Top Track In Common',
                `${matchData.track.name}\n_${matchData.track.artist}_`,
                true,
            )
            .setImage(matchData.track.image);
    }
    embed = embed
        .addField(
            'See Match',
            `[Click Here](https://musictaste.space/match/${matchData.matchId})`,
        )
        .addField('Match Command', `$musictaste match ${displayName}`)
        .setTimestamp(new Date(matchData.date))
        .setFooter('musictaste.space created by Kalana Vithana')
        .setThumbnail(userData.photoURL);
    return embed;
};

module.exports = Match;
