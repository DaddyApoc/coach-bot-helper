import { SlashCommandBuilder } from "discord.js";
import { getSession, updateSessionStatus } from "../../utils/sessions.js";

export default {
  data: new SlashCommandBuilder()
    .setName("confirm-session")
    .setDescription("Confirm a booked session")
    .addStringOption(option =>
      option
        .setName("session_id")
        .setDescription("The session ID")
        .setRequired(true)
    ),

  async execute(interaction) {
    const sessionId = interaction.options.getString("session_id");
    const session = getSession(sessionId);

    if (!session) {
      return interaction.reply({
        content: "Invalid session ID.",
        ephemeral: true,
      });
    }

    if (session.coachId !== interaction.user.id) {
      return interaction.reply({
        content: "You are not the coach for this session.",
        ephemeral: true,
      });
    }

    updateSessionStatus(sessionId, "confirmed");

    await interaction.reply({
      content: `Session **${sessionId}** confirmed.`,
      ephemeral: true,
    });
  },
};
