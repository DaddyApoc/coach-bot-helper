const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if Coach helper.exe is alive'),

  async execute(interaction) {
    await interaction.reply('🏓 Coach helper.exe is online and responsive.');
  },
};
