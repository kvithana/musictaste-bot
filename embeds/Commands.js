const Discord = require('discord.js');
const { prefix, shortPrefix } = require('../config.json');

const CommandHelp = (commands) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`musictaste.space Discord Bot`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            '(This bot is in **beta**!) musictaste.space lets you compare your Spotify music taste with friends! \
            You can see your own top artists and songs, or create playlists with others full of songs you both have in common.\n\n\
            Learn more, look at your data and see matches on the website [here](https://musictaste.space).',
        )
        .setThumbnail('https://musictaste.space/discord-icon.png')
        .setFooter('musictaste.space created by Kalana Vithana.')
        .addField(
            'Alias',
            `Instead of typing \`${prefix}\`, you can also use \`${shortPrefix}\``,
        )
        .addField(
            'How To Use A Command',
            `To see the usage of a command, type \`${shortPrefix} help <command>\``,
        );
    commands.map((command) => {
        embed = embed.addField(
            `\`${command.name}\``,
            command.shortDescription
                ? command.shortDescription
                : command.description,
        );
    });

    return embed;
};

module.exports = CommandHelp;
