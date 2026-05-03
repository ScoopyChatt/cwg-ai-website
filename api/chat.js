import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an AI sales specialist for Custom Werks Graphics. Your PRIMARY GOAL is to collect lead information: name, email, and phone number. ONLY after collecting this info can you discuss products and orders.

LEAD CAPTURE PRIORITY:
1. First message: Ask for their name
2. After name: Ask for their email
3. After email: Ask for their phone number
4. Once you have all three: Then ask about their project

Keep responses SHORT (1-2 sentences max). Use exactly ONE random emoji per response. Be friendly but direct.

After collecting lead info, help them with:
- Custom apparel (t-shirts, hoodies, polos, jackets)
- Embroidery and screen printing
- Promotional items (bags, drinkware, headwear, awards)
- Quantities, timelines, design options

IMPORTANT: Do not provide extensive product details or recommendations until you have name, email, and phone. Stay focused on lead capture first.`;

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: "API key not configured",
        message:
          "Please set ANTHROPIC_API_KEY environment variable in Vercel",
      });
    }

    // Convert messages to Anthropic format
    const anthropicMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: anthropicMessages,
    });

    const assistantMessage =
      response.content[0].type === "text" ? response.content[0].text : "";

    return res.status(200).json({
      role: "assistant",
      content: assistantMessage,
    });
  } catch (error) {
    console.error("Chat API error:", error);

    if (error.status === 401) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API key",
      });
    }

    return res.status(500).json({
      error: "Failed to generate response",
      message: error.message,
    });
  }
}
