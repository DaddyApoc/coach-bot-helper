import { SlashCommandBuilder } from "discord.js";
import { getSession, updateSession } from "../../utils/sessions.js";
import { addEarnings } from "../../utils/earnings.js";

export default {
  data: new SlashCommandBuilder()
    .setName("complete-session")
    .setDescription("Mark a session as completed")
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

    if (session.status !== "confirmed") {
      return interaction.reply({
        content: "This session is not confirmed yet.",
        ephemeral: true,
      });
    }

    updateSession(sessionId, { status: "completed" });

    addEarnings(session.coachId, session.price, sessionId);

    await interaction.reply({
      content: `Session **${sessionId}** marked as completed.\nYou earned **$${session.price}**.`,
      ephemeral: true,
    });
  },
};

import { addEarnings } from "../../utils/earnings.js";

addEarnings(session.coachId, session.price, sessionId);
