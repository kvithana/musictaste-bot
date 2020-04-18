const { Message } = require('discord.js');
const CommandHelp = require('../embeds/CommandHelp');
const Commands = require('../embeds/Commands');

/**
 * @param {Message} message
 * @param {Array<string>} args
 */
const command = async (message, args) => {
    const { commands } = message.client;
    const client = message.client;
    const commandData = commands.filter((command) => !command.hidden);
    if (!args.length) {
        return message.reply(Commands(commandData));
    } else {
        const commandString = args[0];
        const command =
            client.commands.get(commandString) ||
            client.commands.find(
                (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
            );

        if (!command || command.hidden) {
            return message.reply(`${args[0]} is not a supported command.`);
        }
        message.reply(CommandHelp(command));
    }
};

module.exports = {
    name: 'help',
    description: 'Get help about the usage of a command.',
    args: false,
    example: 'me',
    alias: ['h'],
    usage: '[command]',
    execute: command,
};
