import fs from "fs";

const bookingsPath = "/data/bookings.json";

function ensureFile() {
  if (!fs.existsSync(bookingsPath)) {
    fs.writeFileSync(bookingsPath, JSON.stringify([]));
  }
}

export default {
  async execute(client) {
    try {
      ensureFile();
      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));

      for (const booking of bookings) {
        if (booking.status !== "accepted" || booking.reminderSent) continue;

        const sessionTime = new Date(booking.time).getTime();
        const now = Date.now();
        const hoursUntil = (sessionTime - now) / (1000 * 60 * 60);

        // Send reminder 24 hours before
        if (hoursUntil <= 24 && hoursUntil > 23) {
          try {
            const coach = await client.users.fetch(booking.coachId);
            const student = await client.users.fetch(booking.studentId);

            const coachEmbed = {
              title: "⏰ Session Reminder",
              description: `Your session with **${booking.studentName}** is in 24 hours!`,
              color: 0xFFA500,
              fields: [{ name: "Time", value: booking.time }]
            };

            const studentEmbed = {
              title: "⏰ Session Reminder",
              description: `Your session with **${booking.coachName}** is in 24 hours!`,
              color: 0xFFA500,
              fields: [{ name: "Time", value: booking.time }]
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
