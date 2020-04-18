const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const _ = require('lodash');

const TopSongs = require('../embeds/TopSongs');
const TopArtists = require('../embeds/TopArtists');
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
        if (!['artists', 'songs'].includes(args[0])) {
            return message.reply("you didn't send the right arguments.");
        }
        let timePeriod = _.get(args, 1, false);
        if (timePeriod) {
            if (['short', 'medium', 'long'].includes(args[1])) {
                timePeriod = timePeriod + ' term';
            } else {
                return message.reply("you didn't send the right arguments.");
            }
        }

        if (args[0] === 'songs') {
            await api.armSpotify();
            const songs = await api.sptfy.getTopSongs(
                timePeriod ? timePeriod.replace(' ', '_') : 'short_term',
                9,
            );
            return message.channel.send(
                TopSongs(
                    api.userDoc,
                    message.member.displayName,
                    songs,
                    timePeriod || 'short term',
                ),
            );
        }
        if (args[0] === 'artists') {
            await api.armSpotify();
            const songs = await api.sptfy.getTopArtists(
                timePeriod ? timePeriod.replace(' ', '_') : 'short_term',
                9,
            );
            message.channel.send(
                TopArtists(
                    api.userDoc,
                    message.member.displayName,
                    songs,
                    timePeriod || 'short term',
                ),
            );
        }
    };
    return fn;
};

module.exports = {
    name: 'top',
    description: 'See your top songs and artists.',
    args: true,
    guildOnly: false,
    usage: '<artists | songs> [short term | medium term | long term]',
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
