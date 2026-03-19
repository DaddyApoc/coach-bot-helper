const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-refund")
    .setDescription("Refund a user's session")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to refund")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to refund")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      const wallets = JSON.parse(fs.readFileSync("data/wallets.json", "utf8"));
      wallets[user.id] = (wallets[user.id] || 0) + amount;

      fs.writeFileSync("data/wallets.json", JSON.stringify(wallets, null, 2));

      await interaction.reply(`💵 Refunded **${amount}** credits to **${user.username}**.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error processing refund.");
    }
  }
};
