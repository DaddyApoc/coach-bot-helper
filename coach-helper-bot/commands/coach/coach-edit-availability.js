const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-availability")
    .setDescription("Update your availability")
    .addStringOption(option =>
      option.setName("availability")
        .setDescription("Your availability (e.g. Weekdays 3-8 PM)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const availability = interaction.options.getString("availability");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.availability = availability;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`📅 Availability updated to: **${availability}**`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating availability.");
    }
  }
};
