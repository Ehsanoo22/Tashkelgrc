export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const formData = req.body;
    const resendKey = process.env.VITE_RESEND_API_KEY || process.env.RESEND_API_KEY;

    if (!resendKey) {
      return res.status(500).json({ error: 'Resend API key missing' });
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Tashkel Leads <onboarding@resend.dev>',
        to: ['esakkaamini@gmail.com'],
        subject: `New Lead: ${formData.name} - ${formData.service}`,
        html: `
          <h2>New Lead Submission</h2>
          <p><strong>Name:</strong> ${formData.name}</p>
          <p><strong>Email:</strong> ${formData.email}</p>
          <p><strong>Phone:</strong> ${formData.phone}</p>
          <p><strong>Project Type:</strong> ${formData.service}</p>
          <p><strong>Details:</strong><br/>${formData.details}</p>
        `
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
