const Discord = require('discord.js');

const LinkAccount = () => {
    const embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle('musictaste.space - Link Account')
        .setURL('https://musictaste.space')
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            'musictaste.space lets you see how compatible your music taste is with your friends based on your Spotify data.\n\nTo use the discord bot, you will need to link your Discord account.',
        )
        .addField(
            'Link Your Account',
            '[Click Here](https://musictaste.space/discord)',
            true,
        )
        .addField(
            'Make An Account',
            '[Click Here](https://musictaste.space/)',
            true,
        )
        .setThumbnail(
            'https://developer.spotify.com/assets/branding-guidelines/icon4@2x.png',
        )
        .setFooter(
            'musictaste.space created by Kalana Vithana and not affiliated with Spotify.',
        );
    return embed;
};

module.exports = LinkAccount;
