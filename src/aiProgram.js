// ── AI Automation Builder Program ────────────────────────────────────────────
// Single product. Purchasing this unlocks all 3 modules.

export const PROGRAM_ID            = "ai-automation-builder";
export const PROGRAM_NAME          = "AI Automation Builder Program";
export const PROGRAM_PRICE_DISPLAY = 39.99; // shown on landing page (USD)
export const PROGRAM_PRICE_CENTS   = 3999;  // sent to Stripe

// ── Program path (shown on landing page) ──────────────────────────────────────
export const programPath = [
  { step: 1, title: "Foundations",             desc: "APIs, environment setup, AI basics" },
  { step: 2, title: "Build the Chatbot",        desc: "Your first AI-powered support tool" },
  { step: 3, title: "Build the Content Generator", desc: "Automate your content creation" },
  { step: 4, title: "Build Email Automation",   desc: "Scale your outreach with AI" },
  { step: 5, title: "Final Integration",        desc: "Connect all tools into one system" },
];

// ── Outcomes (shown on landing page) ──────────────────────────────────────────
export const outcomes = [
  "Build and deploy an AI chatbot for customer support",
  "Automate email outreach with AI-powered personalization",
  "Generate content instantly with your own brand voice",
  "Integrate AI tools into any existing business workflow",
  "Save 10+ hours per week on repetitive tasks",
  "Earn a certificate of completion to showcase your skills",
];

// ── Module courses ─────────────────────────────────────────────────────────────
// Same shape as courses.js entries so CourseView works without changes.

export const aiCourses = [
  // ── Module 1: AI Customer Support Chatbot ──────────────────────────────────
  {
    id: "chatbot",
    title: "AI Customer Support Chatbot",
    tagline: "Automate customer support 24/7",
    tagline_en: "Automate customer support 24/7",
    icon: "🤖",
    color: "#0ea5e9",
    accent: "#57f6ff",
    lang: "javascript",
    lessons: [
      {
        day: 1, title: "OpenAI API Setup",
        goal: "Set up your OpenAI API key and make your first API call.",
        lesson: "The OpenAI API lets you send messages to GPT models and get intelligent responses back. You'll need an API key, which you store securely in environment variables — never hard-code it in your source code.",
        challenge: "Create a .env file, add your OPENAI_API_KEY, and run the starter code to get a response from GPT.",
        code: `import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function chat(message) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });
  return res.choices[0].message.content;
}

chat("Hello! What can you help me with?").then(console.log);`,
        quiz: [
          { q: "Where should you store your OpenAI API key?", opts: ["Hard-coded in source code", "In a .env environment variable", "In localStorage", "In a public config file"], ans: 1, explanation: "API keys must be stored in environment variables to keep them secret." },
          { q: "What does the 'model' field specify?", opts: ["The database model", "Which GPT model to use", "The response format", "The API version"], ans: 1, explanation: "The model field chooses which AI model handles your request, e.g. gpt-3.5-turbo." },
          { q: "Where is the AI's reply in the response?", opts: ["res.text", "res.choices[0].message.content", "res.data.reply", "res.output"], ans: 1, explanation: "OpenAI returns an array of choices — the text is in choices[0].message.content." },
        ],
      },
      {
        day: 2, title: "System Prompts & Persona",
        goal: "Give your chatbot a specific role and personality using a system prompt.",
        lesson: "A system prompt is a special message you send before the conversation starts. It tells the AI who it is, what it knows, and how to behave. This is how you turn a generic model into a specialised customer support agent for your business.",
        challenge: "Write a system prompt that makes the bot a helpful support agent for a fictional software company called 'Acme Tools'.",
        code: `const systemPrompt = \`You are a helpful customer support agent for Acme Tools.
You assist with billing, technical issues, and product questions.
Be concise, friendly, and professional.
If you don't know something, say so honestly.\`;

async function support(userMessage) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user",   content: userMessage },
    ],
  });
  return res.choices[0].message.content;
}`,
        quiz: [
          { q: "What role does a system prompt use?", opts: ["user", "assistant", "system", "admin"], ans: 2, explanation: "System prompts use the 'system' role to set context before the conversation." },
          { q: "What happens if you don't use a system prompt?", opts: ["The API throws an error", "The model has no specific persona or context", "The API is faster", "Responses are shorter"], ans: 1, explanation: "Without a system prompt the model behaves as a generic assistant with no specialisation." },
          { q: "Can a system prompt restrict what the bot talks about?", opts: ["No", "Yes", "Only in paid plans", "Only in GPT-4"], ans: 1, explanation: "You can instruct the model to stay on-topic and decline off-topic questions." },
        ],
      },
      {
        day: 3, title: "Conversation Memory",
        goal: "Make the chatbot remember previous messages in the same session.",
        lesson: "GPT models are stateless — each API call is independent. To create a conversation, you must send the full message history every time. Store the chat history as an array and append each new message before calling the API.",
        challenge: "Build a chat loop that keeps history and can hold a multi-turn conversation about order tracking.",
        code: `const history = [];

async function chat(userMessage) {
  history.push({ role: "user", content: userMessage });

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "You are a helpful support agent." },
      ...history,
    ],
  });

  const reply = res.choices[0].message.content;
  history.push({ role: "assistant", content: reply });
  return reply;
}

// Multi-turn example
await chat("My order #1234 hasn't arrived.");
await chat("It was supposed to arrive yesterday.");`,
        quiz: [
          { q: "Why must you send all previous messages every request?", opts: ["To save tokens", "Because GPT has no built-in memory", "It's optional", "To improve response speed"], ans: 1, explanation: "GPT models are stateless — sending history is how you create a conversation." },
          { q: "What role do the bot's previous replies use?", opts: ["system", "user", "assistant", "bot"], ans: 2, explanation: "Your bot's own replies are stored with the 'assistant' role in history." },
          { q: "What happens to token usage as conversation grows?", opts: ["It stays the same", "It decreases", "It increases", "It resets each message"], ans: 2, explanation: "Every message in history counts toward the token limit — long conversations cost more." },
        ],
      },
      {
        day: 4, title: "Knowledge Base Integration",
        goal: "Inject your product's documentation so the bot answers accurately.",
        lesson: "Rather than fine-tuning a model, the fastest way to give it product knowledge is to inject relevant docs directly into the system prompt. This is called Retrieval-Augmented Generation (RAG). For small knowledge bases, you can include everything; for large ones, search first then inject.",
        challenge: "Create a knowledge base object with 3 FAQ items and inject the relevant one based on the user's question keyword.",
        code: `const knowledgeBase = {
  refund:   "Refunds are processed within 5 business days. Email billing@acme.com.",
  shipping: "We ship within 24 hours. Express delivery takes 2 days.",
  password: "Reset your password at acme.com/reset. Check your spam folder for the email.",
};

function getRelevantContext(message) {
  const msg = message.toLowerCase();
  if (msg.includes("refund") || msg.includes("money"))   return knowledgeBase.refund;
  if (msg.includes("ship")   || msg.includes("deliver")) return knowledgeBase.shipping;
  if (msg.includes("password") || msg.includes("login")) return knowledgeBase.password;
  return "";
}

async function support(userMessage) {
  const context = getRelevantContext(userMessage);
  const system  = context
    ? \`You are a support agent. Use this info: \${context}\`
    : "You are a helpful support agent for Acme Tools.";

  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: system },
      { role: "user",   content: userMessage },
    ],
  });
  return res.choices[0].message.content;
}`,
        quiz: [
          { q: "What is RAG short for?", opts: ["Random Answer Generation", "Retrieval-Augmented Generation", "Rapid API Gateway", "Recursive Answer Graph"], ans: 1, explanation: "RAG means searching for relevant context and including it in the prompt." },
          { q: "What's the simplest way to add product knowledge?", opts: ["Fine-tune the model", "Inject docs into the system prompt", "Use a different model", "Train from scratch"], ans: 1, explanation: "Injecting docs into the system prompt is fast, cheap, and effective for most use cases." },
          { q: "When would you search before injecting?", opts: ["Never", "Always", "When the knowledge base is too large for one prompt", "When using GPT-4"], ans: 2, explanation: "Large knowledge bases exceed token limits, so you search first and inject only what's relevant." },
        ],
      },
      {
        day: 5, title: "Build the Chat UI",
        goal: "Create a simple React chat interface for your support bot.",
        lesson: "A chat UI needs a message list, an input field, and a send button. Messages are stored in component state as an array of {role, content} objects — the same shape as the OpenAI history array. Call your backend API (not OpenAI directly) to keep your key secure.",
        challenge: "Build a ChatWidget component with a scrollable message list and input that calls /api/chat.",
        code: `import { useState, useRef, useEffect } from "react";

export function ChatWidget() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! How can I help you today?" }
  ]);
  const [input, setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const res  = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [...messages, userMsg] }),
    });
    const data = await res.json();
    setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    setLoading(false);
  };

  return (
    <div style={{ border: "1px solid #ccc", borderRadius: 8, width: 360, display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, padding: 12, overflowY: "auto", maxHeight: 400 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.role === "user" ? "right" : "left", margin: "6px 0" }}>
            <span style={{ background: m.role === "user" ? "#0ea5e9" : "#f1f5f9", padding: "8px 12px", borderRadius: 12, display: "inline-block" }}>
              {m.content}
            </span>
          </div>
        ))}
        {loading && <div style={{ opacity: 0.5 }}>Typing…</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #ccc", padding: 8, gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc" }} placeholder="Type a message…" />
        <button onClick={send} style={{ padding: "8px 14px", background: "#0ea5e9", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}`,
        quiz: [
          { q: "Why call a backend API instead of OpenAI directly from React?", opts: ["It's faster", "To keep your API key secret", "React can't make fetch calls", "OpenAI blocks browser requests"], ans: 1, explanation: "Your OpenAI key must never be exposed in frontend code — always proxy through your backend." },
          { q: "What triggers the scroll-to-bottom effect?", opts: ["The input change", "The messages array changing", "A timer", "A window resize"], ans: 1, explanation: "The useEffect depends on messages, so it fires every time a new message is added." },
          { q: "What does 'loading' state control?", opts: ["API rate limits", "Preventing double sends while waiting for a reply", "Animation speed", "Message styling"], ans: 1, explanation: "Disabling send while loading prevents duplicate messages being sent." },
        ],
      },
      {
        day: 6, title: "Backend API Route",
        goal: "Create a secure /api/chat endpoint that proxies requests to OpenAI.",
        lesson: "Your chatbot backend keeps the API key on the server, validates incoming requests, and forwards them to OpenAI. In Vercel or Next.js, API routes live in the /api folder. They receive a request body, call OpenAI, and return the reply.",
        challenge: "Create api/chat.js that accepts a messages array, calls OpenAI with your system prompt, and returns the reply.",
        code: `// api/chat.js — Vercel serverless function
const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = \`You are a friendly customer support agent.
Answer questions about our products and services.
Keep replies under 3 sentences. Be helpful and professional.\`;

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { messages } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: "messages required" });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      max_tokens: 200,
    });
    res.status(200).json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};`,
        quiz: [
          { q: "Where does the API key live in this setup?", opts: ["In the React component", "In a Vercel environment variable", "In the browser", "In the database"], ans: 1, explanation: "Process.env.OPENAI_API_KEY reads from Vercel's environment variables — never exposed to the browser." },
          { q: "What HTTP method does this endpoint require?", opts: ["GET", "PUT", "POST", "DELETE"], ans: 2, explanation: "POST is used because we're sending a body with message data." },
          { q: "What does max_tokens control?", opts: ["Input length", "How long the response can be", "API cost per month", "Context window size"], ans: 1, explanation: "max_tokens limits the length of the generated response." },
        ],
      },
      {
        day: 7, title: "Deploy to Production",
        goal: "Deploy your chatbot live on Vercel with environment variables configured.",
        lesson: "Vercel makes deploying Node/React apps simple. You connect your GitHub repo, set environment variables in the Vercel dashboard, and every git push triggers a new deployment. The /api folder is automatically served as serverless functions.",
        challenge: "Create a vercel.json config, push to GitHub, and deploy your chatbot live.",
        code: `// vercel.json
{
  "env": {
    "OPENAI_API_KEY": "@openai-api-key"
  }
}

// Steps to deploy:
// 1. git init && git add . && git commit -m "Initial chatbot"
// 2. Create GitHub repo and push
// 3. Go to vercel.com → New Project → Import repo
// 4. Add environment variable: OPENAI_API_KEY = your key
// 5. Click Deploy

// Test your live URL:
// curl -X POST https://your-app.vercel.app/api/chat \\
//   -H "Content-Type: application/json" \\
//   -d '{"messages":[{"role":"user","content":"Hello"}]}'`,
        quiz: [
          { q: "Where do you set environment variables in Vercel?", opts: ["In vercel.json directly", "In the Vercel dashboard under Project Settings", "In .env committed to git", "In the package.json"], ans: 1, explanation: "Use the Vercel dashboard to set env vars — never commit secrets to git." },
          { q: "What triggers a new Vercel deployment?", opts: ["Manually via the dashboard only", "Any git push to the connected branch", "Running npm build", "Changing vercel.json"], ans: 1, explanation: "Vercel automatically deploys when you push to the connected GitHub branch." },
          { q: "How are /api/*.js files served on Vercel?", opts: ["As static files", "As serverless functions", "As a traditional server", "They must be in a separate repo"], ans: 1, explanation: "Vercel automatically detects files in /api and serves them as serverless functions." },
        ],
      },
      {
        day: 8, title: "Embed on Any Website",
        goal: "Turn the chatbot into an embeddable widget with a floating button.",
        lesson: "A production chatbot floats in the corner of any page. You build a toggle button that shows/hides the chat panel. The entire widget is self-contained and can be dropped into any site via a script tag or React component.",
        challenge: "Wrap the ChatWidget in a FloatingChat component with a circular toggle button in the bottom-right corner.",
        code: `import { useState } from "react";
import { ChatWidget } from "./ChatWidget";
import { MessageCircle, X } from "lucide-react";

export function FloatingChat() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999 }}>
      {open && (
        <div style={{ position: "absolute", bottom: 70, right: 0, boxShadow: "0 8px 32px rgba(0,0,0,0.2)", borderRadius: 12 }}>
          <ChatWidget />
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: 56, height: 56, borderRadius: "50%", background: "#0ea5e9", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(14,165,233,0.5)" }}
        aria-label={open ? "Close chat" : "Open chat"}
      >
        {open ? <X size={22} color="#fff" /> : <MessageCircle size={22} color="#fff" />}
      </button>
    </div>
  );
}

// Add to App.jsx:
// import { FloatingChat } from "./FloatingChat";
// <FloatingChat /> at the bottom of your JSX tree`,
        quiz: [
          { q: "What CSS position makes the widget stay in the corner when scrolling?", opts: ["absolute", "relative", "fixed", "sticky"], ans: 2, explanation: "position: fixed keeps an element in the same viewport position regardless of scrolling." },
          { q: "How do you toggle show/hide the chat panel?", opts: ["CSS display toggle via className", "Conditional render with useState", "CSS animation only", "A separate route"], ans: 1, explanation: "useState(false) tracks open state; conditional rendering shows/hides the panel." },
          { q: "What z-index ensures the widget appears above other content?", opts: ["1", "100", "A high value like 9999", "It doesn't matter"], ans: 2, explanation: "A high z-index like 9999 ensures the chat widget appears above all other page elements." },
        ],
      },
      {
        day: 9, title: "Rate Limiting & Error Handling",
        goal: "Protect your chatbot from abuse and handle API errors gracefully.",
        lesson: "Production chatbots need rate limiting to prevent abuse and cost overruns. You also need to handle OpenAI errors gracefully — the API can time out, return errors, or hit your quota. A good error handler catches these and shows a friendly fallback message instead of crashing.",
        challenge: "Add a per-user rate limiter (max 20 messages per hour) and wrap all API calls in try/catch with a friendly error message.",
        code: `// Simple in-memory rate limiter (use Redis in production)
const userMessageCounts = new Map();

function checkRateLimit(userId) {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxMessages = 20;

  if (!userMessageCounts.has(userId)) {
    userMessageCounts.set(userId, []);
  }

  const timestamps = userMessageCounts.get(userId)
    .filter(ts => now - ts < windowMs);

  if (timestamps.length >= maxMessages) {
    return { allowed: false, remaining: 0 };
  }

  timestamps.push(now);
  userMessageCounts.set(userId, timestamps);
  return { allowed: true, remaining: maxMessages - timestamps.length };
}

async function safeChatResponse(userId, message) {
  const { allowed, remaining } = checkRateLimit(userId);

  if (!allowed) {
    return "You've sent too many messages. Please wait an hour and try again.";
  }

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      timeout: 10000, // 10 second timeout
    });
    return res.choices[0].message.content;
  } catch (err) {
    if (err.status === 429) return "I'm busy right now — please try again in a moment.";
    if (err.status === 500) return "OpenAI is having issues. Please try again shortly.";
    console.error("Chat error:", err);
    return "Something went wrong. Please try again.";
  }
}`,
        quiz: [
          { q: "Why do production chatbots need rate limiting?", opts: ["To make responses faster", "To prevent abuse and control API costs", "Because OpenAI requires it", "To improve accuracy"], ans: 1, explanation: "Without rate limits, a single user or bot could send thousands of requests, running up your OpenAI bill." },
          { q: "What HTTP status code does OpenAI return when you hit your quota?", opts: ["400", "401", "429", "503"], ans: 2, explanation: "Status 429 means Too Many Requests — you've hit your rate or quota limit." },
          { q: "What is a good fallback when the AI API fails?", opts: ["Crash the app", "Return a friendly error message to the user", "Retry 100 times", "Return an empty string"], ans: 1, explanation: "A try/catch block catches the error and shows a helpful message so the user isn't left confused." },
        ],
      },
      {
        day: 10, title: "Usage Analytics & Cost Control",
        goal: "Track chatbot usage, monitor costs, and set spending alerts.",
        lesson: "Every OpenAI API response includes a usage object with token counts. You can log these to Firestore to track how many tokens each user is consuming and calculate your costs. Setting monthly budget alerts in the OpenAI dashboard prevents surprise bills. For high-traffic bots, caching common questions saves both money and latency.",
        challenge: "Log token usage per conversation to Firestore and build a simple admin function that calculates total cost for the month.",
        code: `// Log token usage after every response
async function chatWithTracking(userId, message) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: message }],
  });

  const { prompt_tokens, completion_tokens, total_tokens } = res.usage;

  // Log to Firestore
  await db.collection("usage").add({
    userId,
    prompt_tokens,
    completion_tokens,
    total_tokens,
    // GPT-3.5-turbo pricing (check OpenAI for current rates)
    cost_usd: (prompt_tokens * 0.0000015) + (completion_tokens * 0.000002),
    timestamp: new Date(),
  });

  return res.choices[0].message.content;
}

// Admin: calculate monthly cost
async function getMonthlyCost() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const snapshot = await db.collection("usage")
    .where("timestamp", ">=", startOfMonth)
    .get();

  const total = snapshot.docs.reduce((sum, doc) => sum + doc.data().cost_usd, 0);
  console.log(\`Month-to-date cost: $\${total.toFixed(4)}\`);
  return total;
}`,
        quiz: [
          { q: "Where do you find token usage in an OpenAI response?", opts: ["res.tokens", "res.usage", "res.data.usage", "res.choices[0].tokens"], ans: 1, explanation: "OpenAI includes a usage object in every response with prompt_tokens, completion_tokens, and total_tokens." },
          { q: "What is the most effective way to reduce OpenAI costs for a chatbot?", opts: ["Use shorter system prompts", "Cache answers to frequently asked questions", "Disable streaming", "Use a longer context window"], ans: 1, explanation: "Caching answers to common questions means you only call the API once per unique question, not repeatedly." },
          { q: "Where should you set hard spending limits for OpenAI?", opts: ["In your code", "In Vercel environment variables", "In the OpenAI dashboard under Billing", "In Firebase"], ans: 2, explanation: "The OpenAI dashboard lets you set hard monthly limits so you never exceed your budget." },
        ],
      },
    ],
  },

  // ── Module 2: AI Content Generator ────────────────────────────────────────
  {
    id: "content-generator",
    title: "AI Content Generator",
    tagline: "Generate posts and copy instantly",
    tagline_en: "Generate posts and copy instantly",
    icon: "✍️",
    color: "#7c3aed",
    accent: "#a78bfa",
    lang: "javascript",
    lessons: [
      {
        day: 1, title: "Prompt Engineering for Content",
        goal: "Write prompts that produce consistent, high-quality content output.",
        lesson: "Good content prompts specify format, tone, length, audience, and goal. The more specific your prompt, the better the output. Use structured templates with variables you can swap out for different content types.",
        challenge: "Write a reusable blog post prompt template with variables for topic, tone, and audience.",
        code: `function blogPrompt({ topic, tone = "professional", audience = "general", wordCount = 500 }) {
  return \`Write a \${wordCount}-word blog post about "\${topic}".
Tone: \${tone}
Target audience: \${audience}
Format:
- Engaging headline (H1)
- Introduction (2 sentences)
- 3 main sections with subheadings (H2)
- Conclusion with call to action
Use simple language. No fluff. Be specific and actionable.\`;
}

async function generateBlogPost(options) {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: blogPrompt(options) }],
    temperature: 0.7, // 0=focused, 1=creative
  });
  return res.choices[0].message.content;
}

// Usage
generateBlogPost({
  topic: "5 ways AI saves time in small businesses",
  tone: "conversational",
  audience: "small business owners",
  wordCount: 600,
});`,
        quiz: [
          { q: "What does the 'temperature' parameter control?", opts: ["Response speed", "Creativity vs focus of output", "Token count", "Model version"], ans: 1, explanation: "Temperature 0 gives focused, deterministic output. Higher values (0.7-1) give more creative variety." },
          { q: "Why use a template function for prompts?", opts: ["Required by the API", "To reuse prompts with different variables", "To reduce API cost", "Templates are faster"], ans: 1, explanation: "Template functions let you define the structure once and swap topic/tone/audience each time." },
          { q: "What makes a content prompt more effective?", opts: ["Being as vague as possible", "Specifying format, tone, length, and audience", "Using all caps", "Keeping it under 10 words"], ans: 1, explanation: "Specific, structured prompts with format instructions produce far more consistent, usable output." },
        ],
      },
      {
        day: 2, title: "Multi-Format Content Pipeline",
        goal: "Generate blog post, Twitter thread, and LinkedIn post from one input.",
        lesson: "The real power of AI content is generating multiple formats from a single idea. Write a pipeline that takes a topic and produces all your content formats at once. Use Promise.all to run them in parallel and cut total generation time in half.",
        challenge: "Build a generateAll(topic) function that returns blog, twitter, and linkedin content in parallel.",
        code: `const formats = {
  blog: (topic) => \`Write a 400-word blog post about "\${topic}" with an H1, intro, 3 sections, and CTA.\`,
  twitter: (topic) => \`Write a Twitter thread (7 tweets) about "\${topic}". Start with a hook. End with a CTA. Number each tweet.\`,
  linkedin: (topic) => \`Write a LinkedIn post about "\${topic}". 150-200 words. Professional but personal. End with a question to drive comments.\`,
};

async function generate(format, topic) {
  const res = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: formats[format](topic) }],
    temperature: 0.75,
  });
  return { format, content: res.choices[0].message.content };
}

async function generateAll(topic) {
  const results = await Promise.all(
    Object.keys(formats).map(format => generate(format, topic))
  );
  return Object.fromEntries(results.map(r => [r.format, r.content]));
}

// Usage
const content = await generateAll("How AI is changing remote work");
console.log(content.blog);
console.log(content.twitter);
console.log(content.linkedin);`,
        quiz: [
          { q: "What does Promise.all do?", opts: ["Runs promises one by one", "Runs promises in parallel and waits for all", "Cancels slow promises", "Retries failed promises"], ans: 1, explanation: "Promise.all runs all promises simultaneously and resolves when every one completes — much faster than sequential." },
          { q: "Why might you use different prompts for different formats?", opts: ["The API requires it", "Each format has different length, tone, and structure requirements", "It saves tokens", "Different models handle different formats"], ans: 1, explanation: "A tweet has different constraints than a blog post — your prompt needs to specify the right format each time." },
          { q: "What should you store from the pipeline output?", opts: ["Only the first result", "All generated content in a structured object", "Just the raw API response", "Only errors"], ans: 1, explanation: "Store all results in a structured object so you can access each format independently." },
        ],
      },
      {
        day: 3, title: "Brand Voice Training",
        goal: "Make the AI write in your specific brand voice using examples.",
        lesson: "Few-shot prompting means providing example inputs and outputs before your real request. For brand voice, show 2-3 examples of your existing content and tell the model to match that style. This is faster and cheaper than fine-tuning.",
        challenge: "Create a branded content generator that uses 2 existing posts as style examples.",
        code: `const brandExamples = [
  {
    input:  "email marketing tips",
    output: "Email isn't dead — it's just waiting for you to stop being boring. Here's what actually works in 2024: personalisation that goes beyond first names, send times that match YOUR audience (not the studies), and subject lines that create curiosity without clickbait. Test one thing at a time. Double down on what works.",
  },
  {
    input:  "social media strategy",
    output: "Stop trying to be everywhere. Pick one platform where your customers actually spend time, show up consistently for 90 days, and document what works. Most businesses fail at content because they spread thin and quit. Boring consistency beats brilliant inconsistency every time.",
  },
];

function brandedPrompt(topic) {
  const examples = brandExamples
    .map(e => \`Topic: \${e.input}\\nOutput: \${e.output}\`)
    .join("\\n\\n");

  return \`Write in this exact style and voice.

Examples:
\${examples}

Now write content about: \${topic}
Match the tone, sentence length, and personality from the examples.\`;
}`,
        quiz: [
          { q: "What is few-shot prompting?", opts: ["Using the smallest model", "Providing example inputs/outputs to guide the model", "Limiting response length", "Running multiple prompts simultaneously"], ans: 1, explanation: "Few-shot prompting gives the model examples to learn the pattern you want it to follow." },
          { q: "How many examples are typically enough for brand voice?", opts: ["20+", "Exactly 10", "2-5 good examples", "100+"], ans: 2, explanation: "2-5 high-quality examples that represent your voice well is usually enough for consistent output." },
          { q: "What's a faster alternative to fine-tuning for brand voice?", opts: ["Bigger model", "Few-shot prompting with examples", "More tokens", "Different temperature"], ans: 1, explanation: "Few-shot prompting in the system prompt achieves good brand voice without the cost and time of fine-tuning." },
        ],
      },
      {
        day: 4, title: "Content Dashboard UI",
        goal: "Build a React UI to generate, preview, and copy content.",
        lesson: "A content generator UI needs a topic input, format selector, generate button, and a results panel. Show a loading state while generating. Add a copy-to-clipboard button for each format so the user can move content to their tools instantly.",
        challenge: "Build a ContentGenerator component that calls your API and displays results for all 3 formats with copy buttons.",
        code: `import { useState } from "react";

export function ContentGenerator() {
  const [topic, setTopic]     = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied]   = useState("");

  const generate = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResults(null);
    const res  = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    setResults(data);
    setLoading(false);
  };

  const copy = (format, text) => {
    navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1>AI Content Generator</h1>
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <input
          value={topic} onChange={e => setTopic(e.target.value)}
          placeholder="Enter your content topic…"
          style={{ flex: 1, padding: 12, borderRadius: 8, border: "1px solid #ddd", fontSize: 16 }}
          onKeyDown={e => e.key === "Enter" && generate()}
        />
        <button onClick={generate} disabled={loading} style={{ padding: "12px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>
          {loading ? "Generating…" : "Generate"}
        </button>
      </div>

      {results && Object.entries(results).map(([format, content]) => (
        <div key={format} style={{ marginBottom: 20, border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <strong style={{ textTransform: "capitalize" }}>{format}</strong>
            <button onClick={() => copy(format, content)} style={{ padding: "4px 12px", border: "1px solid #ddd", borderRadius: 6, cursor: "pointer", background: copied === format ? "#10b981" : "#fff", color: copied === format ? "#fff" : "#374151" }}>
              {copied === format ? "Copied!" : "Copy"}
            </button>
          </div>
          <pre style={{ padding: 16, margin: 0, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6 }}>{content}</pre>
        </div>
      ))}
    </div>
  );
}`,
        quiz: [
          { q: "How does copy-to-clipboard work in the browser?", opts: ["document.execCommand('copy')", "navigator.clipboard.writeText(text)", "window.copy(text)", "fetch('/clipboard', {body: text})"], ans: 1, explanation: "navigator.clipboard.writeText() is the modern, async API for writing to the clipboard." },
          { q: "Why set results to null before generating?", opts: ["Required by the API", "To clear the previous results while new ones load", "To reset the form", "To save memory"], ans: 1, explanation: "Clearing results ensures the user sees a fresh loading state and isn't confused by stale content." },
          { q: "What does Object.entries() do?", opts: ["Returns only the keys", "Returns [key, value] pairs as an array", "Filters object properties", "Converts to JSON"], ans: 1, explanation: "Object.entries(obj) returns [[key1, val1], [key2, val2], ...] — useful for rendering key-value data." },
        ],
      },
      {
        day: 5, title: "Schedule & Automate Publishing",
        goal: "Auto-generate and store a week of content in one click.",
        lesson: "Batch generation means creating all your content for a period in advance. Store generated content in a database (or Firestore) with a scheduled_for date. You can then integrate with social APIs or export to your CMS. This workflow replaces hours of weekly content work.",
        challenge: "Build a generateWeek(topics) function that produces 7 days of content and saves each to Firestore.",
        code: `import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

async function generateAndSave(topic, scheduledFor) {
  const res  = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic }),
  });
  const content = await res.json();

  await addDoc(collection(db, "content"), {
    topic,
    content,
    scheduledFor,
    status: "draft",
    createdAt: serverTimestamp(),
  });
  return content;
}

async function generateWeek(topics) {
  const results = [];
  for (let i = 0; i < topics.length; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const content = await generateAndSave(topics[i], date.toISOString());
    results.push(content);
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }
  return results;
}

// Usage
generateWeek([
  "5 AI tools every marketer needs",
  "How to write better emails with AI",
  "Building a content calendar in 30 minutes",
]);`,
        quiz: [
          { q: "Why add a delay between API calls in batch generation?", opts: ["It improves quality", "To avoid hitting OpenAI rate limits", "Required by Firebase", "To save costs"], ans: 1, explanation: "OpenAI rate-limits requests per minute. A small delay prevents 429 Too Many Requests errors." },
          { q: "What status should generated drafts have initially?", opts: ["published", "active", "draft", "pending"], ans: 2, explanation: "Marking as 'draft' lets you review content before publishing, giving a human approval step." },
          { q: "What Firestore function adds a new document with an auto-generated ID?", opts: ["setDoc", "updateDoc", "addDoc", "createDoc"], ans: 2, explanation: "addDoc(collection, data) adds a document with a Firestore-generated unique ID." },
        ],
      },
      {
        day: 6, title: "Deploy the Content Generator",
        goal: "Deploy your full content generation tool to production.",
        lesson: "Final deployment checklist: API routes secured, env vars set, CORS configured, Firestore rules locked down. Add basic rate limiting to protect your OpenAI budget. Set a monthly spending limit in OpenAI's dashboard before going live.",
        challenge: "Deploy to Vercel, add OpenAI budget limits, and lock Firestore rules so only authenticated users can write.",
        code: `// firestore.rules — only authenticated users can read/write their own data
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /content/{docId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}

// api/generate.js — add simple rate limiting
const rateMap = new Map();

module.exports = async function handler(req, res) {
  const ip   = req.headers["x-forwarded-for"] || "unknown";
  const now  = Date.now();
  const last = rateMap.get(ip) || 0;

  if (now - last < 5000) { // 5 second cooldown per IP
    return res.status(429).json({ error: "Too many requests. Please wait." });
  }
  rateMap.set(ip, now);

  // ... rest of handler
};`,
        quiz: [
          { q: "What do Firestore security rules control?", opts: ["Who can access your Vercel deployment", "Who can read and write documents in Firestore", "OpenAI API usage", "Firebase Auth login methods"], ans: 1, explanation: "Firestore security rules define read/write permissions at the document and collection level." },
          { q: "What HTTP status code means 'too many requests'?", opts: ["400", "401", "403", "429"], ans: 3, explanation: "HTTP 429 Too Many Requests is the standard status for rate limiting." },
          { q: "Where should you set OpenAI spending limits?", opts: ["In your code", "In Vercel settings", "In the OpenAI dashboard under Billing", "In .env files"], ans: 2, explanation: "OpenAI's dashboard lets you set monthly hard limits to prevent unexpected charges." },
        ],
      },
      {
        day: 7, title: "AI Image Generation",
        goal: "Add AI-generated images to your content using DALL·E.",
        lesson: "OpenAI's DALL·E API lets you generate images from text prompts. For a content generator, this means you can automatically create social media images, blog headers, and ad visuals to go with the text you generate. You describe the image in a prompt and get back a URL to the generated image.",
        challenge: "Extend your content generator to also produce a matching DALL·E image prompt and generate a cover image for each piece of content.",
        code: `import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateContentWithImage(topic, brandVoice) {
  // Step 1: Generate the written content
  const textRes = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: brandVoice },
      { role: "user",   content: \`Write a LinkedIn post about: \${topic}\` },
    ],
  });
  const post = textRes.choices[0].message.content;

  // Step 2: Generate a matching image
  const imageRes = await openai.images.generate({
    model:   "dall-e-3",
    prompt:  \`Professional, modern illustration for a LinkedIn post about: \${topic}. Clean, minimal, no text.\`,
    size:    "1792x1024",  // landscape — good for social media
    quality: "standard",
    n:       1,
  });
  const imageUrl = imageRes.data[0].url;

  return { post, imageUrl };
}

// Usage:
const { post, imageUrl } = await generateContentWithImage(
  "AI automation for small businesses",
  "You are a professional content writer. Tone: insightful and practical."
);
console.log(post);
console.log("Image:", imageUrl);`,
        quiz: [
          { q: "Which OpenAI model generates images?", opts: ["GPT-4", "Whisper", "DALL·E 3", "Embeddings"], ans: 2, explanation: "DALL·E 3 is OpenAI's image generation model, accessed via openai.images.generate()." },
          { q: "What does the DALL·E API return?", opts: ["A file download", "A URL to the generated image", "A base64 string only", "An image ID to fetch later"], ans: 1, explanation: "By default, DALL·E returns a URL. You can also request base64 format by setting response_format: 'b64_json'." },
          { q: "What image size is best for social media landscape posts?", opts: ["1024x1024", "512x512", "1792x1024", "256x256"], ans: 2, explanation: "1792x1024 is the landscape format — ideal for LinkedIn, Twitter headers, and blog covers." },
        ],
      },
      {
        day: 8, title: "SEO-Optimised Content",
        goal: "Generate content that ranks on Google by including keywords and structure.",
        lesson: "SEO content follows a specific structure: a keyword-rich headline, meta description, H2 subheadings, and natural keyword placement in the body. You can prompt GPT to follow SEO best practices automatically. The model can also suggest target keywords for a topic and generate structured data (JSON-LD) for rich search results.",
        challenge: "Build a function that takes a topic and returns a full SEO blog post with a title, meta description, keyword suggestions, and structured H2 sections.",
        code: `async function generateSEOPost(topic) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: \`You are an SEO content expert. Always respond with valid JSON.\`,
      },
      {
        role: "user",
        content: \`Write an SEO-optimised blog post about: "\${topic}".
Return JSON with this exact structure:
{
  "title": "keyword-rich H1 title",
  "metaDescription": "150-160 char meta description with primary keyword",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "sections": [
    { "h2": "Subheading", "content": "2-3 paragraphs of content" }
  ],
  "wordCount": 800
}\`,
      },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content);
}

const post = await generateSEOPost("AI tools for freelancers");
console.log(\`Title: \${post.title}\`);
console.log(\`Keywords: \${post.keywords.join(", ")}\`);
console.log(\`Sections: \${post.sections.length}\`);`,
        quiz: [
          { q: "What is a meta description used for?", opts: ["It styles the page header", "It appears in search results below the title", "It tells the browser the charset", "It sets the page language"], ans: 1, explanation: "The meta description appears in Google search results as the snippet under the page title — it affects click-through rate." },
          { q: "How do you tell GPT to always return JSON?", opts: ["Add 'JSON only' to the system prompt", "Use response_format: { type: 'json_object' }", "Parse the result manually", "Use model: 'gpt-4-json'"], ans: 1, explanation: "Setting response_format: { type: 'json_object' } forces the model to return valid JSON every time." },
          { q: "What is the ideal length for a meta description?", opts: ["50-80 characters", "100-120 characters", "150-160 characters", "200+ characters"], ans: 2, explanation: "Google typically shows 150-160 characters in search results. Shorter gets cut off or padded; longer gets truncated." },
        ],
      },
      {
        day: 9, title: "Content Templates Library",
        goal: "Build a reusable library of prompt templates for different content types.",
        lesson: "Professional content generators use a library of battle-tested templates rather than writing prompts from scratch each time. Each template has a name, category, required variables, and a prompt string with placeholders. Users pick a template, fill in the variables, and get consistent output. This is how agencies build scalable content systems.",
        challenge: "Create a TEMPLATES array with at least 5 content templates (LinkedIn post, cold email, product description, Twitter thread, blog intro) and build a function that fills in any template from user inputs.",
        code: `const TEMPLATES = [
  {
    id:       "linkedin-post",
    name:     "LinkedIn Post",
    category: "Social Media",
    variables: ["topic", "audience", "tone"],
    prompt: \`Write a LinkedIn post about {{topic}} for {{audience}}.
Tone: {{tone}}. Include a hook, 3 key insights, and a call to action.
Use short paragraphs. Max 250 words.\`,
  },
  {
    id:       "cold-email",
    name:     "Cold Outreach Email",
    category: "Email",
    variables: ["prospect_name", "company", "pain_point", "solution"],
    prompt: \`Write a short cold email to {{prospect_name}} at {{company}}.
Their pain point: {{pain_point}}.
Our solution: {{solution}}.
Max 100 words. Subject line included. Friendly, not salesy.\`,
  },
  {
    id:       "product-description",
    name:     "Product Description",
    category: "E-commerce",
    variables: ["product_name", "key_features", "target_buyer"],
    prompt: \`Write a compelling product description for {{product_name}}.
Key features: {{key_features}}.
Target buyer: {{target_buyer}}.
Include benefits (not just features). Max 120 words.\`,
  },
];

function fillTemplate(templateId, variables) {
  const template = TEMPLATES.find(t => t.id === templateId);
  if (!template) throw new Error(\`Template '\${templateId}' not found\`);

  let prompt = template.prompt;
  for (const [key, value] of Object.entries(variables)) {
    prompt = prompt.replaceAll(\`{{\${key}}}\`, value);
  }
  return prompt;
}

// Usage:
const prompt = fillTemplate("cold-email", {
  prospect_name: "Sarah",
  company:       "GrowthCo",
  pain_point:    "spending hours writing personalised emails",
  solution:      "our AI email tool that writes them in seconds",
});`,
        quiz: [
          { q: "Why use templates instead of writing prompts from scratch each time?", opts: ["Templates are faster to type", "They give consistent, predictable output and save time", "OpenAI requires templates", "Templates use fewer tokens"], ans: 1, explanation: "Tested templates produce reliable results and can be reused across clients and campaigns without quality variation." },
          { q: "What does replaceAll() do in the template fill function?", opts: ["Replaces only the first match", "Replaces every occurrence of the placeholder with the variable value", "Deletes the variable", "Formats the string as JSON"], ans: 1, explanation: "replaceAll() replaces every instance of the placeholder (e.g. {{topic}}) with the provided value throughout the prompt." },
          { q: "What should a good prompt template always specify?", opts: ["Just the topic", "Format, tone, length, and audience", "Only the word count", "The model name"], ans: 1, explanation: "Effective templates constrain format, tone, length, and audience so the AI produces consistent professional output every time." },
        ],
      },
      {
        day: 10, title: "Bulk Export & Content Calendar",
        goal: "Generate a full week of content in one click and export to CSV.",
        lesson: "The most powerful feature of a content generator is bulk creation — generating an entire week or month of content in one run. You loop over topics, call the AI for each, collect results, then export everything to a CSV file the user can upload directly to their scheduling tool (Buffer, Hootsuite, etc.).",
        challenge: "Build a generateWeek() function that produces 7 social posts from a list of topics and exports them as a downloadable CSV file.",
        code: `import { createObjectCsvWriter } from "csv-writer";

async function generateWeek(topics, brandVoice) {
  console.log(\`Generating \${topics.length} posts...\`);
  const posts = [];

  for (const [i, topic] of topics.entries()) {
    console.log(\`[\${i + 1}/\${topics.length}] \${topic}\`);

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: brandVoice },
        { role: "user",   content: \`Write a LinkedIn post about: \${topic}. Max 200 words.\` },
      ],
    });

    posts.push({
      date:     getDateDaysFromNow(i),  // schedule one per day
      topic,
      content:  res.choices[0].message.content,
      platform: "LinkedIn",
      status:   "scheduled",
    });

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 500));
  }

  // Export to CSV
  const writer = createObjectCsvWriter({
    path: "content-calendar.csv",
    header: ["date", "topic", "content", "platform", "status"].map(id => ({ id, title: id.toUpperCase() })),
  });
  await writer.writeRecords(posts);
  console.log(\`✅ Exported \${posts.length} posts to content-calendar.csv\`);
  return posts;
}

function getDateDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}`,
        quiz: [
          { q: "Why add a 500ms delay between API calls in a loop?", opts: ["To look more human", "To avoid hitting OpenAI's rate limits", "It's required by the API", "To reduce token usage"], ans: 1, explanation: "OpenAI enforces rate limits (requests per minute). A small delay between calls prevents 429 errors during bulk generation." },
          { q: "What is a CSV file used for in a content calendar?", opts: ["To store images", "To schedule posts in tools like Buffer and Hootsuite", "To compress content", "To encrypt the post data"], ans: 1, explanation: "Most social scheduling tools (Buffer, Hootsuite, Later) accept CSV uploads for bulk scheduling — making export very valuable." },
          { q: "What does createObjectCsvWriter do?", opts: ["Reads a CSV file", "Creates and writes JavaScript objects as rows in a CSV file", "Converts CSV to JSON", "Uploads CSV to cloud storage"], ans: 1, explanation: "csv-writer's createObjectCsvWriter maps JavaScript object arrays to CSV rows — each object property becomes a column." },
        ],
      },
    ],
  },

  // ── Module 3: Email Automation Tool ───────────────────────────────────────
  {
    id: "email-automation",
    title: "Email Automation Tool",
    tagline: "Personalized emails at scale",
    tagline_en: "Personalized emails at scale",
    icon: "📧",
    color: "#059669",
    accent: "#34d399",
    lang: "javascript",
    lessons: [
      {
        day: 1, title: "Email API Setup with Resend",
        goal: "Send your first programmatic email using Resend and Node.js.",
        lesson: "Resend is the simplest modern email API. You create an API key, verify your domain, and send emails with one function call. It handles deliverability, which is the hardest part of email — ensuring your message lands in the inbox, not spam.",
        challenge: "Set up Resend, verify a sending domain, and send a test email from your app.",
        code: `import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail({ to, subject, html }) {
  const { data, error } = await resend.emails.send({
    from:    "Your Name <hello@yourdomain.com>",
    to,
    subject,
    html,
  });

  if (error) throw new Error(error.message);
  return data;
}

// Test it
sendEmail({
  to:      "test@example.com",
  subject: "Hello from my AI email tool!",
  html:    "<h1>It works!</h1><p>Your email automation is set up correctly.</p>",
});`,
        quiz: [
          { q: "Why does email deliverability matter?", opts: ["It's not important", "Emails in spam folders are never seen", "It affects API cost", "It determines email speed"], ans: 1, explanation: "If emails land in spam, your open rates collapse and your automation is worthless." },
          { q: "What does 'from' in an email API call need to match?", opts: ["Any email address", "A verified domain you own", "Your personal Gmail", "The recipient's domain"], ans: 1, explanation: "Email services require you to send from a domain you've verified to prevent spam abuse." },
          { q: "What format does the 'html' field expect?", opts: ["Plain text", "Markdown", "HTML string", "JSON"], ans: 2, explanation: "Email clients render HTML, so the email body is passed as an HTML string." },
        ],
      },
      {
        day: 2, title: "AI-Personalised Email Copy",
        goal: "Use GPT to generate personalised email content for each recipient.",
        lesson: "True personalisation goes beyond inserting a first name. GPT can write entirely different emails based on the recipient's company, role, pain points, or recent activity. This dramatically increases open and reply rates versus template-based emails.",
        challenge: "Build a generateEmail(contact) function that writes a personalised cold outreach email for each contact.",
        code: `async function generateEmail(contact) {
  const prompt = \`Write a personalised cold outreach email.

Recipient:
- Name: \${contact.name}
- Company: \${contact.company}
- Role: \${contact.role}
- Pain point: \${contact.painPoint}

Our product: An AI automation tool that saves \${contact.role}s 10+ hours/week.

Requirements:
- Subject line (max 8 words, no clickbait)
- Opening line that references their specific situation
- 2-sentence value prop connecting our product to their pain point
- Single clear CTA
- Casual but professional tone
- Max 120 words total

Format the response as JSON: { subject, body }\`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });
  return JSON.parse(res.choices[0].message.content);
}

// Example
const email = await generateEmail({
  name:       "Sarah Chen",
  company:    "GrowthCo",
  role:       "Marketing Manager",
  painPoint:  "spending 15 hours a week writing content manually",
});`,
        quiz: [
          { q: "What does response_format: { type: 'json_object' } do?", opts: ["Makes the API faster", "Forces the model to return valid JSON", "Reduces token cost", "Changes the model used"], ans: 1, explanation: "JSON mode guarantees the output is parseable JSON — crucial for programmatic use." },
          { q: "What makes AI personalisation better than mail merge?", opts: ["It's cheaper", "The copy is uniquely written for each person, not just name-swapped", "It works with any email client", "It's faster to set up"], ans: 1, explanation: "GPT writes entirely different emails based on each contact's context, not just replacing {{first_name}}." },
          { q: "What is a cold outreach email?", opts: ["An email to existing customers", "An email to someone who hasn't heard of you before", "A follow-up email", "A transactional email"], ans: 1, explanation: "Cold outreach is contacting people who haven't opted in — personalisation is critical for response rates." },
        ],
      },
      {
        day: 3, title: "Email Sequences",
        goal: "Build a 3-part drip sequence that sends automatically over time.",
        lesson: "An email sequence sends a series of emails at set intervals after someone signs up or takes an action. Store contacts in Firestore with a sequence_step field and a send_after timestamp. A cron job checks every hour and sends any emails that are due.",
        challenge: "Build the sequence logic that creates 3 scheduled emails for a new lead and a sendDue() function to process them.",
        code: `import { collection, addDoc, query, where, getDocs, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const SEQUENCE = [
  { step: 1, delayDays: 0,  subject: "Quick question about {pain_point}" },
  { step: 2, delayDays: 3,  subject: "Did you see this, {first_name}?" },
  { step: 3, delayDays: 7,  subject: "Last thought on this" },
];

async function enrollContact(contact) {
  for (const step of SEQUENCE) {
    const sendAfter = new Date();
    sendAfter.setDate(sendAfter.getDate() + step.delayDays);

    await addDoc(collection(db, "email_queue"), {
      contactId:  contact.id,
      contact,
      step:       step.step,
      sendAfter:  sendAfter.toISOString(),
      status:     "pending",
      createdAt:  serverTimestamp(),
    });
  }
}

// Called by cron job (e.g. every hour via Vercel Cron)
async function sendDue() {
  const now  = new Date().toISOString();
  const snap = await getDocs(
    query(collection(db, "email_queue"),
      where("status",    "==", "pending"),
      where("sendAfter", "<=", now)
    )
  );

  for (const docSnap of snap.docs) {
    const { contact, step } = docSnap.data();
    const emailContent = await generateEmail(contact);
    await sendEmail({ to: contact.email, ...emailContent });
    await updateDoc(doc(db, "email_queue", docSnap.id), { status: "sent" });
  }
}`,
        quiz: [
          { q: "What is a drip sequence?", opts: ["A single promotional email", "A series of emails sent at scheduled intervals", "An email with images", "A spam technique"], ans: 1, explanation: "A drip sequence automatically sends pre-planned emails at set intervals — guiding leads through a funnel." },
          { q: "How do you query Firestore for emails due to send?", opts: ["Use a JavaScript filter after fetching all", "Use where() clauses to filter at the database level", "Scan all documents manually", "Use a separate API"], ans: 1, explanation: "Firestore where() clauses filter documents server-side — much more efficient than fetching everything." },
          { q: "What prevents a sent email from being sent again?", opts: ["Deleting the document", "Setting status to 'sent'", "Adding a unique ID check", "Using a Set in memory"], ans: 1, explanation: "Updating status to 'sent' ensures the next cron run skips already-processed emails." },
        ],
      },
      {
        day: 4, title: "Open & Click Tracking",
        goal: "Track email opens and link clicks to measure campaign performance.",
        lesson: "Email tracking uses a 1x1 transparent pixel image for opens and redirected links for clicks. When someone opens your email, their client loads the pixel from your server — logging the open. Clicks route through your server before redirecting to the destination.",
        challenge: "Add a tracking pixel to outgoing emails and create an /api/track endpoint that logs events.",
        code: `// api/track.js — records open/click events
module.exports = async function handler(req, res) {
  const { type, emailId, contactId } = req.query;

  // Log the event to Firestore
  await addDoc(collection(db, "email_events"), {
    type,       // "open" or "click"
    emailId,
    contactId,
    timestamp: new Date().toISOString(),
    userAgent: req.headers["user-agent"],
  });

  if (type === "open") {
    // Return a 1x1 transparent GIF
    const pixel = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==", "base64");
    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Cache-Control", "no-cache");
    return res.end(pixel);
  }

  if (type === "click") {
    const { url } = req.query;
    return res.redirect(302, decodeURIComponent(url));
  }
};

// In your email HTML template:
function addTracking(html, emailId, contactId) {
  const base    = process.env.APP_URL;
  const trackUrl = \`\${base}/api/track?type=open&emailId=\${emailId}&contactId=\${contactId}\`;
  const pixel    = \`<img src="\${trackUrl}" width="1" height="1" style="display:none" />\`;
  return html + pixel;
}`,
        quiz: [
          { q: "How does open tracking work?", opts: ["JavaScript in the email", "A hidden 1x1 image loaded from your server", "The email client notifies you", "A read receipt header"], ans: 1, explanation: "A tiny image is embedded in the email. When it loads, your server logs the open. JS doesn't run in most email clients." },
          { q: "What HTTP status redirects the user to the real URL on a click?", opts: ["200", "301", "302", "404"], ans: 2, explanation: "302 is a temporary redirect — the browser follows it to the final URL immediately." },
          { q: "Why might open tracking be unreliable?", opts: ["Images always load", "Some email clients block external images by default", "Pixels are too small", "It requires JavaScript"], ans: 1, explanation: "Many email clients block remote images by default, so not every open gets tracked." },
        ],
      },
      {
        day: 5, title: "Analytics Dashboard",
        goal: "Build a dashboard showing open rates, click rates, and sequence performance.",
        lesson: "Email analytics aggregate your tracking events into meaningful metrics: open rate (opens / sent), click rate (clicks / opens), reply rate. Display these per campaign and per sequence step to understand where your funnel drops off.",
        challenge: "Build a useEmailStats hook that reads from email_events and returns aggregated metrics per campaign.",
        code: `import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export function useEmailStats(campaignId) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function load() {
      const [sentSnap, openSnap, clickSnap] = await Promise.all([
        getDocs(query(collection(db, "email_queue"),  where("campaignId", "==", campaignId), where("status", "==", "sent"))),
        getDocs(query(collection(db, "email_events"), where("campaignId", "==", campaignId), where("type", "==", "open"))),
        getDocs(query(collection(db, "email_events"), where("campaignId", "==", campaignId), where("type", "==", "click"))),
      ]);

      const sent   = sentSnap.size;
      const opens  = openSnap.size;
      const clicks = clickSnap.size;

      setStats({
        sent,
        openRate:  sent  > 0 ? Math.round((opens  / sent)  * 100) : 0,
        clickRate: opens > 0 ? Math.round((clicks / opens) * 100) : 0,
      });
    }
    load();
  }, [campaignId]);

  return stats;
}`,
        quiz: [
          { q: "How is open rate calculated?", opts: ["clicks / sent", "opens / sent * 100", "sent / opens", "opens + clicks"], ans: 1, explanation: "Open rate = (unique opens / total sent) × 100 — shows what % of recipients opened the email." },
          { q: "What does click-through rate measure?", opts: ["Opens vs sent", "Clicks vs total sent", "Clicks vs opens", "Replies vs opens"], ans: 2, explanation: "CTR = clicks / opens — it measures how compelling your email content and CTA are." },
          { q: "Why use Promise.all for the 3 Firestore queries?", opts: ["Required by Firestore", "To run them in parallel and load faster", "To avoid errors", "It combines the results automatically"], ans: 1, explanation: "Promise.all runs all 3 queries simultaneously — roughly 3x faster than running them in sequence." },
        ],
      },
      {
        day: 6, title: "Cron Jobs & Automation",
        goal: "Set up a Vercel Cron Job to send emails automatically every hour.",
        lesson: "Cron jobs run functions on a schedule without manual intervention. Vercel Cron lets you define schedules in vercel.json. Your /api/cron/send-emails endpoint processes the queue every hour. This is what makes your email tool truly autonomous.",
        challenge: "Set up a Vercel cron job that calls sendDue() every hour and add error alerts for failed sends.",
        code: `// vercel.json — add cron configuration
{
  "crons": [
    {
      "path": "/api/cron/send-emails",
      "schedule": "0 * * * *"
    }
  ]
}

// api/cron/send-emails.js
module.exports = async function handler(req, res) {
  // Vercel sends a secret header for cron jobs
  if (req.headers.authorization !== \`Bearer \${process.env.CRON_SECRET}\`) {
    return res.status(401).end("Unauthorized");
  }

  try {
    const sent = await sendDue();
    res.status(200).json({ success: true, sent: sent.length });
  } catch (err) {
    // Alert you if something breaks
    console.error("Cron email error:", err);
    // Optionally send yourself an alert email
    await sendEmail({
      to:      process.env.ALERT_EMAIL,
      subject: "⚠️ Email cron failed",
      html:    \`<p>Error: \${err.message}</p>\`,
    });
    res.status(500).json({ error: err.message });
  }
};`,
        quiz: [
          { q: "What does '0 * * * *' mean in cron syntax?", opts: ["Every second", "Every minute", "At minute 0 of every hour", "At midnight every day"], ans: 2, explanation: "'0 * * * *' means 'at minute 0' of every hour — so the job runs once per hour." },
          { q: "Why does the cron endpoint check an authorization header?", opts: ["It's optional", "To prevent anyone from triggering it manually", "Vercel requires it for all routes", "To rate limit responses"], ans: 1, explanation: "Without auth, anyone could trigger your cron endpoint. CRON_SECRET prevents unauthorized calls." },
          { q: "What should you do when a cron job fails silently?", opts: ["Nothing — cron jobs always retry", "Send an alert email or notification", "Delete the queue", "Restart the server"], ans: 1, explanation: "Silent failures in automation are dangerous. Always alert yourself when a scheduled task errors." },
        ],
      },
      {
        day: 7, title: "Full Deployment & Go Live",
        goal: "Deploy the complete email automation tool and send your first real campaign.",
        lesson: "Final deployment: environment variables for Resend, OpenAI, Firebase Admin, and the cron secret. Lock down Firestore rules. Test the full flow end-to-end. Then send your first real campaign. You now have a production AI email automation tool.",
        challenge: "Complete checklist: all env vars set, Firestore rules locked, cron running, test campaign sent to 3 real contacts.",
        code: `// Final environment variables needed:
// RESEND_API_KEY       — email sending
// OPENAI_API_KEY       — AI personalisation
// FIREBASE_PROJECT_ID  — Firestore database
// FIREBASE_CLIENT_EMAIL— Firebase Admin
// FIREBASE_PRIVATE_KEY — Firebase Admin (use \\n for newlines)
// CRON_SECRET          — protects cron endpoint
// APP_URL              — your Vercel URL (for tracking pixels)
// ALERT_EMAIL          — where to send error alerts

// Deployment checklist (run each and tick off):
// ✅ All env vars set in Vercel dashboard
// ✅ Firestore security rules deployed
// ✅ Cron job visible in Vercel dashboard
// ✅ Test email delivers to inbox (not spam)
// ✅ Tracking pixel logs opens
// ✅ Link clicks redirect correctly
// ✅ Analytics dashboard shows data
// ✅ First real campaign enrolled

// To enroll your first contacts:
const testContacts = [
  { id: "1", name: "Alex Kim",   email: "alex@example.com",  company: "StartupX", role: "Founder",           painPoint: "manually writing all marketing content" },
  { id: "2", name: "Jamie Lee",  email: "jamie@example.com", company: "AgencyY",  role: "Account Manager",   painPoint: "spending hours on personalised client emails" },
];

for (const contact of testContacts) {
  await enrollContact(contact);
}
console.log("Campaign launched! Check your dashboard for stats.");`,
        quiz: [
          { q: "What is the most common reason emails land in spam?", opts: ["Sending too slowly", "Unverified sending domain and poor sender reputation", "HTML formatting", "Subject line length"], ans: 1, explanation: "Email deliverability depends primarily on domain verification (SPF, DKIM, DMARC) and sender reputation." },
          { q: "What should you test before a real campaign?", opts: ["Nothing — just send it", "Full end-to-end flow with test contacts first", "Only the subject line", "Just check env vars"], ans: 1, explanation: "Always run the complete flow with real test contacts before launching to your actual list." },
          { q: "What does enrollContact() do?", opts: ["Sends the first email immediately", "Creates all scheduled emails in the queue", "Signs up the contact in Firebase Auth", "Adds the contact to a mailing list only"], ans: 1, explanation: "enrollContact() creates all 3 (or more) queued email documents with their send_after timestamps." },
        ],
      },
      {
        day: 8, title: "A/B Testing Email Subject Lines",
        goal: "Use AI to generate subject line variants and track which performs best.",
        lesson: "A/B testing means sending two versions of an email to different groups and measuring which gets more opens. AI can generate multiple compelling subject line variants instantly — you then split your list and track open rates. The winning subject line tells you exactly what resonates with your audience.",
        challenge: "Build a function that generates 5 subject line variants for an email using GPT, randomly assigns each contact to a variant, and tracks which variant each contact received.",
        code: `// Generate subject line variants with AI
async function generateSubjectVariants(emailContent, count = 5) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: "You are an email marketing expert. Return only valid JSON." },
      { role: "user", content: \`Generate \${count} different subject lines for this email.
Each should use a different angle: curiosity, benefit, urgency, question, social proof.
Email content: \${emailContent.slice(0, 500)}
Return JSON: { "variants": ["subject1", "subject2", ...] }\` },
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(res.choices[0].message.content).variants;
}

// Assign contacts to variants and track
async function sendABTest(contacts, emailContent) {
  const subjects = await generateSubjectVariants(emailContent);
  console.log("Testing subjects:", subjects);

  for (const contact of contacts) {
    // Randomly assign to a variant
    const variantIndex = Math.floor(Math.random() * subjects.length);
    const subject = subjects[variantIndex];

    await resend.emails.send({
      from:    "hello@yourdomain.com",
      to:      contact.email,
      subject: subject,
      html:    emailContent,
      headers: { "X-AB-Variant": String(variantIndex) },
    });

    // Save which variant this contact received
    await db.collection("ab_tests").add({
      contactId: contact.id,
      variantIndex,
      subject,
      sentAt: new Date(),
      opened: false, // updated by webhook later
    });
  }
}`,
        quiz: [
          { q: "What is the goal of A/B testing email subject lines?", opts: ["To send more emails", "To find which subject line gets the most opens", "To reduce bounce rates", "To personalise the email body"], ans: 1, explanation: "A/B testing identifies what language and style resonates most with your audience, improving open rates over time." },
          { q: "How do you track which variant a contact received?", opts: ["By guessing later", "By saving the variant assignment to a database when sending", "Email clients report this automatically", "By asking the contact"], ans: 1, explanation: "You must save the variant assignment at send time — correlate it with open tracking data to determine the winner." },
          { q: "What email metric does subject line testing primarily improve?", opts: ["Click-through rate", "Bounce rate", "Open rate", "Unsubscribe rate"], ans: 2, explanation: "The subject line is what recipients see before opening — so it directly impacts open rate above anything else." },
        ],
      },
      {
        day: 9, title: "Unsubscribe & List Management",
        goal: "Handle unsubscribes correctly and keep your list clean and compliant.",
        lesson: "Every email you send must have a working unsubscribe link — this is legally required in most countries (CAN-SPAM, GDPR). When someone unsubscribes, you must immediately stop sending to them. You also need to handle bounced email addresses (invalid addresses that return delivery failures) by removing them from your list automatically.",
        challenge: "Build an unsubscribe API endpoint that marks contacts as unsubscribed in Firestore and update your cron job to skip unsubscribed contacts.",
        code: `// api/unsubscribe.js — Vercel serverless function
import { initFirebaseAdmin } from "../lib/firebase-admin";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { token } = req.query;
  if (!token) return res.status(400).send("Invalid unsubscribe link.");

  const db = initFirebaseAdmin();

  try {
    // Find contact by their unsubscribe token
    const snapshot = await db.collection("contacts")
      .where("unsubscribeToken", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) return res.status(404).send("Link not found.");

    const contactDoc = snapshot.docs[0];
    await contactDoc.ref.update({
      unsubscribed:   true,
      unsubscribedAt: new Date(),
    });

    // Also delete any pending emails for this contact
    const pending = await db.collection("email_queue")
      .where("contactId", "==", contactDoc.id)
      .where("status", "==", "pending")
      .get();

    const batch = db.batch();
    pending.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).send(\`
      <html><body style="font-family:sans-serif;padding:40px;text-align:center">
        <h2>You've been unsubscribed</h2>
        <p>You will no longer receive emails from us.</p>
      </body></html>
    \`);
  } catch (err) {
    console.error("Unsubscribe error:", err);
    res.status(500).send("Something went wrong.");
  }
}

// Generate an unsubscribe URL when enrolling a contact:
function generateUnsubscribeUrl(contactId) {
  const token = crypto.randomUUID();
  return { token, url: \`\${process.env.APP_URL}/api/unsubscribe?token=\${token}\` };
}`,
        quiz: [
          { q: "Why is a working unsubscribe link legally required?", opts: ["It's not legally required", "Laws like CAN-SPAM and GDPR require it to protect recipients", "Email providers block emails without it", "It improves deliverability only"], ans: 1, explanation: "CAN-SPAM (US) and GDPR (EU) legally require a clear, working unsubscribe mechanism in every commercial email." },
          { q: "What should happen immediately when someone unsubscribes?", opts: ["Send them a confirmation sequence", "Stop all future emails and mark them as unsubscribed", "Archive their data for 6 months", "Reduce email frequency first"], ans: 1, explanation: "You must honour unsubscribes immediately — continuing to send after an unsubscribe request violates anti-spam laws." },
          { q: "What is a 'bounced' email?", opts: ["An email that was opened", "An email that failed to deliver because the address is invalid", "An email that was marked as spam", "An email sent to the wrong person"], ans: 1, explanation: "A bounce means the email could not be delivered. Hard bounces (invalid address) should be removed from your list immediately." },
        ],
      },
      {
        day: 10, title: "Performance Dashboard & Reports",
        goal: "Build a real-time dashboard showing campaign stats: opens, clicks, and revenue.",
        lesson: "A great email tool shows you what's working. You pull stats from Firestore — total sent, opens, clicks, unsubscribes — and calculate key metrics like open rate and click-through rate (CTR). Displaying these in a clean dashboard makes your tool feel professional and gives users the insights they need to improve their campaigns.",
        challenge: "Build a getCampaignStats() function that returns open rate, CTR, and unsubscribe rate for any campaign, and render the results in a simple stats grid.",
        code: `// Calculate stats for a campaign
async function getCampaignStats(campaignId) {
  const sentSnap = await db.collection("email_queue")
    .where("campaignId", "==", campaignId)
    .where("status", "==", "sent")
    .get();

  const openSnap = await db.collection("email_events")
    .where("campaignId", "==", campaignId)
    .where("event", "==", "open")
    .get();

  const clickSnap = await db.collection("email_events")
    .where("campaignId", "==", campaignId)
    .where("event", "==", "click")
    .get();

  const unsubSnap = await db.collection("contacts")
    .where("campaignId", "==", campaignId)
    .where("unsubscribed", "==", true)
    .get();

  const sent        = sentSnap.size;
  const opens       = openSnap.size;
  const clicks      = clickSnap.size;
  const unsubscribes = unsubSnap.size;

  return {
    sent,
    opens,
    clicks,
    unsubscribes,
    openRate:        sent > 0 ? ((opens / sent) * 100).toFixed(1) + "%" : "0%",
    clickRate:       opens > 0 ? ((clicks / opens) * 100).toFixed(1) + "%" : "0%",
    unsubscribeRate: sent > 0 ? ((unsubscribes / sent) * 100).toFixed(2) + "%" : "0%",
  };
}

// Example output:
// { sent: 250, opens: 87, clicks: 34, unsubscribes: 2,
//   openRate: "34.8%", clickRate: "39.1%", unsubscribeRate: "0.80%" }`,
        quiz: [
          { q: "What is a good email open rate benchmark?", opts: ["5-10%", "15-25%", "50-60%", "80%+"], ans: 1, explanation: "Industry average open rates are 15-25%. Above 30% is excellent. Below 15% suggests subject line or deliverability issues." },
          { q: "How is click-through rate (CTR) calculated?", opts: ["Clicks divided by emails sent", "Clicks divided by emails opened", "Opens divided by emails sent", "Clicks divided by total contacts"], ans: 1, explanation: "CTR is typically clicks / opens — it measures how compelling your email content is to people who actually opened it." },
          { q: "What does a high unsubscribe rate (above 0.5%) indicate?", opts: ["The campaign is very successful", "The audience is not a good fit or the content is irrelevant", "Your email design needs improvement", "You need to send more emails"], ans: 1, explanation: "High unsubscribe rates signal a mismatch between your content and audience. Review targeting, frequency, and relevance." },
        ],
      },
    ],
  },
];

// ── Summary cards for the landing page ────────────────────────────────────────
export const modules = aiCourses.map(c => ({
  id:          c.id,
  title:       c.title,
  icon:        c.icon,
  accent:      c.accent,
  tagline:     c.tagline,
  description: c.lessons[0]?.goal || "",
  lessons:     c.lessons.length,
  topics:      c.lessons.map(l => l.title),
}));
