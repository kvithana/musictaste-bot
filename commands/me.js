const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');

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
        message.channel.send(Me(userData, message.member.displayName));
    };
    return fn;
};

module.exports = {
    name: 'me',
    description: 'Get your music taste profile.',
    args: false,
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
