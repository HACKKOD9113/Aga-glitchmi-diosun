const Discord = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Botun komutlarını gösterir',
    execute(message, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Frost Bot Komutları')
            .setDescription('İşte kullanabileceğiniz komutların listesi:')
            .addFields(
                { name: 'f!varlık', value: 'Sahip olduğunuz tüm varlıkları gösterir.' },
                { name: 'f!blackjack', value: 'Blackjack oyunu oynarsınız.' },
                { name: 'f!slot', value: 'Slot makinesi çevirirsiniz.' },
                { name: 'f!çark', value: 'Şans çarkını çevirip ödüller kazanırsınız.' },
                { name: 'f!mine', value: 'Madencilik yaparak Frost kazanırsınız.' },
                { name: 'f!premium', value: 'Premium üyelik hakkında bilgi alırsınız.' },
                { name: 'f!sat', value: 'Sahip olduğunuz varlıkları satarsınız.' },
                { name: 'f!satın-al', value: 'Çeşitli varlıklar satın alırsınız.' },
                { name: 'f!sıralama', value: 'En zengin kullanıcıların sıralamasını görürsünüz.' },
                { name: 'f!ekonomi', value: 'Ekonomi sistemi hakkında genel bilgi alırsınız.' },
                { name: 'f!transfer', value: 'Başka bir kullanıcıya Frost transfer edersiniz.' },
                { name: 'f!günlük', value: 'Günlük ödülünüzü alırsınız.' },
                { name: 'f!çark-bilgi', value: 'Çark oyunu hakkında detaylı bilgi alırsınız.' }
            )
            .setFooter('Daha fazla bilgi için her komutun başına f! ekleyerek kullanın.');

        message.channel.send({ embeds: [embed] });
    },
};