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
    .setName("coach-edit-price")
    .setDescription("Edit a coach's pricing.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price")
        .setDescription("Price per session in USD")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const price = interaction.options.getNumber("price");

      const coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const coach = coaches.find(c => c.id === coachUser.id);

      if (!coach) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      coach.price = price;
      fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Pricing Updated")
        .setDescription(`Pricing updated for **${coachUser.username}**`)
        .addFields({ name: "Price per Session", value: `$${price}` })
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating pricing.");
    }
  }
};
