const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const { shortPrefix } = require('../config.json');
const date = require('date-fns');
const _ = require('lodash');

const sentences = [
    'Painting a Picasso piece for',
    'Writing a beautiful symphony for',
    'Creating an awesome playlist for',
    'Channelling my energy for',
    'Breaking the sound barrier for',
    'Smashing out a straight fire playlist for',
    'Thinking about some great tracks for',
    'Crunching all them numbers to make a playlist for',
];
/**
 * @param {TaskMaster} worker
 * @param {API} api
 */
const command = (worker, api) => {
    /**
     *
     * @param {Message} message
     * @param {Array<string>} args
     */
    const fn = async (message, args) => {
        const taggedUserMention = message.mentions.users.first();
        let mentions = Array.from(message.mentions.users.entries()).map(
            ([k, v]) => v,
        );
        if (!taggedUserMention) {
            return message.reply(
                'you need to @mention at least one user to create a playlst with them.',
            );
        }
        if (mentions.map((v) => v.id).includes(message.member.id)) {
            return message.reply("you can't create a playlist with yourself.");
        }
        const participants = [];
        message.channel.send(
            `${_.sample(sentences)} ${
                mentions.length > 1
                    ? mentions.map((v) => `<@${v.id}>`).join(', ')
                    : `<@${taggedUserMention.id}>`
            } and <@${message.member.id}>...`,
        );
        for (const user of mentions) {
            const exists = await api.getUIDForDiscordId(user.id);
            if (!exists) {
                return message.reply(
                    `looks like <@${user.id}> hasn't linked their musictaste.space account yet. Link with \`${shortPrefix} link\`.`,
                );
            }
            const userData = await api.getUser(exists);
            const userImportedData = _.get(userData, 'importData.exists');
            if (!userImportedData) {
                return message.reply(
                    `looks like <@${user.id}> hasn't imported their Spotify data yet. You can import data with \`${shortPrefix} import\`.`,
                );
            }
            const matchExists = await api.checkMatchExists(exists, true);
            if (!matchExists) {
                return message.reply(
                    `looks like you haven't matched with <@${user.id}> yet, try \`${shortPrefix} match\`.`,
                );
            }
            if (matchExists.score < 0.4) {
                return message.reply(
                    `your match score with <@${user.id}> is too low, so I can't make a playlist for you both, sorry!`,
                );
            }
            if (
                date.differenceInDays(
                    matchExists.matchDate.toDate(),
                    new Date(),
                ) > 7
            ) {
                if (
                    date.differenceInDays(
                        newDate(),
                        _.get(userData, 'importData.lastImport').toDate(),
                    ) > 7
                ) {
                    message.channel.reply(
                        `I'm fetching some new data for <@${user.id}> because the data was a little old.`,
                    );
                    await api.importSpotifyData();
                }
                message.channel.reply(
                    `rematching you with <@${user.id}> to get the freshest data.`,
                );
                await api.compareUser(exists, true);
            }
            participants.push({
                uid: exists,
                matchId: matchExists.matchId,
                discordId: user.id,
                username: user.username,
            });
        }
        await api.armSpotify();
        const playlistTracks = await api.getPlaylistTracks(participants, 20);
        if (!_.has(playlistTracks, 'tracks') || !playlistTracks.tracks.length) {
            return message.reply(
                "looks like something went wrong, I'll let the monkey in charge know!",
            );
        }
        const playlistId = await api.sptfy.createPlaylist(
            api.userDoc.spotifyID,
            `${message.member.displayName} × ${participants
                .map((v) => v.username)
                .join(' × ')} (${date.format(new Date(), 'd MMM')})
            `,
            playlistTracks.tracks,
        );
        if (playlistId) {
            const morePlaylists = Math.max(
                1,
                Math.floor((playlistTracks.total - 20) / 5),
            );
            message.reply(
                `done! I could probably make ${morePlaylists} more ${
                    playlistTracks.total === 1 ? 'combination' : 'combinations'
                } with your current data. The more compatible your tastes, the more playlists I can make!\nHere's your playlist:`,
            );
            const playlistURL = `https://open.spotify.com/playlist/${playlistId}`;
            message.channel.send(playlistURL);
        }
    };
    return fn;
};

module.exports = {
    name: 'playlist with',
    description:
        'Create a unique playlist with the songs you have in common with someone else.',
    args: true,
    usage: '<@mention> [...@mention]',
    example: '@Donkey',
    guildOnly: true,
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
