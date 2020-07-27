const path = require('path');
const dotenv = require('dotenv');
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });
const restify = require('restify');
const { BotFrameworkAdapter } = require('botbuilder');
const { EchoBot } = require('./bot');

const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log('\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator');
    console.log('\nTo talk to your bot, open the emulator select "Open Bot"');
});

// const adapter = new BotFrameworkAdapter({
//     appId: process.env.MicrosoftAppId,
//     appPassword: process.env.MicrosoftAppPassword
// });

const adapter = new BotFrameworkAdapter({
    appId: "",
    appPassword: ""
});

const onTurnErrorHandler = async (context, error) => {
    console.error(`\n [onTurnError] unhandled error: ${error}`);
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${error}`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );
    await context.sendActivity('The bot encountered an error or bug.');
    await context.sendActivity('To continue to run this bot, please fix the bot source code.');
};

adapter.onTurnError = onTurnErrorHandler;

const myBot = new EchoBot();

server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await myBot.run(context);
    });
});

server.on('upgrade', (req, socket, head) => {
    const streamingAdapter = new BotFrameworkAdapter({
        appId: process.env.MicrosoftAppId,
        appPassword: process.env.MicrosoftAppPassword
    });
    streamingAdapter.onTurnError = onTurnErrorHandler;
    streamingAdapter.useWebSocket(req, socket, head, async (context) => {
        await myBot.run(context);
    });
});