const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');

const RecommendedTrack = require('../embeds/RecommendedTrack');
const { shortPrefix } = require('../config.json');
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
        const track = args[0];
        const createPlaylist = args[args.length - 1] === 'playlist';
        if (createPlaylist) {
            args.pop();
        }
        let trackId;
        if (track.startsWith('https://open.spotify.com/track/')) {
            try {
                trackId =
                    'spotify:track:' +
                    track
                        .replace('https://open.spotify.com/track/', '')
                        .split('?')[0];
            } catch (e) {
                return message.reply("you didn't give a valid Spotify URL.");
            }
        }
        if (track.startsWith('spotify:track:')) {
            trackId = track;
        }
        if (args.join(' ').length > 5) {
            console.log(args);
            const search = await api.sptfy.searchTracks(args.join(' '));
            if (search && search.length) {
                trackId = `spotify:track:${search[0].id}`;
            }
        }
        if (!trackId) {
            return message.reply(
                `you didn't give me a valid Spotify URL, URI or search parameter. Need help? Try \`${shortPrefix} help recommend\``,
            );
        }
        const rec = await api.sptfy.getRecommendation(
            trackId.replace('spotify:track:', ''),
            20,
        );
        console.log('trackId', trackId);
        if (!rec.length) {
            return message.reply(
                "I couldn't come up with a recommendation for that track, sorry.",
            );
        } else {
            const original = await api.sptfy.getTrack(
                trackId.replace('spotify:track:', ''),
            );
            const recommended = await api.sptfy.getTrack(rec[0].id);
            if (original && recommended) {
                if (createPlaylist) {
                    const playlist = await api.sptfy.createPlaylist(
                        api.mtUID.replace('spotify:', ''),
                        `${original.name} Recommendations`,
                        rec.map((t) => `spotify:track:${t.id}`),
                    );
                    if (playlist) {
                        return message.reply(
                            `here are your recommendations for ${original.name}: https://open.spotify.com/playlist/${playlist}`,
                        );
                    }
                }
                return message.reply(RecommendedTrack(original, recommended));
            }
        }
        message.reply(
            'something went wrong getting your recommendation, try again later.',
        );
    };
    return fn;
};

module.exports = {
    name: 'recommend',
    description:
        'Get a random track suggestion with a given track as inspiration.\n\
        Specify `playlist` at the end of arguments to generate 20 recommendations as a playlist',
    args: true,
    usage: '<search query>|<track URI>|<track URL> [playlist]',
    example: 'Despacito',
    execute: command,
    useServices: true,
    alias: ['r', 'random', 'recc'],
    hidden: false,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
