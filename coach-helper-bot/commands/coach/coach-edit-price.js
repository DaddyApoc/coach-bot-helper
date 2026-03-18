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
    .setDescription("Edit a coach's pricing.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price-one-session")
        .setDescription("Price for 1 session")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price-three-sessions")
        .setDescription("Price for 3 sessions")
        .setRequired(true)
    )
    .addNumberOption(option =>
      option.setName("price-five-sessions")
        .setDescription("Price for 5 sessions")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const priceOne = interaction.options.getNumber("price-one-session");
      const priceThree = interaction.options.getNumber("price-three-sessions");
      const priceFive = interaction.options.getNumber("price-five-sessions");

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      if (!data[coachUser.id]) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      data[coachUser.id].pricing = {
        oneSession: priceOne,
        threeSessions: priceThree,
        fiveSessions: priceFive
      };
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Pricing Updated")
        .setDescription(`Pricing updated for **${coachUser.username}**`)
        .addFields(
          { name: "1 Session", value: `$${priceOne}`, inline: true },
          { name: "3 Sessions", value: `$${priceThree}`, inline: true },
          { name: "5 Sessions", value: `$${priceFive}`, inline: true }
        )
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating pricing.");
    }
  }
};
