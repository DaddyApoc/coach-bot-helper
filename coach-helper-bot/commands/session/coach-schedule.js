const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-schedule")
    .setDescription("View your upcoming coaching sessions"),

  async execute(interaction) {
    try {
      const sessions = JSON.parse(fs.readFileSync("data/sessions.json", "utf8"));
      const upcoming = sessions.filter(
        s => s.coach === interaction.user.id && s.status === "accepted"
      );

      if (!upcoming.length)
        return interaction.reply("📭 You have no upcoming sessions.");

      const embed = new EmbedBuilder()
        .setTitle("📅 Your Coaching Schedule")
        .setColor("Blue")
        .addFields(
          upcoming.map(s => ({
            name: `Session ${s.id}`,
            value: `Student: <@${s.student}>\nTime: ${s.time}`,
            inline: false
          }))
        );

      return interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      return interaction.reply("❌ Error loading schedule.");
    }
  }
};
