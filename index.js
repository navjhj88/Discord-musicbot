//discord.js
const Discord = require('discord.js');
const { Client, MessageEmbed } = require('discord.js');
const bot = new Discord.Client();
//디코 봇 토큰 token
// const token = 'your token';

//youtube API
const Youtube = require('youtube-node');
const youtube = new Youtube();
//YouTube Data API v3 개인key값
// youtube.setKey(your key);

//else
const ytdl = require('ytdl-core');
const youtubeInfo_embed = {
    color: '#00fa9a',
    title: '재생목록에 추가됨!',
    description: ''
};
const helpEmbed = {
    "title": "도움말",
    "description": "Discord-musicbot",
    "color": 12451840,
    "fields": [
        {
            "name": "/help",
            "value": "print help"
        },
        {
            "name": "/join",
            "value": "Join the voice channel"
        },
        {
            "name": "/leave",
            "value": "leave the voice channel"
        },
        {
            "name": "/p",
            "value": "/p (url or keyword)"
        },
    ]
};

//state
bot.on('ready', () => {
    console.log('봇 작동중...');
    bot.user.setActivity('작동', { type: 'PLAYING' })
});

//get MSG
bot.on('message', msg => {
    if (msg.content.indexOf('/p ') != -1) {
        msg.react('👌')
        let keyword = msg.content.substr(2).trim()
        console.log(keyword)
        let url = ''

        //// 검색 옵션
        youtube.addParam('type', 'video');

        //search
        youtube.search(keyword, 1, function (err, result) {
            if (err) { console.log(err); return; }
            let title = result["items"][0]["snippet"]["title"];
            url = `https://www.youtube.com/watch?v=${result["items"][0]["id"]["videoId"]}`
            console.log(url);
            youtubeInfo_embed.description = title;
            msg.channel.send({ embed: youtubeInfo_embed });
        });

        //play
        msg.member.voice.channel.join().then(connection => {
            const dispatcher = connection.play(ytdl(url, { filter: 'audioonly' }), { volume: 0.1 });
            dispatcher.on('start', () => {
                bot.on('message', msg => {
                    if (msg.content === '/pause') {
                        msg.react('⏸');
                        dispatcher.pause();
                    } else if (msg.content === '/play') {
                        msg.react('⏯');
                        dispatcher.resume();
                    } else if (msg.content === '/stop') {
                        msg.react('🛑');
                        dispatcher.destroy();
                    }
                });
            });
            dispatcher.on('finish', () => {
                msg.channel.send('재생 끝')
            });
        });
    } else if (msg.content === '/join') {
        if (msg.member.voice.channel) {
            msg.member.voice.channel.join();
        } else {
            msg.reply('음성채널 들어가서불러! ＠・へ・＠')
        }
    } else if (msg.content === '/leave') {
        if (msg.member.voice.channel) {
            msg.react('👋')
            msg.member.voice.channel.leave()
        } else {
            msg.reply('음성채널에 들어간적이 없어! ＠・へ・＠')
        }
    } else if (msg.content === '/help') {
        msg.channel.send({ embed: helpEmbed })
    }
});

bot.login(token);