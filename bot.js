require('dotenv').load();

var Discord = require("discord.js");
import db from './config/database';
import Character from './models/character';
import Command from './models/command';
import Warden from './workers/warden';

var bot = new Discord.Client();
const warden = new Warden();

const COMMAND_PREFIX = "!";

db.init = async () => { 
    let res = await Character.allCharacters(); 
    console.log(res);

    warden.watch(report);
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
    let res = '```css\nCOMMANDS:\n```\n```\n';
    Object.keys(commands).forEach(key => {
        res += `${commands[key].name} : ${commands[key].description}\n`;
    });

    res += "```\n👋"

    msg.channel.send(res);
}

async function daily (msg, info) {
    if (!info) info = '***<attachment or external reference>***';

    let char = await RetrieveCharacter(msg.author);

    msg.react("🔥");

    let streak = char.data.streak || 0;

    if (!char.data.checked_in) streak++;

    char.update({
        contributions: char.data.contributions + 1,
        checked_in: 1,
        demerits: 0,
        enlisted: 1,
        latest_update: info,
        streak: streak
    });
}

async function report (msg) {
    const channel = (msg) ? msg.channel : bot.channels.get(process.env.REPORT_CHANNEL)
    var res = '```\nREPORT:\n```\n';

    let chars = await Character.allCharacters();

    const formattedNumber = (amt, len) => {
        if (!amt) return '0';
        return `${parseFloat(amt).toFixed(len || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
    }

    Object.keys(chars).forEach(key => {
        let char = new Character(chars[key]);

        if (!char.data.enlisted) return true;

        res += `**${char.data.name}** _Level ${char.data.level}_ — ` + 
        `Dailies: ${char.data.contributions} total — Streak **${char.data.streak}x** — (_${char.data.demerits} days missed_) ${formattedNumber(char.data.total_xp)} xp\n    > Last Update: _${char.data.latest_update}_\n\n`;
    });

    channel.send(res);
}

async function enlist (msg) {
    let char = await RetrieveCharacter(msg.author);
    
    msg.react("💪");

    char.update({enlisted: 1});
}

async function optout (msg, info) {
    try {
        let char = info ? await Character.byName(info) : await RetrieveCharacter(msg.author)
        
        if (char) {
            char.update({enlisted: 0});
            msg.channel.send(`${char.data.name} won't receive demerits from missing daily updates fyi`);
        }
        else msg.channel.send(`couldn't locate.. ${info} 🤔`);
        
    }
    catch (er) {
        console.log(er);
    }

    
}

async function wallet (msg) {
    let char = await RetrieveCharacter(msg.author);

    msg.channel.send('```css\n' + `${char.data.name} has ${char.data.gold} gold... 💰` + '\n```');
}

async function gift (msg, info) {
    var cmds = info.split(' ');

    var amountToSend = parseFloat(cmds.pop());

    var toChar = null; 
    try {
        let name = cmds.join(' ');
        if (name.indexOf('<@') === 0) {
            name = name.replace('<@', '').replace('>', '');
            const char = new Character();
            await char.findById(name);
            toChar = char;
        }
        else 
            toChar = await Character.byName(name);
            
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
            if (!res || !Object.keys(res).length) {
                char.mapData(Character.creationTemplate(author));
                char.create().then(() => {
                    resolve(char);
                });

                return;
            }

            resolve(char);
        });
    });
}

async function ProcessCommand (msg) {
    console.log(msg.content);
    let info = msg.content.replace(COMMAND_PREFIX, '').replace('\n', ' ').trim().split(' ');
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
