const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const databaseDosyası = path.join(__dirname, '..', 'database.json');

const flipEmoji = '<a:coinflip:1276499983670972428>';
const yazıEmoji = '<:yaz:1276500426459709513>';
const turaEmoji = '<:tura:1276501868658556969>';
const frostEmoji = '<:frost:1268960986560331786>';

module.exports = {
    name: 'coinflip',
    description: 'Yazı tura at ve bahis oyna.',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('❌ **Hatalı kullanım. Doğru kullanım: f!coinflip <yazı/tura> <miktar>**');
        }

        const seçim = args[0].toLowerCase();
        if (seçim !== 'yazı' && seçim !== 'tura') {
            return message.reply('❌ **Lütfen yazı veya tura seçin.**');
        }

        let miktar = parseInt(args[1]);
        if (isNaN(miktar) || miktar <= 0) {
            return message.reply('❌ **Lütfen geçerli bir miktar girin.**');
        }

        // betLimit kontrolü
        if (miktar > config.betLimit) {
            miktar = config.betLimit;
            message.reply(`ℹ️ **Bahis limiti ${config.betLimit} ${frostEmoji} olduğu için, bahsiniz bu miktara ayarlandı.**`);
        }

        const userId = message.author.id;
        let database = JSON.parse(fs.readFileSync(databaseDosyası, 'utf8'));

        if (!database[userId] || database[userId].bakiye < miktar) {
            return message.reply('❌ **Yeterli bakiyeniz yok.**');
        }

        // Paranın dönme animasyonu
        const flipMessage = await message.reply(`${flipEmoji} **Para dönüyor...**`);

        // 3 saniye bekle
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Sonucu belirle
        const sonuç = Math.random() < 0.5 ? 'yazı' : 'tura';
        const kazandı = seçim === sonuç;

        // Bakiyeyi güncelle
        if (kazandı) {
            database[userId].bakiye += miktar;
        } else {
            database[userId].bakiye -= miktar;
        }

        // Veritabanını güncelle
        fs.writeFileSync(databaseDosyası, JSON.stringify(database, null, 2));

        // Sonuç embedini oluştur
        const embed = new MessageEmbed()
            .setColor(kazandı ? '#00ff00' : '#ff0000')
            .setTitle('Coinflip Sonucu')
            .setDescription(`${sonuç === 'yazı' ? yazıEmoji : turaEmoji} **Sonuç: ${sonuç.toUpperCase()}**`)
            .addField('Seçiminiz', seçim.toUpperCase())
            .addField(kazandı ? 'Kazandınız!' : 'Kaybettiniz!', `${miktar.toLocaleString()} ${frostEmoji}`)
            .addField('Yeni Bakiyeniz', `${database[userId].bakiye.toLocaleString()} ${frostEmoji}`)
            .setTimestamp();

        // Sonucu güncelle ve embedı gönder
        await flipMessage.edit({ content: ' ', embeds: [embed] });
    },
};