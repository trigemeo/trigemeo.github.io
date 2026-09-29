/**
 * Trigemeo Studio — Serverless Contact Form Worker
 * Platform: Cloudflare Workers
 * 
 * Features:
 * - CORS protection (restricted to trigemeo.com and trigemeo.github.io)
 * - Anti-bot Honeypot validation
 * - Direct email dispatch via Resend API (3,000 free emails/month)
 * - Zero third-party branding, 100% GDPR compliant
 */

export default {
  async fetch(request, env) {
    // 1. Handle CORS Preflight (OPTIONS)
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [
      "https://trigemeo.com",
      "https://www.trigemeo.com",
      "https://trigemeo.github.io",
      "http://localhost:3000",
      "http://127.0.0.1:5500"
    ];

    const isAllowed = allowedOrigins.includes(origin) || origin.endsWith(".trigemeo.com");

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowed ? origin : "https://trigemeo.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      const data = await request.json();
      const { name, email, product, message, _honeypot } = data;

      // 2. Anti-spam honeypot check (if filled, silently drop bot)
      if (_honeypot) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 3. Validation
      if (!email || !message) {
        return new Response(JSON.stringify({ error: "Email and message are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 4. Send Email via Resend API
      // (Resend API key is stored securely in Cloudflare Environment Secret: RESEND_API_KEY)
      const apiKey = env.RESEND_API_KEY || "re_YOUR_FALLBACK_KEY";

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Trigemeo Support <support@trigemeo.com>", // or onboarding@resend.dev until domain verified
          to: ["support@trigemeo.com", "dev@trigemeo.com"],
          reply_to: email,
          subject: product ? `[${product}] Support Request from ${name || 'User'}` : `Support Request from ${name || 'User'}`,
          html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; padding: 20px;">
              <h2 style="color: #4f46e5; margin-top: 0;">New Support Message — Trigemeo Studio</h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr><td style="padding: 8px 0; color: #777; width: 100px;"><strong>Name:</strong></td><td>${name || '—'}</td></tr>
                <tr><td style="padding: 8px 0; color: #777;"><strong>Email:</strong></td><td><a href="mailto:${email}">${email}</a></td></tr>
                <tr><td style="padding: 8px 0; color: #777;"><strong>Product:</strong></td><td>${product || 'General / Other'}</td></tr>
              </table>
              <div style="background: #f9fafb; padding: 15px; border-left: 4px solid #4f46e5; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
              </div>
              <p style="font-size: 12px; color: #999; margin-top: 25px; border-top: 1px solid #eee; padding-top: 10px;">
                Sent from trigemeo.com support form · IP protected
              </p>
            </div>
          `,
        }),
      });

      if (!emailResponse.ok) {
        const errText = await emailResponse.text();
        return new Response(JSON.stringify({ error: "Failed to dispatch email", details: errText }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Message sent successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: "Server error", message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
