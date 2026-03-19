import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();

// Normal JSON routes
app.use(express.json());

// Webhook route (must use raw body)
app.post(
  "/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const discordUserId = session.metadata.discordUserId;
          const amount = session.amount_total / 100;

          console.log(`Payment complete for ${discordUserId}: $${amount}`);

          // TODO: credit wallet in your DB
          break;
        }

        default:
          console.log("Unhandled event:", event.type);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Webhook error:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// Create checkout session
app.post("/create-checkout-session", async (req, res) => {
  const { amount, discordUserId } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: "Wallet Top-Up" },
            unit_amount: amount * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.DOMAIN_URL}/payment/success`,
      cancel_url: `${process.env.DOMAIN_URL}/payment/cancel`,
      metadata: { discordUserId },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

app.get("/payment/success", (req, res) => {
  res.send("Payment successful! You can close this window.");
});

app.get("/payment/cancel", (req, res) => {
  res.send("Payment canceled. You can close this window.");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Stripe server running on ${PORT}`));

import { addToWallet } from "./utils/wallet.js";

case "checkout.session.completed": {
  const session = event.data.object;
  const discordUserId = session.metadata.discordUserId;
  const amount = session.amount_total / 100;

  addToWallet(discordUserId, amount, session.id);

import { flagUser } from "./utils/admin.js";

if (amount >= 500) {
  flagUser(discordUserId, `High-value top-up: $${amount}`, 15);
}

case "checkout.session.completed":

addToWallet(discordUserId, amount, session.id);
import { flagUser } from "./utils/admin.js"; // at the top of the file

// FRAUD CHECK: high-value top-up
if (amount >= 200) {
  flagUser(discordUserId, `High-value top-up: $${amount}`, 15);
}
