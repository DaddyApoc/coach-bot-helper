const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-set-log")
    .setDescription("Set the log channel for admin events")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("Channel to send logs to")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const channel = interaction.options.getChannel("channel");

      fs.writeFileSync("data/log-channel.json", JSON.stringify({ channelId: channel.id }, null, 2));

      await interaction.reply(`📘 Log channel set to ${channel}.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error setting log channel.");
    }
  }
};
