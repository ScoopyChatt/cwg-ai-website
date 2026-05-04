import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    const { userInfo, conversation } = req.body;

    if (!userInfo || !conversation) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({
        error: "Email service not configured",
        message: "Please set RESEND_API_KEY environment variable in Vercel",
      });
    }

    // Format the conversation
    const conversationText = conversation
      .map((msg) => `${msg.role === "user" ? "Customer" : "AI"}: ${msg.content}`)
      .join("\n");

    const emailContent = `
New Lead Captured from CWG AI Assistant

Customer Information:
- Name: ${userInfo.name}
- Email: ${userInfo.email}
- Phone: ${userInfo.phone}

Conversation:
${conversationText}

---
This lead was captured through the Custom Werks Graphics AI Assistant.
Visit: https://cwg-ai-website.vercel.app/
    `;

    const result = await resend.emails.send({
      from: "leads@customwerks.net",
      to: "brandonwesleycarter@gmail.com",
      subject: `New Lead: ${userInfo.name} - Custom Werks Graphics AI`,
      text: emailContent,
    });

    if (result.error) {
      throw result.error;
    }

    return res.status(200).json({
      success: true,
      message: "Lead captured and emailed successfully",
      emailId: result.data.id,
    });
  } catch (error) {
    console.error("Email API error:", error);

    return res.status(500).json({
      error: "Failed to send email",
      message: error.message,
    });
  }
}
