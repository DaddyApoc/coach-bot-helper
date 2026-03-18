import fs from "fs";

const bookingsPath = "/data/bookings.json";

function ensureFile() {
  if (!fs.existsSync(bookingsPath)) {
    fs.writeFileSync(bookingsPath, JSON.stringify([]));
  }
}

export default {
  data: null, // Not a slash command
  
  async execute(client) {
    try {
      ensureFile();
      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));

      const now = Date.now();

      for (const booking of bookings) {
        // Only process accepted sessions that haven't been reminded
        if (booking.status !== "accepted" || booking.reminderSent) continue;

        const sessionTime = new Date(booking.sessionTime).getTime();
        const timeUntilSession = sessionTime - now;
        const minutesUntil = timeUntilSession / (1000 * 60);

        // Send reminder when 10 minutes or less remain (but not if already sent)
        if (minutesUntil <= 10 && minutesUntil > 0) {
          try {
            const coach = await client.users.fetch(booking.coachId);
            const student = await client.users.fetch(booking.studentId);

            const coachEmbed = {
              title: "⏰ Session Starting Soon!",
              description: `Your session with **${booking.studentName}** starts in 10 minutes!`,
              color: 0xFF6B6B,
              fields: [
                { name: "Time", value: `<t:${Math.floor(sessionTime / 1000)}:F>` },
                { name: "Notes", value: booking.notes }
              ]
            };

            const studentEmbed = {
              title: "⏰ Session Starting Soon!",
              description: `Your session with **${booking.coachName}** starts in 10 minutes!`,
              color: 0xFF6B6B,
              fields: [
                { name: "Time", value: `<t:${Math.floor(sessionTime / 1000)}:F>` },
                { name: "Notes", value: booking.notes }
              ]
            };

            await coach.send({ embeds: [coachEmbed] });
            await student.send({ embeds: [studentEmbed] });

            booking.reminderSent = true;
            fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
          } catch (err) {
            console.log("Reminder DM failed:", err);
          }
        }
      }
    } catch (error) {
      console.error("Session reminder error:", error);
    }
  }
};
