// api/create-checkout-session.js
// Vercel serverless function — creates a Stripe Checkout session.
// Called from the frontend when the user clicks "Get instant access".

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async function handler(req, res) {
  // CORS headers (allow same-origin and Vercel preview URLs)
  res.setHeader("Access-Control-Allow-Origin",  "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { userId, userEmail } = req.body || {};
  const origin = process.env.APP_URL || `https://${req.headers.host}`;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode:                 "payment",
      customer_email:       userEmail || undefined,

      line_items: [
        {
          price_data: {
            currency:     "usd",
            unit_amount:  3999,  // $39.99
            product_data: {
              name:        "AI Automation Builder Program",
              description: "Build 3 real AI tools: Chatbot, Content Generator & Email Automation. Lifetime access.",
              images:      [], // add a product image URL here if you have one
            },
          },
          quantity: 1,
        },
      ],

      // Pass the Firebase user ID in metadata so the webhook can unlock the program
      metadata: {
        userId:    userId    || "",
        productId: "ai-automation-builder",
      },

      success_url: `${origin}/?payment=success`,
      cancel_url:  `${origin}/`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("[Stripe] create-checkout-session error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
