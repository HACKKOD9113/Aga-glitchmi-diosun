const { MessageEmbed } = require('discord.js');
const { ekonomiyiOku, varliklar, COIN_SYMBOL } = require('../utils/ekonomi');

module.exports = {
  name: 'ekonomi',
  async execute(message, args) {
    const ekonomi = ekonomiyiOku();
    const embed = new MessageEmbed()
      .setTitle('Ekonomi Piyasası')
      .setColor('#0099ff')
      .setDescription(`Son güncelleme: ${new Date(ekonomi.sonGuncelleme).toLocaleString('tr-TR')}`)
      .setFooter({ text: 'Piyasa her 6 saatte bir güncellenir.' });

    const emojiler = {
      Bitcoin: '<:bitcoin:1269241637469552723>',
      Dogecoin: '<:dogecoin:1269240399009157252>',
      Altın: '<:gold:1269236070625579008>',
      Ethereum: '<:ethereum:1269238909800546358>',
      Euro: '<:euro:1269240157459185666>',
      Dolar: '<:dollar:1269240185489723546>',
      Elmas: '<:diamond:1269239220644483192>'
    };

    varliklar.forEach(varlik => {
      const deger = ekonomi[varlik.sembol];
      const emoji = emojiler[varlik.isim] || '🔹'; // Varsayılan emoji
      const degerMesaji = deger !== undefined 
        ? ` ${deger.toFixed(2)} <:frost:1268960986560331786>`
        : 'Veri bulunamadı';
      embed.addField(`${emoji} ${varlik.isim}`, degerMesaji, true);
    });

    message.reply({ embeds: [embed] });
  },
};