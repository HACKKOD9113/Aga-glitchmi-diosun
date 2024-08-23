const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');
const commandHandler = require('./commandHandler');
const express = require('express');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

client.once('ready', () => {
    console.log(`${client.user.tag} olarak giriş yapıldı!`);

    // Botun durumunu "boşta" olarak ayarla ve aktiviteyi güncelle
    client.user.setPresence({
        status: 'idle',
        activities: [{
            name: 'f!help | Komutlar için',
            type: 'WATCHING'
        }]
    });

    // Botun olması gereken açıklamasını konsola yazdır (bilgi amaçlı)
    const description = "Frost Bot sizinle beraber! Komutlarını öğrenmek için f!help komutunu kullanabilirsiniz. Yardıma ihtiyacınız varsa veya herhangi bir sorunuz varsa destek sunucusuna gelebilirsiniz. Destek sunucusu: https://discord.com/invite/me5deq8u";
    console.log("Bot açıklaması (Discord Developer Portal'da ayarlanmalı):", description);
});

client.on('messageCreate', commandHandler);

client.login(token);

const app = express();
const port = 3100; // buraya karışmayın.

app.get('/', (req, res) => res.send('we discord')); // değiştirebilirsiniz.

app.listen(port, () =>
    console.log(`Bot bu adres üzerinde çalışıyor: http://localhost:${port}`) // port
);