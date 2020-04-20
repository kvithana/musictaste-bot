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
            await this.sptfy.checkToken(this.userDoc.accessToken);
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
                const minifiedData = {
                    matchId,
                    score: matchData.score,
                    date: matchData.matchDate,
                    genres: matchData.matchedGenres.length
                        ? matchData.matchedGenres
                              .slice(0, 5)
                              .map((v) => v.genre)
                        : undefined,
                    track: matchedTracks.length
                        ? await this.sptfy.getTrack(matchedTracks[0].id)
                        : undefined,
                    artist: matchData.matchedArtists.length
                        ? await this.sptfy.getArtist(
                              matchData.matchedArtists[0].id,
                          )
                        : undefined,
                    topTracksLT: matchData.matchedTracksLongTerm
                        ? await this.sptfy.getTracks(
                              matchData.matchedTracksLongTerm
                                  .slice(0, 5)
                                  .map((v) => v.id),
                          )
                        : undefined,
                    topTracksMT: matchData.matchedTracksMediumTerm
                        ? await this.sptfy.getTracks(
                              matchData.matchedTracksMediumTerm
                                  .slice(0, 5)
                                  .map((v) => v.id),
                          )
                        : undefined,
                    topTracksST: matchData.matchedTracksShortTerm
                        ? await this.sptfy.getTracks(
                              matchData.matchedTracksShortTerm
                                  .slice(0, 5)
                                  .map((v) => v.id),
                          )
                        : undefined,
                    topArtistsLT: matchData.matchedArtists
                        ? await this.sptfy.getArtists(
                              matchData.matchedArtists
                                  .slice(0, 5)
                                  .map((v) => v.id),
                          )
                        : undefined,
                    topArtistsMT: matchData.matchedArtistsMediumTerm
                        ? await this.sptfy.getArtists(
                              matchData.matchedArtistsMediumTerm
                                  .slice(0, 5)
                                  .map((v) => v.id),
                          )
                        : undefined,
                    topArtistsST: matchData.matchedArtistsShortTerm
                        ? await this.sptfy.getArtists(
                              matchData.matchedArtistsShortTerm
                                  .slice(0, 5)
                                  .map((v) => v.id),
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
     * Gets imported Spotify data from Firestore for a user. Leave blank
     * to get data from current user.
     * @param {string} uid
     */
    async getSpotifyData(uid = this.mtUID) {
        const matchDoc = await admin
            .firestore()
            .collection('spotify')
            .doc(uid)
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

    /**
     * Checks whether current user has a match with another user based on
     * musictaste uid or discord id. Set `isUID` to true for musictaste id.
     * @param {string} userId
     * @param {boolean} isUID
     */
    async checkMatchExists(id, isUID = false) {
        if (!isUID) {
            id = await this.getUIDForDiscordId(id);
            assert(id, 'User must exist to check for match.');
        }
        const matchCode = await this.getMatchCode(id);
        assert(matchCode, 'User must have a match code.');

        const matchDoc = await admin
            .firestore()
            .collection('users')
            .doc(this.mtUID)
            .collection('matches')
            .doc(matchCode)
            .get();
        if (!matchDoc.exists) {
            return undefined;
        } else {
            return matchDoc.data();
        }
    }

    /**
     * Creates an list of Spotify tracks which a given array of users
     * have in common or are likely to enjoy together.
     * @param {Array<{ uid: string, discordid: string, matchId: string }>} users
     * @param {number} numTracks
     */
    async getPlaylistTracks(users, numTracks) {
        const makePlaylist = cFunction('createPlaylist');
        let tracks = [];
        for (const user of users) {
            const result = await makePlaylist({
                matchId: user.matchId,
                userId: this.mtUID,
                state: this.userDoc.serverState,
            });
            if (!result.success) {
                return [];
            } else {
                tracks = _.uniq(tracks.concat(result.tracks));
            }
            console.log('track length', tracks.length);
        }
        let shuffled = _.shuffle(tracks);
        return { tracks: shuffled.slice(0, numTracks), total: shuffled.length };
    }
}

module.exports = musictasteAPI;
