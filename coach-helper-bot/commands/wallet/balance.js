import { SlashCommandBuilder } from "discord.js";
import { getWallet } from "../../utils/wallet.js";

export default {
  data: new SlashCommandBuilder()
    .setName("wallet-balance")
    .setDescription("Check your wallet balance"),

  async execute(interaction) {
    const wallet = getWallet(interaction.user.id);

    await interaction.reply({
      content: `Your wallet balance is **$${wallet.balance.toFixed(2)}**`,
      ephemeral: true,
    });
  },
};
