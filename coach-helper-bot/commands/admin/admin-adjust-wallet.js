const { SlashCommandBuilder } = require("discord.js");
const fs = require("fs");

const filePath = "data/wallets.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("admin-adjust-wallet")
    .setDescription("Adjust a user's wallet balance")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("User to adjust")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("Amount to adjust (+/-)")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      const user = interaction.options.getUser("user");
      const amount = interaction.options.getInteger("amount");

      if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));

      const wallets = JSON.parse(fs.readFileSync(filePath, "utf8"));
      wallets[user.id] = (wallets[user.id] || 0) + amount;

      fs.writeFileSync(filePath, JSON.stringify(wallets, null, 2));

      await interaction.reply(`💳 Adjusted **${user.username}** by **${amount}** credits.`);
    } catch (err) {
      console.error(err);
      await interaction.reply("❌ Error adjusting wallet.");
    }
  }
};
