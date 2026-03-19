const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs"); 

module.exports = {
  data: new SlashCommandBuilder()
    .setName("coach-edit-weapons")
    .setDescription("Update your weapon specialties")
    .addStringOption(option =>
      option.setName("weapons")
        .setDescription("Comma-separated weapons")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const weapons = interaction.options.getString("weapons").split(",").map(w => w.trim());
      const coaches = JSON.parse(fs.readFileSync("data/coaches.json", "utf8"));

      const coach = coaches.find(c => c.id === interaction.user.id);
      if (!coach) return interaction.reply("❌ You are not registered as a coach.");

      coach.weapons = weapons;

      fs.writeFileSync("data/coaches.json", JSON.stringify(coaches, null, 2));

      await interaction.reply(`⚔️ Weapon specialties updated.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error updating weapons.");
    }
  }
};
