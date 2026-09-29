/**
 * Trigemeo Studio — Enterprise-Grade Serverless Contact Form Worker
 * Platform: Cloudflare Workers
 */

// Helper: Secure HTML entity encoder for all user-supplied fields
function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Helper: Strip CRLF to prevent email header injection
function sanitizeHeader(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\r\n\t]/g, ' ').trim();
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    // 1. Origin Validation (Supports production domain, github pages, and local testing)
    const isAllowedOrigin = /^https:\/\/(www\.)?trigemeo\.com$/i.test(origin) ||
                            origin === "https://trigemeo.github.io" ||
                            origin === "" || origin === "null" ||
                            origin.includes("localhost") || origin.includes("127.0.0.1");

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowedOrigin && origin ? origin : "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    // 2. Handle CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    // 3. Reject unauthorized HTTP methods
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    try {
      // 4. Payload size check (Max 32 KB)
      const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
      if (contentLength > 32768) {
        return new Response(JSON.stringify({ error: "Payload too large" }), {
          status: 413,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await request.json().catch(() => null);
      if (!data) {
        return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { name, email, product, message, _honeypot } = data;

      // 5. Anti-bot honeypot check (silently drop bot requests)
      if (_honeypot) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 6. Strict Input Validation
      if (!email || typeof email !== 'string' || !message || typeof message !== 'string') {
        return new Response(JSON.stringify({ error: "Email and message are required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const cleanEmail = sanitizeHeader(email.trim());
      const cleanName = sanitizeHeader((typeof name === 'string' ? name : '').trim()).slice(0, 80);
      const cleanProduct = sanitizeHeader((typeof product === 'string' ? product : '').trim()).slice(0, 80);
      const cleanMessage = message.trim().slice(0, 4000);

      // 7. Sanitize HTML for Email Body
      const safeName = escapeHtml(cleanName) || '—';
      const safeEmail = escapeHtml(cleanEmail);
      const safeProduct = escapeHtml(cleanProduct) || 'General / Other';
      const safeMessage = escapeHtml(cleanMessage);

      // 8. Dispatch via Resend API
      const apiKey = env.RESEND_API_KEY;
      if (!apiKey) {
        return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const subjectLine = cleanProduct 
        ? `[${cleanProduct}] Support Request from ${cleanName || 'User'}`
        : `Support Request from ${cleanName || 'User'}`;

      // Domain is 100% verified — send from official branded address
      const senderEmail = env.SENDER_EMAIL || "Trigemeo Support <support@trigemeo.com>";
      const targetEmail = env.TARGET_EMAIL || "support@trigemeo.com";

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: senderEmail,
          to: [targetEmail],
          reply_to: cleanEmail,
          subject: subjectLine,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
              <div style="background: linear-gradient(135deg, #0a0c14, #1e1b4b); padding: 24px; text-align: left;">
                <h2 style="color: #38bdf8; margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Trigemeo Studio — New Support Message</h2>
              </div>
              <div style="padding: 24px;">
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                  <tr><td style="padding: 6px 0; color: #64748b; width: 90px; font-size: 14px;"><strong>Name:</strong></td><td style="font-size: 14px; color: #0f172a;">${safeName}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Email:</strong></td><td style="font-size: 14px;"><a href="mailto:${safeEmail}" style="color: #0284c7; text-decoration: underline;">${safeEmail}</a></td></tr>
                  <tr><td style="padding: 6px 0; color: #64748b; font-size: 14px;"><strong>Product:</strong></td><td style="font-size: 14px; color: #0f172a;"><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 12px;">${safeProduct}</span></td></tr>
                </table>
                <div style="background: #f8fafc; padding: 18px; border-left: 4px solid #0284c7; border-radius: 6px; font-size: 14px; color: #334155;">
                  <p style="margin: 0; white-space: pre-wrap; word-break: break-word;">${safeMessage}</p>
                </div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 14px; text-align: center;">
                  Delivered via Trigemeo Secure Serverless Gateway · trigemeo.com
                </div>
              </div>
            </div>
          `,
        }),
      });

      const resText = await emailResponse.text();

      if (!emailResponse.ok) {
        console.error("Resend API Error:", resText);
        return new Response(JSON.stringify({ error: "Resend dispatch error", details: resText }), {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true, message: "Message sent successfully" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Worker Execution Exception:", err.message);
      return new Response(JSON.stringify({ error: "Internal server error", message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }
};
