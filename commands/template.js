const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');

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
    const fn = async (message, args) => {};
    return fn;
};

module.exports = {
    name: 'temp',
    description: 'Get your music taste profile.',
    args: false,
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
