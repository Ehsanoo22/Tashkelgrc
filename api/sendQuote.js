export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { leadEmail, pdfBase64, quoteData } = req.body;
    const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!resendKey) {
      return res.status(500).json({ error: 'Resend API key missing' });
    }

    if (!leadEmail || !pdfBase64) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tashkel GFRC <onboarding@resend.dev>', // Assuming Resend test domain or verified domain
        to: [leadEmail],
        subject: `Your GFRC Quote from Tashkel - ${quoteData.leadName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1917;">
            <h2 style="font-weight: 300; margin-bottom: 24px;">Project Estimate</h2>
            <p>Dear ${quoteData.leadName},</p>
            <p>Thank you for inquiring with Tashkel GFRC. Please find attached the meticulously detailed quotation for your project.</p>
            <p>This estimate includes a comprehensive breakdown of the element specifications, mold fabrication variables, and structural requirements.</p>
            <p>If you have any questions or require revisions, please do not hesitate to reply to this email.</p>
            <br/>
            <p style="font-size: 12px; color: #78716c;">
              Best regards,<br/>
              <strong>Tashkel GFRC Team</strong><br/>
              Damascus, Syria
            </p>
          </div>
        `,
        attachments: [
          {
            filename: `Tashkel_Quote_${quoteData.leadName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          }
        ]
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      res.status(200).json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
