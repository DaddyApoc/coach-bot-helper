import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";
import fs from "fs";

const filePath = "/data/coaches.json";

export default {
  data: new SlashCommandBuilder()
    .setName("coach-edit-price")
    .setDescription("Edit a coach's price.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("price")
        .setDescription("New price per session")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coachUser = interaction.options.getUser("coach");
    const newPrice = interaction.options.getInteger("price");

    let coaches = [];

    if (fs.existsSync(filePath)) {
      coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
    }

    const coach = coaches.find(c => c.id === coachUser.id);

    if (!coach) {
      return interaction.reply({
        content: "❌ That coach is not registered.",
        ephemeral: true,
      });
    }

    coach.price = newPrice;

    fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

    const embed = new EmbedBuilder()
      .setTitle("Coach Price Updated")
      .setDescription(`Price updated for **${coachUser.username}**`)
      .addFields({ name: "New Price", value: `$${newPrice}` })
      .setColor("Gold");

    return interaction.reply({ embeds: [embed] });
  }
};
