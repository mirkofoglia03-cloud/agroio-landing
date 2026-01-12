export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nome, email, zona_geografica, tipo_utente } = req.body;

  if (!nome || !email || !zona_geografica || !tipo_utente) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    // 1. Salva su Supabase
    const supabaseResponse = await fetch(
      'https://opovaoiwcgjvqopbegos.supabase.co/rest/v1/waitlist',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wb3Zhb2l3Y2dqdnFvcGJlZ29zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0NTk4NjksImV4cCI6MjA4MDAzNTg2OX0.f5mIspKGWnyFlm2nnXQX6TCxRx_HliA_03eTZQ-uTJc',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ nome, email, zona_geografica, tipo_utente })
      }
    );

    if (!supabaseResponse.ok) {
      throw new Error('Errore salvataggio Supabase');
    }

    // 2. Invia email di conferma con Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'AgroIO <noreply@agroio.it>',
        to: email,
        subject: '🌱 Benvenuto nella Lista d\'Attesa di AgroIO!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4CAF50, #2D5016); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">🌱 Benvenuto in AgroIO!</h1>
            </div>
            <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px;">
              <p style="font-size: 18px; color: #333;">Ciao <strong>${nome}</strong>! 👋</p>
              <p style="color: #555; line-height: 1.6;">
                Grazie per esserti iscritto alla lista d'attesa di AgroIO! Sei tra i primi a credere nel futuro dell'agricoltura intelligente.
              </p>
              <div style="background: #E8F5E9; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #2D5016; font-weight: bold;">🎁 Il tuo regalo di benvenuto:</p>
                <p style="margin: 5px 0 0; color: #333;">30 giorni di Piano Pro GRATIS al lancio!</p>
              </div>
              <p style="color: #555; line-height: 1.6;">
                Ti contatteremo appena AgroIO sarà disponibile. Nel frattempo, seguici sui social per anteprime esclusive!
              </p>
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #888; font-size: 14px;">Lancio previsto: <strong>15 Febbraio 2026</strong></p>
              </div>
            </div>
            <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
              © 2026 AgroIO - Il futuro dell'agricoltura è intelligente
            </p>
          </div>
        `
      })
    });

    if (!resendResponse.ok) {
      console.error('Errore Resend:', await resendResponse.text());
    }

    return res.status(200).json({ success: true, message: 'Iscrizione completata!' });

  } catch (error) {
    console.error('Errore:', error);
    return res.status(500).json({ error: 'Errore durante l\'iscrizione' });
  }
}
