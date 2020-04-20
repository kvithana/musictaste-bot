const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const date = require('date-fns');

const SongChallengeAddConfirm = require('../embeds/SongChallengeAddConfirm');
const SongChallengePrompt = require('../embeds/SongChallengePrompt');
const SongChallengeHistory = require('../embeds/SongChallengeHistory');
const { shortPrefix } = require('../config.json');

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
        if (!args.length) {
            const prompt = await worker.songChallenge.getPrompt(api);
            const responses = await worker.songChallenge.getRecentResponses(
                api,
            );
            return message.reply(SongChallengePrompt(prompt.string, responses));
        }
        switch (args[0]) {
            case 'respond':
                args.shift();
                if (!args.length) {
                    return message.reply(
                        'you need to specify a Spotify track URL or URI to reply to a prompt',
                    );
                }
                const track = args[0];
                let trackId;
                if (track.startsWith('https://open.spotify.com/track/')) {
                    try {
                        trackId =
                            'spotify:track:' +
                            track
                                .replace('https://open.spotify.com/track/', '')
                                .split('?')[0];
                    } catch (e) {
                        return message.reply(
                            "you didn't give a valid Spotify URL.",
                        );
                    }
                }
                if (track.startsWith('spotify:track:')) {
                    trackId = track;
                }
                if (args.join(' ').length > 5) {
                    console.log(args);
                    const search = await api.sptfy.searchTracks(args.join(' '));
                    if (search && search.length) {
                        trackId = `spotify:track:${search[0].id}`;
                    }
                }
                if (!trackId) {
                    return message.reply(
                        `you didn't give me a valid Spotify URL, URI or search parameter. Need help? Try \`${shortPrefix} help prompt\``,
                    );
                }
                console.log('trackId', trackId);
                await worker.songChallenge.getPrompt(api);
                await api.armSpotify();
                await api.isUser(); // hacky attempted fix for Spotify token bug
                await api.armSpotify(); // hacky attempted fix for Spotify token bug
                const trackData = await api.sptfy.getTrack(
                    trackId.replace('spotify:track:', ''),
                );
                if (trackData) {
                    const exists = await worker.songChallenge.responseExists(
                        api,
                    );
                    if (exists) {
                        return message.reply(
                            "you've already added a song for today, come back tomorrow!",
                        );
                    }
                    worker.setTrackResponse(message.author.id, trackId);
                    message.reply('please confirm your choice.');
                    return message.channel.send(
                        SongChallengeAddConfirm(
                            trackData,
                            worker.songChallenge.prompt.string,
                            message.member.displayName,
                        ),
                    );
                }
                return message.reply(
                    "I couldn't find that track on Spotify, did you send me the right URL or URI?",
                );
            case 'playlist':
                await worker.songChallenge.getPrompt(api);
                return message.reply(
                    `here you go! https://open.spotify.com/playlist/${worker.songChallenge.playlistId}`,
                );
            case 'confirm':
                const tId = worker.verifyTrackResponse(message.author.id);
                if (tId) {
                    await worker.songChallenge.addSongToPrompt(api, tId);
                    return message.reply(
                        'done! Your song has been added to the collaborative playlist. You can get the link with ' +
                            `\`${shortPrefix} prompt playlist\``,
                    );
                } else {
                    return message.reply(
                        `looks like you haven't sent me a track yet, or you didn't confirm your last track in time. Send me another one with \`${shortPrefix} prompt respond\``,
                    );
                }
            case 'history':
                args.shift();
                const ds = args.join(' ');
                let d;
                if (!args.length) {
                    d = new Date();
                } else if (ds === 'today') {
                    d = new Date();
                } else if (ds === 'yesterday' || ds === 'yday') {
                    d = date.addDays(new Date(), -1);
                } else {
                    try {
                        d = new Date(ds);
                        if (date.differenceInYears(new Date(), d) > 2) {
                            d.setFullYear(new Date().getFullYear());
                        }
                    } catch (e) {
                        return message.reply(
                            "I don't understand that date, oops.",
                        );
                    }
                }
                if (d) {
                    const docName = date.format(d, 'yyyy-MM-dd');
                    const data = await worker.songChallenge.getResponses(
                        api,
                        docName,
                    );
                    if (data && data.data.length) {
                        return message.reply(
                            SongChallengeHistory(data.prompt, data.data, d),
                        );
                    }
                    return message.reply(
                        'looks like I have no data from that day.',
                    );
                }
                return message.reply("I don't understand that date, oops.");
            default:
                message.reply(
                    `that's not a valid prompt command. Need help? Try \`${shortPrefix} help prompt\``,
                );
        }
        console.log();
    };
    return fn;
};

module.exports = {
    name: 'prompt',
    description: `Each day, get a prompt for everyone in the server to respond to. All responses are added to a collaborative playlist which users can follow! \n
    Calling this command with no arguments will give today's prompt. There are several sub-commands available: \n
    * \`respond <query | Spotify URL | URI>\`: respond to today's prompt.\n
    * \`confirm\`: confirm your selection after using \`respond\`\n
    * \`history <date>\`: see how people responded to a prompt in the past. Format a day like \`May 12\`, \`today\`, \`yesterday\` \n
    * \`playlist\`: get the link to the channel's collabrative playlist`,
    shortDescription:
        "Interact with today's daily song challenge with the rest of your server",
    args: false,
    usage: '[<respond> <query | spotify track URL | URI>] [confirm] [playlist]',
    example: 'repond Mr. Brightside',
    alias: ['p'],
    guildOnly: true,
    execute: command,
    useServices: true,
    hidden: false,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
