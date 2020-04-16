const Discord = require('discord.js');

const LinkAccount = () => {
    const embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle('Link Your Account!')
        .setURL('https://musictaste.space/discord')
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            'Link your musictaste.space account with your Discord profile.',
        );
    return embed;
};

module.exports = LinkAccount;
