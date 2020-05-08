const Discord = require('discord.js');
const songChallenge = require('./SongChallenge');
const { matchTimeout } = require('../config.json');
class TaskMaster {
    constructor(channel, name) {
        this.awaitingConfirm = new Discord.Collection();
        this.trackConfirm = new Discord.Collection();
        this.songChallenge = new songChallenge(channel, name);
    }

    /**
     * Given a `userId`, sets a request flag with a callback function `fn`
     * to be executed on approval by `requestId`.
     * A request expires in `expirationTime`, by default 5 minutes.
     * @param {string} userId
     * @param {string} requestId
     */
    setRequestMatch(userId, requestId, data, expirationTime = matchTimeout) {
        let reqColl;
        if (this.awaitingConfirm.has(requestId)) {
            reqColl = this.awaitingConfirm.get(requestId);
            reqColl.set(userId, data);
            console.log('Setted existing', reqColl.get(userId));
        } else {
            reqColl = new Discord.Collection();
            reqColl.set(userId, data);
            this.awaitingConfirm.set(requestId, reqColl);
            console.log('Setted new', userId, reqColl.get(userId));
        }
        setTimeout(() => {
            console.log('Deleted request', userId);
            reqColl.delete(userId);
            console.log('req', reqColl);
        }, expirationTime);
    }

    /**
     * Where `userId` is the verifier for an action by `requestId`,
     * if a requests exists, executes the callback.
     * @param {string} userId
     * @param {string} requestId
     */
    verifyMatch(userId, requestId) {
        if (this.awaitingConfirm.has(userId)) {
            const reqColl = this.awaitingConfirm.get(userId);
            if (reqColl.has(requestId)) {
                const data = reqColl.get(requestId);
                console.log('Got data', data);
                return data;
            }
        }
        return false;
    }

    /**
     * Lets the user respond to a song prompt, which can then be confirmed.
     * @param {string} userId
     * @param {string} trackId
     * @param {number} expirationTime
     */
    setTrackResponse(userId, trackId, expirationTime = 120000) {
        this.trackConfirm.set(userId, trackId);
        let reqColl = this.trackConfirm;
        setTimeout(() => {
            console.log('Deleted track', userId);
            if (reqColl.has(userId) && reqColl.get(userId) === trackId) {
                reqColl.delete(userId);
                console.log('req', reqColl);
            }
        }, expirationTime);
    }

    /**
     * Gets the user's current track response if it exists.
     * @param {string} userId
     */
    verifyTrackResponse(userId) {
        if (!this.trackConfirm.has(userId)) {
            return false;
        }
        return this.trackConfirm.get(userId);
    }
}

module.exports = TaskMaster;
