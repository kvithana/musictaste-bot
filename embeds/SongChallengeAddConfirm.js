const Discord = require('discord.js');
const { shortPrefix } = require('../config.json');

const SongChallengeAddConfirm = (trackData, prompt, displayName) => {
    const embed = new Discord.MessageEmbed()
        .setColor('#1DB954')
        .setTitle(`${displayName}'s Song Challenge Pick`)
        .setAuthor(
            'musictaste.space',
            'https://musictaste.space/discord-icon.png',
            'https://musictaste.space',
        )
        .setDescription(
            `Are you sure you want to add this song as your response to today's prompt? \
            You can't remove a pick for today after you confirm.`,
        )
        .setThumbnail(trackData.image)
        .addField('Prompt', prompt)
        .addField(
            'Your Pick',
            `[${trackData.name}](${trackData.url})\n_${trackData.artist}_`,
        )
        .addField(
            'Confirm',
            `Confirm your choice by typing \`${shortPrefix} prompt confirm\`, or send me something else.`,
        );

    return embed;
};

module.exports = SongChallengeAddConfirm;
