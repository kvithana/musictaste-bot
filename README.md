# musictaste.space Discord Bot

This Discord bot brings the functionality and interactions possible on [musictaste.space](https://musictaste.space) to Discord servers.

This is made possible by the musictaste.space API which combines user data stored in [Firebase Firestore](https://firebase.google.com/products/firestore) with a collection of [Cloud Functions](https://firebase.google.com/products/functions) to bring full functionality to this Node.js application.

After a user links their musictaste.space account with their Discord account on the website, the commands below are made available.

## Adding To Your Discord Server

You can invite the Discord bot to a guild that you manage by following the Beta link [here](https://musictaste.space/discord).

## Commands

**To use any command, a user must have already linked their musictaste.space account with their Discord account on the website!**

To see usage information, as well as examples, type `!mt help <command>`.

All commands are prefixed by the bot's prefix, which for the live instance is `!musictaste`.

If you get tired of typing `!musictaste`, the bot also accepts the alias `!mt`. Many of the commands have short aliases too, which you check by using the help command above.

-   `me` : Returns you information about your musictaste.space profile.
-   `match <@mention>` : Compare music tastes with a user.
-   `playlist <@mention> [...@mention]` : Create a playlist based off tracks you have in common with a matched user/s.
-   `top <songs|artists> [long|medium|short]` : Get your top songs and artists based off your Spotify data for a given timeframe.
-   `import` : Re-imports your Spotify data to the musictaste.space database.
-   `prompt [respond|accept|playlist]` : See today's daily song challenge for your server and how to respond to it.
-   `recommend <query string|Spotify URI|Spotify URL> [playlist]` : Recommends you a track or gives you a playlist based off some inspiration.
-   `ping` : Ping to bot!
-   `help` : ...what do you think?

There may be other commands, type `!mt help` to see them all after inviting the bot to a server.

## Development

**You cannot develop this bot without the relevant `.env` file and Firebase `service-account.js`.**

### Quick Start

When developing, remember to change `prefix` and `shortPrefix` in `config.json` to something other than the live bot ones so you can run commands locally.

```
yarn start
```

### Command Loading

All commands under `/commands` are loaded automatically to be used by the bot. Each command must be exported with the following properties which help determine the usage as well as automatically create the help information about the bot.

These attributes are:

-   `name`: The primary name that users type to access this command.
-   `description` : The long description for the command. Comes up with the usage of `help <command>`.
-   `shortDescription`: A short description of what the command does. Comes up in list for `help`.
-   `args` : A boolean flag which states whether the command requires arguments or if it should be rejected before execution when none are provided.
-   `usage`: A string to explain the usage. eg. `<@mention> [playlist]`. The prefix is auto appended when displayed to user.
-   `example`: A string with an example usage of the command. eg. `@Poppy`. The prefix is auto appended when displayed to user.
-   `alias`: An array of strings which act as aliases for the command.
-   `guildOnly`: A boolean flag to determine whether the command can only be used in a guild.
-   `useServices`: A boolean flag to determine whether the API service should be injected to the execution of this command. In certain cases, we don't need the API. eg. `ping`. When it is set to `true`, additional `api` and `worker` variables are made available to the command.

### Channel Manager

This is more of a Guild Manager than a Channel Manager to be honest. It's a simple interface to provide relevant data for the current guild which the command is being called from. This can be injected into each command as part of the Task Master,

The `getTaskMaster()` method will return the correct Task Master for the guild.

### Task Master

A Task Master manages all existing requests for matches and confirmation of prompt responses within a given server. A unique Task Master exists for each guild being managed by the bot.

### API Instance

An API instance is created on each execution of a command, and is linked to the user who executed the command. Therefore, an API instance which is correctly authorised with the executor's data is available to all command
files which services injected.

Both the API instance (unique to the user) and Task Master (unique to the guild) are injected into the execution context of a command if the `useServices` flag is `true`.

### Cloud Functions

Since the musictaste.space API is provided through Cloud Functions, in `util/cloudFunction.js` you will find a wrapper which abstracts the remote Cloud Function calls and allows for the calling of Cloud Functions as regular async js functions. This is because `https.onCall` is currently unavailble in the Firebase Admin SDK.

Construct a relevant Cloud Function by initialising like:

```
const cFunction = require('<path>/cloudFunction.js')
```

The argument to the cFunction constructor is the name of the Cloud Function endpoint.

```
const createPlaylist = cFunction('createPlaylist')
```

You can then use the `createPlaylist` function like you would any regular function using `await`.

```
const playlistData = await createPlaylist({id, tracks})
```

Feel free to reach out to me on [Twitter](https://twitter.com/_kalpal) if you have any questions.
