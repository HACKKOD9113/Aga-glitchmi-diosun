const Discord = require('discord.js');

module.exports = {
    name: 'çark-bilgi',
    description: 'Çark oyunu hakkında bilgi verir',
    execute(message, args) {
        const embed = new Discord.MessageEmbed()
            .setColor('#FFA500')
            .setTitle('🎡 Lüks Şans Çarkı Bilgileri')
            .setDescription('Şans çarkında kazanabileceğiniz ödüller ve şansları:')
            .addFields(
                { name: '5X Bitcoin <:bitcoin:1269241637469552723>', value: 'Şans: %0.2 - Büyük Ödül!', inline: true },
                { name: 'Ethereum <:ethereum:1269238909800546358>', value: 'Şans: %1', inline: true },
                { name: '5X Elmas <:diamond:1269239220644483192>', value: 'Şans: %0.4', inline: true },
                { name: '100 Dolar <:dollar:1269240185489723546>', value: 'Şans: %20', inline: true },
                { name: '5000 Dolar <:dollar:1269240185489723546>', value: 'Şans: %10', inline: true },
                { name: '1000 Dogecoin <:dogecoin:1269240399009157252>', value: 'Şans: %40', inline: true },
                { name: '<:Hkmdar:1276266930822578267> Hükümdar Ünvanı', value: 'Şans: %0.1 - Çok Nadir!(Hükümdar Ünvan Avantajı satın-al ve sat komutlarında limit artışı)', inline: true },
                { name: '❌ Boş', value: 'Şans: %28', inline: true }
            )
            .addField('Büyük Ödül', '5X Bitcoin veya Hükümdar Ünvanı kazanırsanız, özel bir animasyon göreceksiniz!')
            .addField('Nasıl Oynanır?', 'f!çark komutunu kullanarak çarkı çevirebilirsiniz. Her çevirme 50,000 Frost\'a mal olur.')
            .addField('İpucu', '10x çevirme yaparak bir seferde 10 kez çevirebilir ve daha fazla kazanma şansı elde edebilirsiniz!')
            .setFooter('İyi şanslar!');

        message.channel.send({ embeds: [embed] });
    },
};