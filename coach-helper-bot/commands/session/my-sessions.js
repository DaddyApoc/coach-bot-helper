const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("my-sessions")
    .setDescription("View your booked sessions"),

  async execute(interaction) {
    try {
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const mine = sessions.filter(s => s.student === interaction.user.id);

      if (!mine.length)
        return interaction.reply("📭 You have no sessions.");

      const embed = new EmbedBuilder()
        .setTitle("📅 Your Sessions")
        .setColor("Green")
        .addFields(
          mine.map(s => ({
            name: `Session ${s.id}`,
            value: `Coach: <@${s.coach}>\nTime: ${s.time}\nStatus: ${s.status}`,
            inline: false
          }))
        );

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error loading your sessions.");
    }
  }
};
