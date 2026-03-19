import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "data/coaches.json";

function ensureFile() {
  if (!fs.existsSync("data")) fs.mkdirSync("data", { recursive: true });
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-availability")
    .setDescription("Edit a coach's availability.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("availability")
        .setDescription("New availability (Online, Offline, Busy, etc.)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const newAvailability = interaction.options.getString("availability");

      const coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const coach = coaches.find(c => c.id === coachUser.id);

      if (!coach) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      coach.availability = newAvailability;
      fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Availability Updated")
        .setDescription(`Availability updated for **${coachUser.username}**`)
        .addFields({ name: "New Availability", value: newAvailability })
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating availability.");
    }
  }
};
