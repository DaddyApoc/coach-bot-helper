import { SlashCommandBuilder } from "discord.js";
import { getWallet } from "../../utils/wallet.js";

export default {
  data: new SlashCommandBuilder()
    .setName("wallet-history")
    .setDescription("View your wallet transaction history"),

  async execute(interaction) {
    const wallet = getWallet(interaction.user.id);

    if (wallet.history.length === 0) {
      return interaction.reply({
        content: "Your wallet history is empty.",
        ephemeral: true,
      });
    }

    const lines = wallet.history
      .slice(-10)
      .reverse()
      .map((h) => {
        const date = new Date(h.date).toLocaleString();
        return `• **${h.type}** — $${h.amount} on ${date}`;
      })
      .join("\n");

    await interaction.reply({
      content: `Your last transactions:\n${lines}`,
      ephemeral: true,
    });
  },
};
