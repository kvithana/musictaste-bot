const Discord = require('discord.js');
const TaskMaster = require('./TaskMaster');
const admin = require('firebase-admin');

class ChannelManager {
    constructor() {
        this.channels = new Discord.Collection();
    }

    /**
     * Gets the given task master for a given channel or creates
     * one if it doesn't exist already.
     * @param {string} channel
     */
    async getTaskMaster(channel, name) {
        if (this.channels.has(channel)) {
            return this.channels.get(channel);
        } else {
            const tm = new TaskMaster(channel, name);
            this.channels.set(channel, tm);
            const channelExistsOnDB = await admin
                .firestore()
                .collection('discord')
                .doc(channel)
                .get()
                .then((doc) => doc.exists);
            if (!channelExistsOnDB) {
                await admin
                    .firestore()
                    .collection('discord')
                    .doc(channel)
                    .set({ created: new Date(), lastResetAccess: new Date() });
            } else {
                await admin
                    .firestore()
                    .collection('discord')
                    .doc(channel)
                    .set({ lastResetAccess: new Date() }, { merge: true });
            }
            return tm;
        }
    }
}

module.exports = ChannelManager;
