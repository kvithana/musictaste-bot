const { Message } = require('discord.js');
const _ = require('lodash');
const API = require('../services/musictasteAPI');
const TaskMaster = require('../services/TaskMaster');
const { shortPrefix, matchTimeout } = require('../config.json');

// embeds
const LinkAccount = require('../embeds/LinkAccount');

/**
 * @param {TaskMaster} worker
 * @param {API} api
 */
const command = (worker, api) => {
    /**
     * Compare music tastes with a user.
     * @param {Message} message
     * @param {Array<string>} args
     */
    const match = async (message, args) => {
        const pf = args[args.length - 1] === 'playlist';
        const taggedUserMention = message.mentions.users.first();
        if (!taggedUserMention) {
            return message.channel.send(
                'You need to @mention a user to match with them.',
            );
        }
        if (taggedUserMention.id === message.author.id) {
            return message.channel.send(
                "You can't match with yourself, silly.",
            );
        }
        const taggedDiscordId = taggedUserMention.id;
        const taggedUserId = await api.getUIDForDiscordId(taggedDiscordId);
        const taggedUserData = await api.getUser(taggedUserId);
        if (!taggedUserId) {
            message.channel.send(
                `<@${taggedDiscordId}> hasn't linked their musictaste.space account, try \`${shortPrefix} link\`.`,
            );
            return message.channel.send(LinkAccount());
        }
        if (!_.get(taggedUserData, 'importData.exists', false)) {
            message.channel.send(
                `<@${taggedDiscordId}> hasn't imported their data yet. Tell them to run \`${shortPrefix} import\`.`,
            );
        }
        worker.setRequestMatch(message.author.id, taggedDiscordId, {
            uid: api.mtUID,
            displayName: message.member.displayName,
        });
        return message.channel.send(
            `Hey, <@${taggedDiscordId}>! <@${
                message.author.id
            }> wants to compare music tastes. To approve, type \`${shortPrefix} accept @${
                message.member.displayName
            }\`. You will share your Spotify profile with people you match with. This request will expire after ${Math.floor(
                matchTimeout / 1000 / 60,
            )} mins.`,
        );
    };
    return match;
};

module.exports = {
    name: 'match',
    description:
        'Compare music tastes by matching with a user. \
        The user must already have a musictaste.space account and have linked their Discord account.',
    shortDescription: 'Compare music tastes with a user.',
    alias: ['m'],
    args: true,
    guildOnly: true,
    usage: '<mention>',
    example: '@Billy',
    execute: command,
    useServices: true,
    withServices: (worker, api) => ({ execute: command(worker, api) }),
};
