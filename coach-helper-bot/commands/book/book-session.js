import { SlashCommandBuilder } from "discord.js";
import { getWallet, deductFromWallet } from "../../utils/wallet.js";
import { createSession, getUserSessions } from "../../utils/sessions.js";
import { flagUser } from "../../utils/admin.js";

export default {
  data: new SlashCommandBuilder()
    .setName("book-session")
    .setDescription("Book a coaching session")
    .addUserOption(option =>
      option
        .setName("coach")
        .setDescription("The coach you want to book")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option
        .setName("price")
        .setDescription("Price of the session in USD")
        .setRequired(true)
    ),

  async execute(interaction) {
    const coach = interaction.options.getUser("coach");
    const price = interaction.options.getInteger("price");
    const studentId = interaction.user.id;

    if (coach.bot) {
      return interaction.reply({
        content: "You cannot book a bot.",
        ephemeral: true,
      });
    }

    const wallet = getWallet(studentId);

    if (wallet.balance < price) {
      return interaction.reply({
        content: `You need **$${price}**, but you only have **$${wallet.balance}**. Use /wallet-add to top up.`,
        ephemeral: true,
      });
    }

    // FRAUD CHECK: too many active sessions
    const sessions = getUserSessions(studentId, "student");
    const activeCount = sessions.filter(
      s => s.status !== "completed" && s.status !== "cancelled"
    ).length;

    if (activeCount >= 5) {
      flagUser(studentId, "Many active sessions without completion", 10);
    }

    deductFromWallet(studentId, price);
    const session = createSession(studentId, coach.id, price);

    await interaction.reply({
      content: `Session booked with **${coach.username}** for **$${price}**.\nSession ID: \`${session.id}\`\nThe coach must now confirm the session.`,
      ephemeral: true,
    });
  },
};
