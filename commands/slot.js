const Discord = require('discord.js');
const fs = require('fs');
const path = require('path');

const config = require('../config.json');
const databasePath = path.join(__dirname, '../database.json');

const slotEmojis = ['🍒', '🍊', '🍋', '🍉', '🍇', '💎'];
const frostEmoji = '<:frost:1268960986560331786>';

// Cooldown için Map oluştur
const cooldowns = new Map();

module.exports = {
    name: 'slot',
    description: 'Slot makinesinde şansınızı deneyin!',
    usage: '<miktar>',
    cooldown: 10, // 10 saniyelik cooldown
    async execute(message, args) {
        const now = Date.now();
        const cooldownAmount = (this.cooldown || 3) * 1000;
        
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                return message.reply(`Lütfen ${timeLeft.toFixed(1)} saniye daha bekleyin.`);
            }
        }

        cooldowns.set(message.author.id, now);
        setTimeout(() => cooldowns.delete(message.author.id), cooldownAmount);

        if (!args[0]) return message.reply('Lütfen bir bahis miktarı belirtin!');

        const amount = args[0].toLowerCase() === 'all' ? 'all' : parseInt(args[0]);
        if (isNaN(amount) && amount !== 'all') return message.reply('Geçerli bir miktar girmelisiniz!');

        const userId = message.author.id;

        let database = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        if (!database[userId]) database[userId] = { bakiye: 0 };

        let betAmount = amount === 'all' ? Math.min(database[userId].bakiye, config.betLimit) : amount;
        betAmount = Math.min(betAmount, config.betLimit);

        if (betAmount > database[userId].bakiye) {
            return message.reply('Yeterli bakiyeniz yok!');
        }

        const slots = Array(3).fill().map(() => slotEmojis[Math.floor(Math.random() * slotEmojis.length)]);

        let winMultiplier = 0;
        if (slots[0] === slots[1] && slots[1] === slots[2]) {
            winMultiplier = 5;
        } else if (slots[0] === slots[1] || slots[1] === slots[2] || slots[0] === slots[2]) {
            winMultiplier = 2;
        }

        const winAmount = betAmount * winMultiplier;
        const netGain = winAmount - betAmount;

        database[userId].bakiye += netGain;

        fs.writeFileSync(databasePath, JSON.stringify(database, null, 2));

        const embed = new Discord.MessageEmbed()
            .setColor(winMultiplier > 0 ? '#00ff00' : '#ff0000')
            .setTitle('🎰 Slot Makinesi')
            .setDescription(`${slots[0]} | ${slots[1]} | ${slots[2]}`)
            .addField('Bahis', `${betAmount} ${frostEmoji}`, true)
            .addField('Kazanç', `${netGain > 0 ? '+' : ''}${netGain} ${frostEmoji}`, true)
            .addField('Yeni Bakiye', `${database[userId].bakiye} ${frostEmoji}`, true)
            .setFooter(`${message.author.username}`, message.author.displayAvatarURL())
            .setTimestamp();

        let resultMessage = '';
        if (winMultiplier === 5) {
            resultMessage = '🎉 JACKPOT!';
        } else if (winMultiplier === 2) {
            resultMessage = '🌟 Tebrikler!';
        }

        if (resultMessage) {
            embed.addField('\u200B', resultMessage);
        }

        await message.channel.send({ embeds: [embed] });
    },
};