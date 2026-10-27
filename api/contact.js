const ALLOWED_SERVICES = new Set([
  "Web Design & Development",
  "E-commerce",
  "Paid Media & Advertising",
  "SEO & Organic Growth",
  "Automation & Integrations",
  "Product Feeds & Merchant Center",
  "Something else / not sure yet"
]);

function clean(value, max = 4000) {
  return String(value ?? "").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ error: "This request could not be verified." });
      }
    } catch {
      return res.status(403).json({ error: "This request could not be verified." });
    }
  }

  const body = typeof req.body === "string"
    ? (() => { try { return JSON.parse(req.body); } catch { return {}; } })()
    : (req.body || {});

  // Quietly accept bot submissions without forwarding them.
  if (clean(body.website, 200)) return res.status(200).json({ ok: true });

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const company = clean(body.company, 160) || "Not provided";
  const service = clean(body.service, 120);
  const budget = clean(body.budget, 80) || "Not provided";
  const project = clean(body.message, 4000);
  const packageName = clean(body.package, 80) || "Not specified";

  if (!name || !email || !service || !project) {
    return res.status(400).json({ error: "Please complete all required fields." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Please enter a valid email address." });
  }
  if (!ALLOWED_SERVICES.has(service)) {
    return res.status(400).json({ error: "Please choose a service from the list." });
  }
  if (project.length < 8) {
    return res.status(400).json({ error: "Please add a little more detail about your project." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.error("Contact form email configuration is missing.");
    return res.status(503).json({
      error: "The enquiry service is being configured. Please try again shortly or email signaturemercy@gmail.com directly."
    });
  }

  const submittedAt = new Date().toISOString();
  const text = [
    "New PearlPoint project enquiry",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Business / brand: ${company}`,
    `Service: ${service}`,
    `Estimated budget: ${budget}`,
    `Package: ${packageName}`,
    "",
    "Project details:",
    project,
    "",
    `Submitted: ${submittedAt}`
  ].join("\n");

  const html = `
    <div style="font-family:Arial,sans-serif;color:#222522;max-width:640px;margin:auto">
      <div style="background:#222522;color:#f7f3eb;padding:24px 28px">
        <p style="margin:0;color:#d8be91;font-size:11px;letter-spacing:2px">PEARLPOINT / PROJECT ENQUIRY</p>
        <h1 style="font-size:24px;font-weight:600;margin:12px 0 0">A new opportunity has arrived.</h1>
      </div>
      <div style="padding:26px 28px;background:#f7f3eb">
        <table style="width:100%;border-collapse:collapse">
          ${[
            ["Name", name], ["Email", email], ["Business / brand", company],
            ["Service", service], ["Estimated budget", budget], ["Package", packageName]
          ].map(([label, value]) => `<tr><td style="padding:11px 0;color:#77776f;border-bottom:1px solid #e2ddd2;width:36%;font-size:13px">${escapeHtml(label)}</td><td style="padding:11px 0;border-bottom:1px solid #e2ddd2;font-size:14px">${escapeHtml(value)}</td></tr>`).join("")}
        </table>
        <h2 style="font-size:16px;margin:26px 0 10px">Project details</h2>
        <p style="white-space:pre-wrap;line-height:1.7;font-size:14px">${escapeHtml(project)}</p>
        <p style="font-size:11px;color:#77776f;margin-top:28px">Received ${escapeHtml(submittedAt)} · PearlPoint enquiry system</p>
      </div>
    </div>`;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: ["signaturemercy@gmail.com"],
        reply_to: email,
        subject: `New PearlPoint enquiry — ${name} / ${service}`,
        text,
        html
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend rejected contact email:", response.status, result?.message || result?.name || "unknown error");
      return res.status(502).json({
        error: "We couldn’t send your enquiry just now. Please try again, or email signaturemercy@gmail.com directly."
      });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Contact email request failed:", error?.message || "unknown error");
    return res.status(502).json({
      error: "We couldn’t send your enquiry just now. Please try again, or email signaturemercy@gmail.com directly."
    });
  }
}
