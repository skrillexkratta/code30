// api/stripe-webhook.js
// Vercel serverless function — receives Stripe events and unlocks the program.
//
// IMPORTANT: This endpoint must receive the RAW request body for signature verification.
// Add this to vercel.json:
//   "functions": { "api/stripe-webhook.js": { "bodyParser": false } }

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin  = require("firebase-admin");

// ── Firebase Admin initialisation ─────────────────────────────────────────────
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId:   process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Vercel stores newlines as literal \n — replace them back
      privateKey:  (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// ── Read raw body from request stream ─────────────────────────────────────────
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data",  chunk => chunks.push(chunk));
    req.on("end",   ()    => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

// ── Handler ────────────────────────────────────────────────────────────────────
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const rawBody = await getRawBody(req);
  const sig     = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("[Stripe webhook] signature error:", err.message);
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  // ── Handle checkout.session.completed ─────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session   = event.data.object;
    const { userId, productId } = session.metadata || {};

    if (userId && productId) {
      try {
        await Promise.all([
          // Record the purchase
          db.collection("purchases").add({
            userId,
            productId,
            stripeSessionId: session.id,
            amount:          session.amount_total, // in cents
            currency:        session.currency,
            createdAt:       admin.firestore.FieldValue.serverTimestamp(),
          }),
          // Unlock the program for this user
          db.collection("users").doc(userId).update({
            purchasedPrograms: admin.firestore.FieldValue.arrayUnion(productId),
          }),
        ]);
        console.log(`[Stripe webhook] Unlocked ${productId} for user ${userId}`);
      } catch (err) {
        console.error("[Stripe webhook] Firestore write error:", err.message);
        // Return 500 so Stripe retries the webhook
        return res.status(500).json({ error: "Database write failed" });
      }
    }
  }

  res.status(200).json({ received: true });
};
