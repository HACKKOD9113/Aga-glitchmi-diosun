const { MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js');
const fs = require('fs').promises;

module.exports = {
  name: 'sıralama',
  async execute(message, args) {
    let data;
    try {
      const rawData = await fs.readFile('database.json', 'utf-8');
      data = JSON.parse(rawData);
    } catch (error) {
      console.error('Database okuma hatası:', error);
      return message.reply('🚫 Verileri okurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }

        const currencies = [
      { label: '💰 Para Sıralaması', value: 'bakiye' },
      { label: '₿ BTC Sıralaması', value: 'btc' },
      { label: '🐶 Dogecoin Sıralaması', value: 'dogecoin' },
      { label: '🏅 Altın Sıralaması', value: 'altın' },
      { label: '🪙 Ethereum Sıralaması', value: 'ethereum' },
      { label: '💶 Euro Sıralaması', value: 'euro' },
      { label: '💵 Dolar Sıralaması', value: 'dolar' },
      { label: '💎 Elmas Sıralaması', value: 'elmas' }
    ];

    const createEmbed = (title, sortedData) => {
      const embed = new MessageEmbed()
        .setTitle(`📊 ${title}`)
        .setColor('#3498db')
        .setFooter('Sıralama Sistemi', message.client.user.displayAvatarURL())
        .setTimestamp();

      sortedData.slice(0, 10).forEach((item, index) => {
        embed.addField(`${index + 1}. ${item.username}`, `Değer: **${item.value.toFixed(2)}**`, false);
      });

      return embed;
    };

    const getSortedData = (data, criterion) => {
      return Object.values(data)
        .map(userData => ({
          id: Object.keys(data).find(key => data[key].kullaniciAdi === userData.kullaniciAdi),
          username: userData.kullaniciAdi,
          value: userData[criterion]
        }))
        .sort((a, b) => b.value - a.value);
    };

    const initialSortedData = getSortedData(data, 'bakiye');
    const initialEmbed = createEmbed('Para Sıralaması', initialSortedData);

    // Unvanları ver
    const titles = ['İmparator', 'Efendi', 'Kral'];
    initialSortedData.slice(0, 3).forEach((item, index) => {
      data[item.id].unvan = titles[index];
    });

    // Verileri kaydet
    await fs.writeFile('database.json', JSON.stringify(data, null, 2));

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('ranking_select')
          .setPlaceholder('🔽 Sıralama türünü seçin 🔽')
          .addOptions(currencies)
      );

    const response = await message.reply({ embeds: [initialEmbed], components: [row] });

    const filter = i => i.customId === 'ranking_select' && i.user.id === message.author.id;
    const collector = response.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      const selectedCurrency = i.values[0];
      const sortedData = getSortedData(data, selectedCurrency);
      const title = currencies.find(c => c.value === selectedCurrency).label;

      const newEmbed = createEmbed(title, sortedData);
      await i.update({ embeds: [newEmbed], components: [row] });
    });
  }
};