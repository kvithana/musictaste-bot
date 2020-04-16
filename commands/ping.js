const _ = require('lodash');

const responses = [
    'Bong!',
    'Ping?',
    'Beep boop.',
    'Yellow',
    'Yes, I am alive.',
    'Pong.',
    'Bop!',
    'Hiya!',
    "Yep, it's me!",
    'Cheese!',
    'Cheerio.',
    'pong....',
];

module.exports = {
    name: 'ping',
    description: 'Ping!',
    args: false,
    execute: (message, args) => message.channel.send(_.sample(responses)),
};
