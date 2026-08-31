import { NextResponse } from "next/server";

const CATEGORY_COLORS_HEX: Record<string, string> = {
  Bug: "#ef4444",
  Suggestion: "#eab308",
  Praise: "#22c55e",
  Question: "#3b82f6",
};

const CATEGORY_COLORS_INT: Record<string, number> = {
  Bug: 0xef4444,
  Suggestion: 0xeab308,
  Praise: 0x22c55e,
  Question: 0x3b82f6,
};

const CATEGORY_EMOJIS: Record<string, string> = {
  Bug: "🐛",
  Suggestion: "💡",
  Praise: "❤️",
  Question: "❓",
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category, mood, message, userEmail, page } = body;

    if (!message || !category) {
      return NextResponse.json(
        { error: "Message and category are required" },
        { status: 400 }
      );
    }

    const discordWebhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK_URL;
    const resendApiKey = process.env.RESEND_API_KEY;
    const notificationEmail =
      process.env.FEEDBACK_NOTIFICATION_EMAIL ||
      process.env.RESEND_TO_EMAIL;

    const catColorHex = CATEGORY_COLORS_HEX[category] ?? "#6366f1";
    const catColorInt = CATEGORY_COLORS_INT[category] ?? 0x6366f1;
    const catEmoji = CATEGORY_EMOJIS[category] ?? "📝";
    const formattedDate = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const tasks: Promise<any>[] = [];

    // ── 1. SEND TO DISCORD WEBHOOK ──
    if (discordWebhookUrl) {
      const discordPayload = {
        username: "Enies Hobby Feedback",
        avatar_url: "https://optcg-browser.vercel.app/icon.png",
        embeds: [
          {
            title: `${catEmoji} New ${category} Received`,
            description: message,
            color: catColorInt,
            fields: [
              {
                name: "Category",
                value: category,
                inline: true,
              },
              {
                name: "Mood",
                value: mood || "Not specified",
                inline: true,
              },
              {
                name: "Submitted By",
                value: userEmail ? `\`${userEmail}\`` : "*Guest Visitor*",
                inline: true,
              },
              {
                name: "Page URL",
                value: page ? `\`${page}\`` : "*Unknown*",
                inline: false,
              },
            ],
            footer: {
              text: "Enies Hobby • Feedback Monitor",
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      tasks.push(
        fetch(discordWebhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
        }).catch((err) => {
          console.error("Discord Webhook dispatch failed:", err);
        })
      );
    }

    // ── 2. SEND TO RESEND EMAIL ──
    if (resendApiKey && notificationEmail) {
      const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Feedback Received</title>
</head>
<body style="margin: 0; padding: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; overflow: hidden; border: 1px solid #e4e4e7; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <!-- Header -->
    <div style="background: #18181b; padding: 22px 28px; display: flex; align-items: center; justify-content: space-between;">
      <div>
        <div style="color: #ffffff; font-weight: 800; font-size: 18px; letter-spacing: -0.02em;">ENIES HOBBY</div>
        <div style="color: #a1a1aa; font-size: 12px; margin-top: 2px;">User Feedback Notification</div>
      </div>
      <div style="background: ${catColorHex}22; border: 1px solid ${catColorHex}; color: ${catColorHex}; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 700;">
        ${catEmoji} ${category}
      </div>
    </div>

    <!-- Body Content -->
    <div style="padding: 28px;">
      <div style="font-size: 11px; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px;">Message</div>
      <div style="background: #f8fafc; border-left: 4px solid ${catColorHex}; border-radius: 8px; padding: 16px 20px; font-size: 15px; line-height: 1.6; color: #0f172a; margin-bottom: 24px;">
        ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>")}
      </div>

      <!-- Metadata Grid -->
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <tr>
          <td style="padding: 8px 0; color: #71717a; width: 120px;"><strong>Category:</strong></td>
          <td style="padding: 8px 0; color: #18181b;">${category}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;"><strong>Mood:</strong></td>
          <td style="padding: 8px 0; color: #18181b;">${mood || "Not specified"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;"><strong>Submitted By:</strong></td>
          <td style="padding: 8px 0; color: #18181b;">${userEmail ? `<a href="mailto:${userEmail}" style="color: #2563eb; text-decoration: none;">${userEmail}</a>` : '<span style="color: #71717a; font-style: italic;">Guest Visitor</span>'}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;"><strong>Page:</strong></td>
          <td style="padding: 8px 0; color: #18181b; font-family: monospace;">${page || "/"}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #71717a;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; color: #71717a;">${formattedDate}</td>
        </tr>
      </table>

      ${userEmail ? `
      <div style="border-top: 1px solid #e4e4e7; padding-top: 18px; margin-top: 10px;">
        <a href="mailto:${userEmail}?subject=Re: Enies Hobby Feedback" style="display: inline-block; background: #18181b; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600;">
          Reply to User &rarr;
        </a>
      </div>
      ` : ""}
    </div>

    <!-- Footer -->
    <div style="background: #fafafa; border-top: 1px solid #f4f4f5; padding: 14px 28px; text-align: center; font-size: 11px; color: #a1a1aa;">
      Enies Hobby • Real-time Feedback System
    </div>
  </div>
</body>
</html>
      `;

      const resendPayload: Record<string, any> = {
        from: "Enies Hobby <onboarding@resend.dev>",
        to: [notificationEmail],
        subject: `[Enies Hobby Feedback] ${catEmoji} ${category} • ${mood || "New submission"}`,
        html: htmlEmail,
      };

      if (userEmail) {
        resendPayload.reply_to = userEmail;
      }

      tasks.push(
        fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(resendPayload),
        })
          .then(async (res) => {
            if (!res.ok) {
              const err = await res.text();
              console.error("Resend API Error:", res.status, err);
            } else {
              const data = await res.json();
              console.log("Resend Email sent:", data);
            }
          })
          .catch((err) => {
            console.error("Resend Email dispatch failed:", err);
          })
      );
    }

    await Promise.all(tasks);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback route error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
