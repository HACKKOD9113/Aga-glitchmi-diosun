const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const databasePath = path.join(__dirname, '../database.json');

module.exports = {
    name: 'günlük',
    description: 'Günlük ödülünüzü alın!',
    async execute(message, args) {
        const userId = message.author.id;
        let database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));

        if (!database[userId]) {
            database[userId] = {
                kullaniciAdi: message.author.username,
                bakiye: 0,
                sonGünlük: 0
            };
        }

        const now = Date.now();
        const lastDaily = database[userId].sonGünlük || 0;
        const oneDay = 24 * 60 * 60 * 1000; // 24 saat in milisaniye

        if (now - lastDaily < oneDay) {
            const timeLeft = oneDay - (now - lastDaily);
            const hours = Math.floor(timeLeft / (60 * 60 * 1000));
            const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

            return message.reply(`Günlük ödülünüzü zaten aldınız! Tekrar almak için ${hours} saat ve ${minutes} dakika beklemelisiniz.`);
        }

        const reward = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
        database[userId].bakiye += reward;
        database[userId].sonGünlük = now;

        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        const frostEmoji = '<:frost:1268960986560331786>'; // Frost emojisinin ID'sini buraya ekleyin

        const embed = new Discord.MessageEmbed()
            .setColor('#00FF00')
            .setTitle('🎉 Günlük Ödül')
            .setDescription(`Tebrikler! Günlük ödülünüzü aldınız.`)
            .addField('Kazanılan Ödül', `${reward} ${frostEmoji}`)
            .addField('Yeni Bakiye', `${database[userId].bakiye} ${frostEmoji}`)
            .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
};