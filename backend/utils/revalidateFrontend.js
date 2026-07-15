const axios = require('axios');

// Tells the Next.js frontend to drop its cached SiteSettings fetch (60s ISR)
// so admin edits (phone, WhatsApp, nav, footer, etc.) appear on the live
// site immediately instead of after the ISR window expires. Best-effort —
// never throws, so a slow/unreachable frontend never breaks a settings save.
async function revalidateFrontend() {
  const secret = process.env.REVALIDATE_SECRET;
  const frontendUrl = process.env.FRONTEND_URL;
  if (!secret || !frontendUrl) return;
  try {
    await axios.post(`${frontendUrl}/api/revalidate?secret=${secret}`, null, { timeout: 5000 });
  } catch (err) {
    console.error('⚠️  Frontend revalidate failed:', err.message);
  }
}

module.exports = { revalidateFrontend };
