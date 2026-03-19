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
    .setName("coach-edit-weapons")
    .setDescription("Edit a coach's weapons.")
    .addUserOption(option =>
      option.setName("coach")
        .setDescription("The coach to edit")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("weapons")
        .setDescription("Weapons (comma-separated)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      ensureFile();
      const coachUser = interaction.options.getUser("coach");
      const weaponsInput = interaction.options.getString("weapons");
      const weapons = weaponsInput.split(",").map(w => w.trim());

      const coaches = JSON.parse(fs.readFileSync(filePath, "utf8"));
      const coach = coaches.find(c => c.id === coachUser.id);

      if (!coach) {
        return interaction.reply({
          content: "❌ That coach is not registered.",
          ephemeral: true,
        });
      }

      coach.weapons = weapons;
      fs.writeFileSync(filePath, JSON.stringify(coaches, null, 2));

      const embed = new EmbedBuilder()
        .setTitle("Coach Weapons Updated")
        .setDescription(`Weapons updated for **${coachUser.username}**`)
        .addFields({ name: "New Weapons", value: weapons.join(", ") })
        .setColor("Aqua");

      return interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error(error);
      await interaction.reply("❌ Error updating weapons.");
    }
  }
};
