const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-profile")
    .setDescription("View your coach profile"),

  async execute(interaction) {
    try {
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));
      const coach = coaches.find(c => c.id === interaction.user.id);

      if (!coach) {
        return interaction.reply("❌ You are not registered as a coach.");
      }

      const embed = new EmbedBuilder()
        .setTitle(`${coach.username || interaction.user.username}'s Coach Profile`)
        .setColor("Blue")
        .addFields(
          {
            name: "About Me",
            value: coach.about || "Not set",
            inline: false
          },
          {
            name: "Specialties",
            value: coach.specialties?.length
              ? coach.specialties.join(", ")
              : "None",
            inline: false
          },
          {
            name: "Weapons",
            value: coach.weapons?.length
              ? coach.weapons.join(", ")
              : "None",
            inline: false
          },
          {
            name: "Experience",
            value: coach.experience || "Not set",
            inline: false
          },
          {
            name: "Languages",
            value: coach.languages?.length
              ? coach.languages.join(", ")
              : "None",
            inline: false
          }
        )
        .setFooter({ text: "Coach Profile System" });

      return interaction.reply({ embeds: [embed] });

    } catch (err) {
      console.error("Error loading coach profile:", err);
      return interaction.reply("❌ Error loading your profile.");
    }
  }
};
