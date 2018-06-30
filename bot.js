require('dotenv').load();

var Discord = require("discord.js");
import Character from './models/character';
import Command from './models/command';
import Warden from './workers/warden';
import db from './config/database';

var bot = new Discord.Client();
const warden = new Warden();

const COMMAND_PREFIX = "!";

db.init = async () => { 
    let res = await Character.allCharacters(); 
    console.log(res);

    warden.watch();
}

const commands = [
    new Command({
        name: 'help',
        description: 'list available commands',
        execution: help
    }),
    new Command({
        name: 'daily',
        description: '!daily <msg> | submit your daily update',
        execution: daily
    }),
    new Command({
        name: 'report',
        description: 'list stats of users',
        execution: report
    }),
    new Command({
        name: 'enlist',
        description: 'manually add yourself to reporting duty',
        execution: enlist
    }),
    new Command({
        name: 'optout',
        description: '!optout <user>(optional) | removes user from reporting duty',
        execution: optout
    }),
    new Command({
        name: 'wallet',
        description: 'view your balance of gold',
        execution: wallet
    }),
    new Command({
        name: 'gift',
        description: '!gift <user> <amount> | transfer gold to another user',
        execution: gift
    }),
];

function help (msg) {
    let res = `COMMANDS:\n`;
    Object.keys(commands).forEach(key => {
        res += `!${commands[key].name} : ${commands[key].description}\n`;
    });

    res += "👋"

    msg.channel.send(res);
}

async function daily (msg, info) {
    if (!info) return;

    let char = await RetrieveCharacter(msg.author);

    msg.react("🔥");

    char.update({
        contributions: char.data.contributions + 1, 
        checked_in: 1, 
        enlisted: 1, 
        latest_update: info, 
        streak: (char.data.streak == 0) ? 1 : char.data.streak
    });
}

async function report (msg) {
    var res = 'REPORT:\n';

    let chars = await Character.allCharacters();

    Object.keys(chars).forEach(key => {
        let char = new Character(chars[key]);

        if (!char.data.enlisted) return true;

        res += `**${char.data.name}** _Level ${char.data.level}_ - ` + 
        `Contributions: ${char.data.contributions} - Daily Streak **${char.data.streak}x** - (_${char.data.demerits} Demerits_)\n    > Last Update: ${char.data.latest_update}\n`;
    });

    if (msg.channel) msg.channel.send(res);
    else console.log(res);
}

async function enlist (msg) {
    let char = await RetrieveCharacter(msg.author);

    char.update({enlisted: 1});
}

async function optout (msg, info) {
    let char = info ? await Character.byName(info) : await RetrieveCharacter(msg.author)

    char.update({enlisted: 0});

    if (msg.channel) msg.channel.send(`${char.data.name} won't receive demerits from missing daily updates fyi`);
}

async function wallet (msg) {
    let char = await RetrieveCharacter(msg.author);

    msg.channel.send(`${char.data.name} has ${char.data.gold} gold... 💰`);
}

async function gift (msg, info) {
    var cmds = info.split(' ');

    var amountToSend = parseFloat(cmds.pop());

    var toChar = null; 
    try {
        toChar = await Character.byName(cmds.join(' '));
    } catch (er) { console.error(er); }

    if (!toChar) {
        msg.channel.send('.......wilson!!!!');
        return;
    }

    var fromChar = await RetrieveCharacter(msg.author);

    if (isNaN(amountToSend) || !amountToSend) {
        msg.channel.send('incorrect amount...187 dollars?!?!');
        return;
    }

    fromChar.transferGold(toChar, amountToSend)
    .then(res => {
        msg.channel.send(res);
    }).catch(er => { msg.channel.send(er); });
}

function RetrieveCharacter (author) {
    return new Promise((resolve, reject) => {
        let char = new Character();

        char.findById(author.id).then(res => {
            if (!res) {
                char.mapData(Character.creationTemplate(author));
                char.create();
            }

            resolve(char);
        });
    });
}

async function ProcessCommand (msg) {
    let info = msg.content.replace(COMMAND_PREFIX, '').split(' ');
    let command = info.shift();

    console.log('COMMAND: ' + command);

    Object.keys(commands).forEach(key => {
        if (commands[key].name == command) {
            commands[key].execution(msg, info.length ? info.join(' ').trim() : null);
        }
    })
}

async function ProcessMessage (msg) {
    var char = await RetrieveCharacter(msg.author);

    xpValue = .42;

    var xpValue = msg.content.length / 10.42;

    if (msg.embeds && msg.embeds.length) xpValue += parseFloat(msg.embeds.length * 4.2); //images/youtube links bonus

    if (msg.attachments && msg.attachments.length) xpValue += 21;

    if (msg.mentions && msg.mentions.length) xpValue *= 1.42; //42% bonus if there is a mention

    if (xpValue <= .42 && !msg.content.length) xpValue += 21;

    xpValue *= 1.42;

    char.addXP(xpValue);
}

bot.on("message", function (msg) {
    //If bot message, return
    if (msg.author.id == bot.user.id) return; 

    //If command message, process it and return
    if (msg.content.indexOf(COMMAND_PREFIX) === 0) {
        ProcessCommand(msg);
        return;
    }

    ProcessMessage(msg);
});

bot.on('ready', function () {
     console.log('Bot is now active.');
});

bot.login(process.env.TOKEN);