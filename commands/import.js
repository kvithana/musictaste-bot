const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');

/**
 * @param {TaskMaster} worker
 * @param {API} api
 */
const command = (worker, api) => {
    /**
     * @param {Message} message
     * @param {Array<string>} args
     */
    const fn = async (message, args) => {
        message.channel.send(
            `Hold on tight, <@${message.author.id}>. I'm importing your Spotify data...`,
        );
        await api.importSpotifyData();
        message.channel.send(
            `Finished importing your data, <@${message.author.id}>!`,
        );
    };
    return fn;
};

module.exports = {
    name: 'import',
    description: 'Import your Spotify music data.',
    args: false,
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
