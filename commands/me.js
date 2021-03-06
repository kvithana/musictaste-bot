const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const _ = require('lodash');

// embeds
const Me = require('../embeds/Me');
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
        const userData = await api.getUser();
        const spotifyData = await api.getSpotifyData();
        const genres = Object.entries(spotifyData.topGenres).sort(
            (a, b) => a[1].index - b[1].index,
        );
        // await api.compareUser('203863255620255745');
        const additional = {
            trackST: await api.sptfy.getTopSongs('short_term', 1),
            trackMT: await api.sptfy.getTopSongs('medium_term', 1),
            trackLT: await api.sptfy.getTopSongs('long_term', 1),
            artists: await api.sptfy.getTopArtists('short_term', 5),
        };
        message.channel.send(
            Me(
                userData,
                _.get(message, 'member.displayName', message.author.username),
                additional,
                genres,
            ),
        );
    };
    return fn;
};

module.exports = {
    name: 'me',
    description:
        'Get your music taste profile, displaying your top song, artist and genres.',
    shortDescription: 'Get your music taste profile.',
    args: false,
    execute: command,
    useServices: true,
    guildOnly: false,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
