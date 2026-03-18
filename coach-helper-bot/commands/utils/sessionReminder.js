import fs from "fs";

const bookingsPath = "/data/bookings.json";

export function startSessionReminder(client) {
  setInterval(async () => {
    try {
      if (!fs.existsSync(bookingsPath)) return;

      let bookings = JSON.parse(fs.readFileSync(bookingsPath, "utf8"));
      const now = Date.now();

      for (const booking of bookings) {
        if (booking.status !== "accepted") continue;
        if (booking.reminderSent) continue;

        const sessionTime = Date.parse(booking.time);
        if (isNaN(sessionTime)) continue;

        const diff = sessionTime - now;

        // 10 minutes = 600,000 ms
        if (diff > 0 && diff <= 600000) {
          // Send reminders
          try {
            const coach = await client.users.fetch(booking.coachId);
            const student = await client.users.fetch(booking.studentId);

            await coach.send(
              `⏰ **Reminder:** You have a coaching session with **${booking.studentName}** in **10 minutes**.\n` +
              `Time: ${booking.time}`
            );

            await student.send(
              `⏰ **Reminder:** Your session with **${booking.coachName}** starts in **10 minutes**.\n` +
              `Time: ${booking.time}`
            );
          } catch (err) {
            console.log("Reminder DM failed:", err);
          }

          booking.reminderSent = true;
        }
      }

      fs.writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
    } catch (err) {
      console.log("Reminder engine error:", err);
    }
  }, 1000 * 60 * 5); // every 5 minutes
}
