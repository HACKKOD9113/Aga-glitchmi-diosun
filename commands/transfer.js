const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

const frostEmoji = '<:frost:1268960986560331786>';
const maxTransferAmount = 1000000; // 1 Milyon
const cooldownTime = 10000; // 10 saniye (milisaniye cinsinden)

const databaseDosyası = path.join(__dirname, '..', 'database.json');
const cooldownDosyası = path.join(__dirname, '..', 'transfer-cooldown.json');

// Cooldown dosyasını kontrol et, yoksa oluştur
if (!fs.existsSync(cooldownDosyası)) {
    fs.writeFileSync(cooldownDosyası, '{}', 'utf8');
}

module.exports = {
    name: 'transfer',
    description: 'Başka bir kullanıcıya para transfer et.',
    async execute(message, args) {
        if (args.length < 2) {
            return message.reply('❌ **Hatalı kullanım. Doğru kullanım: !transfer @kullanıcı miktar**');
        }

        const targetUser = message.mentions.users.first();
        if (!targetUser) {
            return message.reply('❌ **Lütfen geçerli bir kullanıcı etiketleyin.**');
        }

        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
            return message.reply('❌ **Lütfen geçerli bir miktar girin.**');
        }

        if (amount > maxTransferAmount) {
            return message.reply(`❌ **Tek seferde en fazla ${maxTransferAmount.toLocaleString()} ${frostEmoji} transfer edebilirsiniz.**`);
        }

        const senderId = message.author.id;
        const receiverId = targetUser.id;

        if (senderId === receiverId) {
            return message.reply('❌ **Kendinize transfer yapamazsınız.**');
        }

        let database = JSON.parse(fs.readFileSync(databaseDosyası, 'utf8'));
        let cooldowns = JSON.parse(fs.readFileSync(cooldownDosyası, 'utf8'));

        if (!database[senderId] || !database[receiverId]) {
            return message.reply('❌ **Gönderen veya alıcının hesabı bulunamadı.**');
        }

        const now = Date.now();
        if (cooldowns[senderId] && now - cooldowns[senderId] < cooldownTime) {
            const remainingTime = Math.ceil((cooldownTime - (now - cooldowns[senderId])) / 1000);
            return message.reply(`❌ **Lütfen ${remainingTime} saniye bekleyin ve tekrar deneyin.**`);
        }

        if (database[senderId].bakiye < amount) {
            return message.reply('❌ **Yeterli bakiyeniz yok.**');
        }

        // Transfer işlemi
        database[senderId].bakiye -= amount;
        database[receiverId].bakiye = (database[receiverId].bakiye || 0) + amount;

        // Cooldown güncelleme
        cooldowns[senderId] = now;

        fs.writeFileSync(databaseDosyası, JSON.stringify(database, null, 2));
        fs.writeFileSync(cooldownDosyası, JSON.stringify(cooldowns, null, 2));

        const embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Transfer Başarılı')
            .setDescription(`✅ **${amount.toLocaleString()} ${frostEmoji} başarıyla transfer edildi.**`)
            .addField('Gönderen', message.author.tag)
            .addField('Alıcı', targetUser.tag)
            .setTimestamp();

        return message.reply({ embeds: [embed] });
    },
};