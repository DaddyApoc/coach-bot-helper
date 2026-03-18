import {
  SlashCommandBuilder,
  EmbedBuilder
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

function ensureFile() {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({}));
  }
}

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-price")
    .setDescription("Edit a coach's price.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price")
        .setDescription("New price")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const newPrice = interaction.options.getNumber("price");

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!data[coachUser.id]) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      data[coachUser.id].price = newPrice;
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Price Updated")
        .setDescription(`Price updated for **${coachUser.username}**`)
        .addFields({ name: "New Price", value: `$${newPrice}` })
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating price.");
    }
  }
};
