const { Message } = require('discord.js');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const date = require('date-fns');
const _ = require('lodash');

const Match = require('../embeds/Match');

const sentences = [
    'Working my magic on',
    'Using my big brain to calculate the compatibility of',
    'Let me see... Calculating compatibility of',
    'Checking the compatibility of',
    'Creating a GUI in Visual Basic for',
    'Thinking really hard about the compatibility of',
    'Colliding the musical electrons of',
    'Calculating the angle of refraction of',
    'Learning particle physics to determine the compatibiliy of',
    'Breaking the sound barrier for',
    'Using my last brain cell to calculate the compatibility of',
];

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
        const taggedUserMention = message.mentions.users.first();
        if (!taggedUserMention) {
            return message.channel.send(
                'You need to @mention a user to approve their match request.',
            );
        } else {
            const matchUserData = worker.verifyMatch(
                message.author.id,
                taggedUserMention.id,
            );

            if (!matchUserData) {
                return message.reply(
                    `looks like <@${taggedUserMention.id}> hasn't requested a match, or the request expired.`,
                );
            }
            const user = await api.getUser();
            const matchUser = await api.getUser(matchUserData.uid);
            if (_.has(user, 'importData.lastImport')) {
                const importDate = _.get(
                    user,
                    'importData.lastImport',
                ).toDate();
                console.log(date.differenceInDays(new Date(), importDate) > 7);
                if (date.differenceInDays(new Date(), importDate) > 7) {
                    message.channel.send(
                        `<@${message.author.id}>, your Spotify data is old, let me import it again...`,
                    );
                    await api.importSpotifyData();
                    message.channel.send(
                        `<@${message.author.id}>, I've finished importing your data!`,
                    );
                }
            }
            if (_.has(matchUser, 'importData.lastImport')) {
                const importDate = _.get(
                    matchUser,
                    'importData.lastImport',
                ).toDate();
                console.log(date.differenceInDays(new Date(), importDate) > 7);
                if (date.differenceInDays(new Date(), importDate) > 7) {
                    message.channel.send(
                        `<@${taggedUserMention.id}>, your Spotify data is old, let me import it again...`,
                    );
                    await api.importSpotifyData(matchUserData.uid);
                    message.channel.send(
                        `<@${taggedUserMention.id}>, I've finished importing your data!`,
                    );
                }
            }
            message.channel.send(
                `${_.sample(sentences)} <@${message.author.id}> and <@${
                    taggedUserMention.id
                }>...`,
            );
            const matchData = await api.compareUser(matchUserData.uid, true);
            console.log(matchData);
            message.channel.send(
                Match(
                    user,
                    matchData,
                    message.member.displayName,
                    matchUserData.displayName,
                ),
            );
        }
    };
    return fn;
};

module.exports = {
    name: 'accept',
    description:
        'Accepts an incoming match request from a mentioned user, if one exists.',
    shortDescription: 'Accepts an incoming match request.',
    args: true,
    guildOnly: true,
    usage: '<@mention>',
    example: '@Poppy',
    alias: ['approve'],
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
