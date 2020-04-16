const Discord = require('discord.js');
const TaskMaster = require('./TaskMaster');

class ChannelManager {
    constructor() {
        this.channels = new Discord.Collection();
    }

    /**
     * Gets the given task master for a given channel or creates
     * one if it doesn't exist already.
     * @param {string} channel
     */
    getTaskMaster(channel) {
        if (this.channels.has(channel)) {
            return this.channels.get(channel);
        } else {
            const tm = new TaskMaster();
            this.channels.set(channel, tm);
            return tm;
        }
    }
}

module.exports = ChannelManager;
