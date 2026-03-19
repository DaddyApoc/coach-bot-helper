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
    .setName("coach-edit-bio")
    .setDescription("Edit a coach's bio.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("bio")
        .setDescription("New bio")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const newBio = interaction.options.getString("bio");

      const coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const coach = coaches.find(c => c.id === coachUser.id);

      if (!coach) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      coach.bio = newBio;
      fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Bio Updated")
        .setDescription(`Bio updated for **${coachUser.username}**`)
        .addFields({ name: "New Bio", value: newBio })
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating bio.");
    }
  }
};
