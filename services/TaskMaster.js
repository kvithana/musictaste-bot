const Discord = require('discord.js');
class TaskMaster {
    constructor() {
        this.awaitingConfirm = new Discord.Collection();
    }

    /**
     * Given a `userId`, sets a request flag with a callback function `fn`
     * to be executed on approval by `requestId`.
     * A request expires in `expirationTime`, by default 2 minutes.
     * @param {string} userId
     * @param {string} requestId
     */
    setRequestMatch(userId, requestId, data, expirationTime = 120000) {
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
            console.log('Deleted request', requestId);
            reqColl.delete(requestId);
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
}

module.exports = TaskMaster;
