const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const fs = require("fs"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-info")
    .setDescription("View information about a coach")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("Coach to view")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const coachUser = interaction.options.getUser("coach");
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === coachUser.id);
      if (!coach) return interaction.reply("❌ Coach not found.");

      const embed = new EmbedBuilder()
        .setTitle(`👤 Coach Profile — ${coachUser.username}`)
        .addFields(
          { name: "Bio", value: coach.bio || "None" },
          { name: "Rank", value: coach.rank || "Unranked", inline: true },
          { name: "Price", value: `${coach.price || 0} credits`, inline: true },
          { name: "Rating", value: `${coach.rating || "N/A"}`, inline: true },
          { name: "Availability", value: coach.availability || "Not set" },
          { name: "Tags", value: coach.tags?.join(", ") || "None" },
          { name: "Weapons", value: coach.weapons?.join(", ") || "None" }
        )
        .setColor("Blue");

      await interaction.reply({ embeds: [embed] });
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error loading coach info.");
    }
  }
};
