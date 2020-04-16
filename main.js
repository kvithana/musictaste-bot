const Discord = require('discord.js');
const { prefix, shortPrefix } = require('./config');
const admin = require('firebase-admin');
const fs = require('fs');

const API = require('./services/musictasteAPI');
const ChannelManager = require('./services/ChannelManager');

// import environment variables
require('dotenv').config();

// embeds
const LinkAccount = require('./embeds/LinkAccount');

// initialise Discord client
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.login(process.env.DISCORD_TOKEN);

// import Firebase config
const serviceAccount = require('./service-account.js');

// initialise Firebase SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://spotify-compatibility.firebaseio.com',
});

// initialise channel manager
const CM = new ChannelManager();

// load commands
const commandFiles = fs
    .readdirSync('./commands')
    .filter((file) => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log('Ready!');
    client.user.setActivity('!musictaste');
    console.log(`Listening for prefixes: ${prefix} ${shortPrefix}`);
});

client.on('message', async (message) => {
    if (
        !(
            message.content.startsWith(prefix + ' ') ||
            message.content.startsWith(shortPrefix + ' ')
        ) ||
        message.author.bot
    ) {
        return;
    }
    console.log('running.');
    const args = message.content.startsWith(prefix)
        ? message.content.slice(prefix.length + 1).split(/ +/)
        : message.content.slice(shortPrefix.length + 1).split(/ +/);

    console.log(args);
    const commandString = args.shift().toLowerCase();

    console.log('command', commandString, 'args', args);
    const tm = CM.getTaskMaster(message.channel.id);

    const command =
        client.commands.get(commandString) ||
        client.commands.find(
            (cmd) => cmd.aliases && cmd.aliases.includes(commandName),
        );

    if (!command) {
        return;
    }

    try {
        // check if user has been linked.
        const api = new API(message.author.id);
        const isUser = await api.isUser();
        if (!isUser) {
            message.channel.send(LinkAccount());
            return message.reply("you'll need to link your account first.");
        }

        if (command.args && !args.length) {
            let reply = `You didn't give me any arguments, ${message.member.displayName}.`;

            if (command.usage) {
                reply += `\nThe proper usage would be: \`${shortPrefix} ${command.name} ${command.usage}\``;
            }
            return message.channel.send(reply);
        }
        // add API services as params if required
        const cmd = command.useServices
            ? command.withServices(tm, api)
            : command;
        // execute command
        cmd.execute(message, args);
    } catch (error) {
        console.error(error);
        message.reply('there was an error trying to execute that command!');
    }
});
