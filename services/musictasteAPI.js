const admin = require('firebase-admin');
const assert = require('assert').strict;
const _ = require('lodash');
const cFunction = require('../util/cloudFunction');
const Sptfy = require('./Spotify');

class musictasteAPI {
    constructor(discordId) {
        this.discordId = discordId;
        this.userDoc = null;
        this.mtUID = null;
        this.sptfy = null;
    }

    /**
     * Check if a user exists for a discordId. Should *always* be called
     * after construction to load user data.
     * @param {string} discordId
     */
    async isUser(discordId = this.discordId) {
        const userDoc = await admin
            .firestore()
            .collection('users')
            .where('discordId', '==', discordId)
            .get();
        if (userDoc.empty) {
            return false;
        } else {
            this.userDoc = userDoc.docs[0].data();
            this.mtUID = userDoc.docs[0].id;
            this.sptfy = new Sptfy(this.mtUID);
            this.sptfy.checkToken(this.userDoc.accessToken);
            return true;
        }
    }

    /**
     * Gets a user data object. By default, if no `userId` provided will
     * return the current user's user object.
     * @param {string} userId
     */
    async getUser(userId = this.mtUID) {
        assert(userId, 'user data has not been loaded yet');
        if (userId === this.mtUID) {
            return this.userDoc;
        } else {
            const userDoc = await admin
                .firestore()
                .collection('users')
                .doc(userId)
                .get()
                .then((d) => (d.exists ? d.data() : undefined));
            this;
            return userDoc;
        }
    }

    async importSpotifyData(uid = this.mtUID) {
        /**
         * Import top Spotify data
         */
        assert(this.userDoc, 'user data has not been imported.');
        const importData = cFunction('importData');
        return importData({
            uid,
        }).then((data) => _.has(data, 'success'));
    }

    /**
     * Compare music tastes between current user and a given user id.
     * If passing in a musictaste.space UID, set `uid` to `true`. If you
     * also would like to create a playlist, set `playlist` to `true`.
     * @param {string} id
     * @param {boolean} uid
     * @param {boolean} playlist
     */
    async compareUser(id, uid = false, playlist = false) {
        assert(this.userDoc, 'user data has not been imported.');
        const compareMTUID = uid ? id : await this.getUIDForDiscordId(id);
        if (compareMTUID) {
            const compareUsers = cFunction('compareUsers');
            const matchId = await compareUsers({
                userId: await this.getMatchCode(),
                compareUserId: await this.getMatchCode(compareMTUID),
            }).then((data) =>
                _.has(data, 'success') ? data.matchId : undefined,
            );
            if (matchId) {
                const matchData = await this.getMatchData(matchId);
                const matchedTracks = matchData.matchedTracksLongTerm
                    .concat(matchData.matchedTracksMediumTerm)
                    .concat(matchData.matchedTracksShortTerm);
                console.log(matchData);
                const minifiedData = {
                    matchId,
                    score: matchData.score,
                    date: matchData.matchDate,
                    genres: matchData.matchedGenres.length
                        ? matchData.matchedGenres
                              .slice(0, 5)
                              .map((v) => v.genre)
                              .join(', ')
                        : undefined,
                    track: matchedTracks.length
                        ? await this.sptfy.getTrack(matchedTracks[0].id)
                        : undefined,
                    artist: matchData.matchedArtists.length
                        ? await this.sptfy.getArtist(
                              matchData.matchedArtists[0].id,
                          )
                        : undefined,
                };
                console.log(minifiedData);
                return minifiedData;
            }
        }
    }

    /**
     * Gets the musictaste.space UID for a given discord ID if it exists.
     * @param {string} discordId
     */
    async getUIDForDiscordId(discordId) {
        const userDoc = await admin
            .firestore()
            .collection('users')
            .where('discordId', '==', discordId)
            .get();
        if (userDoc.empty) {
            return undefined;
        } else {
            return userDoc.docs[0].id;
        }
    }

    /**
     * Get the match code for the user
     * @param {string} uid
     */
    async getMatchCode(uid = this.mtUID) {
        const user = await this.getUser(uid);
        return user.matchCode;
    }

    /**
     * Returns the match data for a certain user match.
     * @param {string} matchId
     */
    async getMatchData(matchId) {
        const matchDoc = await admin
            .firestore()
            .collection('matches')
            .doc(matchId)
            .get();
        if (matchDoc.empty) {
            return undefined;
        } else {
            return matchDoc.data();
        }
    }

    /**
     * Arms Spotify with token for use.
     */
    async armSpotify() {
        await this.sptfy.checkToken(this.userDoc.accessToken);
    }
}

module.exports = musictasteAPI;
