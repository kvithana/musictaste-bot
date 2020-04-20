const Discord = require('discord.js');
const { prefix, shortPrefix } = require('../config.json');

const CommandHelp = (command) => {
    let embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`${prefix} \`${command.name}\``)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(`${command.description}`)
        .addField(
            'Usage',
            command.usage
                ? `\`${shortPrefix} ${command.name} ${command.usage}\``
                : `\`${shortPrefix} ${command.name}\``,
            true,
        );
    if (command.example) {
        embed = embed.addField(
            'Example',
            `\`${shortPrefix} ${command.name} ${command.example}\``,
        );
    }
    if (command.alias) {
        embed = embed.addField(
            'Alias',
            command.alias.map((a) => `\`${a}\``).join(', '),
            true,
        );
    }

    embed = embed
        .addField('Arguments Required', `${command.args ? 'Yes' : 'No'}`, true)
        .addField('Guild Only', `${command.guildOnly ? 'Yes' : 'No'}`, true)
        .setThumbnail('https://musictaste.space/discord-icon.png')
        .setFooter('musictaste.space created by Kalana Vithana.');
    return embed;
};

module.exports = CommandHelp;
