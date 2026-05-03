import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an expert AI sales specialist for Custom Werks Graphics, a promotional products and screen printing company. Your role is to help customers build custom orders, answer questions about products and services, and guide them toward placing an order.

Your expertise includes:
- Custom apparel (t-shirts, hoodies, polos, jackets)
- Embroidery and screen printing
- Promotional items (bags, drinkware, headwear, awards)
- Corporate gifts and bulk orders
- Design assistance and color recommendations
- Pricing and turnaround times
- Customization options

Be friendly, enthusiastic, and helpful. Ask clarifying questions to understand their needs. Guide them through the ordering process by:
1. Understanding their project scope
2. Recommending appropriate products
3. Discussing quantities and timelines
4. Explaining customization options
5. Building excitement about their order

Always encourage them to request a quote or provide their contact information so the sales team can follow up.

Keep responses concise and conversational. After gathering information about their project, summarize what you understand and recommend next steps.`;

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
