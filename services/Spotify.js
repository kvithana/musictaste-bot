/**
 * Spotify service to intialise Spotify API.
 */

const SpotifyWebApi = require('spotify-web-api-node');
const admin = require('firebase-admin');

class SpotifyProvider {
    /**
     * Creates a Spotify Provider. Always call `.checkToken(token)` after
     * creating the provider to ensure a fresh token is being used.
     * @param {*} userId
     */
    constructor(userId) {
        this.spotify = new SpotifyWebApi({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
        });
        this.userId = userId;
    }

    /**
     * Checks if Spotify token is valid and refreshes if it isn't.
     * @param {string} token
     */
    async checkToken(token) {
        this.spotify.setAccessToken(token);
        const validToken = await this.spotify
            .getMe()
            .then(() => true)
            .catch(() => false);
        if (!validToken) {
            await this.refreshSpotifyToken(this.userId);
        }
        return true;
    }

    /**
     * Pulls user data and refreshes Spotify token.
     * @param {string} userId
     */
    async refreshSpotifyToken(userId) {
        console.log('Refreshing access token...');
        let accessToken;
        let refreshToken;
        await admin
            .firestore()
            .collection('users')
            .doc(userId)
            .get()
            .then((doc) => {
                accessToken = doc.data().accessToken;
                refreshToken = doc.data().refreshToken;
                return;
            })
            .catch((err) => {
                console.log(err);
                throw new Error(
                    'Error with retrieving accessToken for user from database',
                );
            });
        this.spotify.setAccessToken(accessToken);
        this.spotify.setRefreshToken(refreshToken);
        const token = await this.spotify
            .refreshAccessToken()
            .then(async (res) => {
                await admin.firestore().collection('users').doc(userId).set(
                    {
                        accessToken: res.body.access_token,
                        refreshToken: this.spotify.getRefreshToken(),
                        accessTokenRefresh: new Date(),
                    },
                    { merge: true },
                );
                return res.body.access_token;
            })
            .catch((err) => console.error(err));
        return this.spotify.setAccessToken(token);
    }

    /**
     * Given a Spotify artist URI, returns the name and image of
     * the artist as an object.
     * @param {string} id
     */
    async getArtist(id) {
        return this.spotify
            .getArtist(id)
            .then((artist) => {
                const data = artist.body;
                return {
                    name: data.name,
                    image: data.images[0].url,
                    url: data.external_urls.spotify,
                };
            })
            .catch((err) => console.error('Error with getting artist', err));
    }

    /**
     * Given a Spotify track URI, returns the name, artists and album
     * image as an object.
     * @param {string} id
     */
    async getTrack(id) {
        return this.spotify
            .getTrack(id)
            .then((track) => {
                const data = track.body;
                return {
                    name: data.name,
                    artist: data.artists.map((a) => a.name).join(', '),
                    image: data.album.images[0].url,
                    url: data.external_urls.spotify,
                };
            })
            .catch((err) => console.error('Error with getting track', err));
    }

    /**
     * Given an array ofSpotify track URI, returns an array of the name, artists and album
     * image as an object.
     * @param {string} id
     */
    async getTracks(ids) {
        return this.spotify
            .getTracks(ids)
            .then((tracks) => {
                const trackData = tracks.body;
                return trackData.tracks.map((data) => ({
                    name: data.name,
                    artist: data.artists.map((a) => a.name).join(', '),
                    image: data.album.images[0].url,
                    url: data.external_urls.spotify,
                }));
            })
            .catch((err) =>
                console.error('Error with getting multiple tracks', err),
            );
    }

    /**
     * Given an array of Spotify artist URI, returns an array of the name and image of
     * the artists as an object.
     * @param {string} ids
     */
    async getArtists(ids) {
        return this.spotify
            .getArtists(ids)
            .then((artists) => {
                const artistData = artists.body;
                return artistData.artists.map((data) => ({
                    name: data.name,
                    image: data.images[0].url,
                    url: data.external_urls.spotify,
                }));
            })
            .catch((err) => console.error('Error with getting artist', err));
    }

    /**
     * Given a time range, will return a user's current top songs.
     * @param {"short_term"|"medium_term"|"long_term"} time_range
     * @param {number} limit
     */
    async getTopSongs(time_range = 'short_term', limit = 10) {
        console.log('Getting top songs.', time_range);
        return this.spotify
            .getMyTopTracks({ time_range, limit })
            .then((data) => {
                return data.body.items.map((track) => ({
                    name: track.name,
                    artist: track.artists.map((a) => a.name).join(', '),
                    image: track.album.images[0].url,
                    url: track.external_urls.spotify,
                }));
            })
            .catch((err) =>
                console.error('Error with getting top tracks', err),
            );
    }

    /**
     * Given a time range, will return a user's current top artists.
     * @param {"short_term"|"medium_term"|"long_term"} time_range
     * @param {number} limit
     */
    async getTopArtists(time_range = 'short_term', limit = 10) {
        return this.spotify
            .getMyTopArtists({ time_range, limit })
            .then((data) => {
                return data.body.items.map((artist) => ({
                    name: artist.name,
                    image: artist.images[0].url,
                    url: artist.external_urls.spotify,
                }));
            })
            .catch((err) =>
                console.error('Error with getting top artists', err),
            );
    }

    /**
     * Creates a playlist in a given user account with the specified name and tracks.
     * @param {string} userId
     * @param {string} name
     * @param {Array<string>} tracks
     */
    async createPlaylist(userId, name, tracks) {
        const playlistId = await this.spotify
            .createPlaylist(userId, name, {
                public: false,
            })
            .then((res) => res.body.id)
            .catch((err) => {
                console.error('Error with creating playlist', err);
            });
        if (playlistId) {
            await this.spotify
                .changePlaylistDetails(playlistId, {
                    description:
                        'Created by the Discord bot for musictaste.space!',
                })
                .catch((err) =>
                    console.error(
                        'Error with updating playlist description',
                        err,
                    ),
                );
            await this.spotify
                .addTracksToPlaylist(playlistId, tracks)
                .catch((err) =>
                    console.error(
                        'Error with adding tracks to playlist',
                        playlistId,
                        err,
                    ),
                );
        }
        return playlistId;
    }

    /**
     * Creates a collaborative playlist in a user
     * @param {string} userId
     * @param {string} name
     */
    async createCollabPlaylist(userId, name) {
        const playlistId = await this.spotify
            .createPlaylist(userId, name, {
                public: false,
            })
            .then((res) => res.body.id)
            .catch((err) => {
                console.error('Error with creating playlist', err);
            });

        if (playlistId) {
            await this.spotify
                .changePlaylistDetails(playlistId, {
                    description:
                        'A playlist for the song challenge created by the Discord bot for musictaste.space!',
                    collaborative: false,
                })
                .catch((err) =>
                    console.error(
                        'Error with updating playlist description',
                        err,
                    ),
                );
        }
        return playlistId;
    }

    /**
     * Adds songs to a user's playlist
     * @param {string} playlistId
     * @param {Array<string>} tracks
     */
    async addTracksToPlaylist(playlistId, tracks) {
        await this.spotify.followPlaylist(playlistId);
        await this.spotify
            .addTracksToPlaylist(playlistId, tracks)
            .catch((err) =>
                console.error(
                    'Error with adding tracks to playlist',
                    playlistId,
                    err,
                ),
            );
    }

    async searchTracks(query, limit = 1) {
        console.log('Searching', query);
        return this.spotify.searchTracks(query, { limit }).then((t) =>
            t.body.tracks.items.map((track) => ({
                id: track.id,
                name: track.name,
                artist: track.artists.map((a) => a.name).join(', '),
                image: track.album.images[0].url,
                url: track.external_urls.spotify,
            })),
        );
    }
}

module.exports = SpotifyProvider;
