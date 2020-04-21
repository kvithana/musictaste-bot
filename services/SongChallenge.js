const date = require('date-fns');
const admin = require('firebase-admin');
const API = require('../services/musictasteAPI');
const _ = require('lodash');

class SongChallenge {
    /**
     * @param {string} channelId
     */
    constructor(channelId, channelName) {
        this.cid = channelId;
        this.cName = channelName;
        this.prompt = null;
        this.playlistId = null;
        this.playlistOwnerId = null;
        this.playlistOwnerDiscordId = null;
        this.promptId = null;
    }

    /**
     * Gets today's prompt from the Firestore as well as relevant playlist data.
     * @param {API} api
     */
    async getPrompt(api) {
        if (this.prompt && date.isToday(this.prompt.date.toDate())) {
            return this.prompt;
        } else {
            const docName = date.format(new Date(), 'yyyy-MM-dd');
            console.log(docName);
            this.promptId = docName;
            const prompt = await admin
                .firestore()
                .collection('song-challenge')
                .doc(docName)
                .get();
            await admin
                .firestore()
                .collection('discord')
                .doc(this.cid)
                .collection('activities')
                .doc('song-challenge')
                .collection('prompts')
                .doc(this.promptId)
                .set({ date: new Date() });
            if (prompt.exists) {
                this.prompt = prompt.data();
            } else {
                throw Error('No prompt found');
            }
            const channelDoc = await admin
                .firestore()
                .collection('discord')
                .doc(this.cid)
                .collection('activities')
                .doc('song-challenge')
                .get();
            if (!channelDoc.exists) {
                const playlistId = await api.sptfy.createCollabPlaylist(
                    api.userDoc.spotifyID,
                    this.cName,
                );
                await admin
                    .firestore()
                    .collection('discord')
                    .doc(this.cid)
                    .collection('activities')
                    .doc('song-challenge')
                    .set({
                        started: new Date(),
                        playlistId,
                        playlistUser: api.mtUID,
                        discordUser: api.discordId,
                    });
                this.playlistId = playlistId;
                this.playlistOwnerDiscordId = api.discordId;
            } else {
                const data = channelDoc.data();
                this.playlistId = data.playlistId;
                this.playlistOwnerDiscordId = data.discordUser;
            }
            this.playlistOwnerId = api.mtUID;
            return this.prompt;
        }
    }

    async getChannelData() {
        console.log('song challenge channel id', this.cid);
        const channelDoc = await admin
            .firestore()
            .collection('discord')
            .doc(this.cid)
            .collection('activities')
            .doc('song-challenge')
            .get();
        const data = channelDoc.data();
        this.playlistId = data.playlistId;
        this.playlistOwnerDiscordId = data.discordUser;
        this.playlistOwnerId = data.playlistUser;
    }

    /**
     * Adds a song to today's prompt if the user hasn't already added a song.
     * @param {API} api
     * @param {string} trackId
     */
    async addSongToPrompt(api, trackId) {
        await this.getChannelData();
        const response = await admin
            .firestore()
            .collection('discord')
            .doc(this.cid)
            .collection('activities')
            .doc('song-challenge')
            .collection('prompts')
            .doc(this.promptId)
            .collection('responses')
            .doc(api.mtUID)
            .get();
        if (response.exists) {
            return false;
        } else {
            console.log('playlist owner', this.playlistOwnerDiscordId);
            if (!this.playlistOwnerDiscordId) {
                return false;
            }
            const _api = new API(this.playlistOwnerDiscordId);
            await _api.isUser();
            await _api.sptfy.addTracksToPlaylist(this.playlistId, [trackId]);
            await admin
                .firestore()
                .collection('discord')
                .doc(this.cid)
                .collection('activities')
                .doc('song-challenge')
                .collection('prompts')
                .doc(this.promptId)
                .collection('responses')
                .doc(api.mtUID)
                .set({
                    trackId,
                    displayName: api.userDoc.displayName,
                    addedDate: new Date(),
                });
            return true;
        }
    }

    /**
     * Checks if a response already exists for today in a user.
     * @param {API} api
     */
    async responseExists(api) {
        const response = await admin
            .firestore()
            .collection('discord')
            .doc(this.cid)
            .collection('activities')
            .doc('song-challenge')
            .collection('prompts')
            .doc(this.promptId)
            .collection('responses')
            .doc(api.mtUID)
            .get();
        if (response.exists) {
            return true;
        }
        return false;
    }

    /**
     * Get recent responses to today's prompt with relevant Spotify track data.
     * @param {API} api
     */
    async getRecentResponses(api) {
        const responses = await admin
            .firestore()
            .collection('discord')
            .doc(this.cid)
            .collection('activities')
            .doc('song-challenge')
            .collection('prompts')
            .doc(this.promptId)
            .collection('responses')
            .orderBy('addedDate', 'desc')
            .limit(5)
            .get();
        const formattedData = responses.empty
            ? []
            : await Promise.all(
                  responses.docs.map(async (d) => {
                      const data = d.data();
                      const trackData = await api.sptfy.getTrack(
                          data.trackId.replace('spotify:track:', ''),
                      );
                      return {
                          displayName: data.displayName,
                          track: trackData,
                      };
                  }),
              );
        return formattedData;
    }

    /**
     * Get responses to a prompt date.
     * @param {API} api
     */
    async getResponses(api, dateString) {
        const prompt = await admin
            .firestore()
            .collection('song-challenge')
            .doc(dateString)
            .get()
            .then((d) => (d.exists ? d.data().string : undefined));
        if (!prompt) {
            return { prompt, data: [] };
        }
        const responses = await admin
            .firestore()
            .collection('discord')
            .doc(this.cid)
            .collection('activities')
            .doc('song-challenge')
            .collection('prompts')
            .doc(dateString)
            .collection('responses')
            .orderBy('addedDate', 'asc')
            .limit(20)
            .get();
        const formattedData = responses.empty
            ? []
            : await Promise.all(
                  responses.docs.map(async (d) => {
                      const data = d.data();
                      const trackData = await api.sptfy.getTrack(
                          data.trackId.replace('spotify:track:', ''),
                      );
                      return {
                          displayName: data.displayName,
                          track: trackData,
                      };
                  }),
              );
        return { prompt, data: formattedData };
    }
}

module.exports = SongChallenge;
