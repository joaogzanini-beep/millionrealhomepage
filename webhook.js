// api/webhook.js
// Recebe notificação do MercadoPago quando PIX é pago
// Salva os pixels no Supabase automaticamente

const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
  });

  const { type, data } = req.body;

  // Só processa notificações de pagamento
  if (type !== 'payment') {
    return res.status(200).json({ received: true });
  }

  try {
    const payment = await mercadopago.payment.get(data.id);
    const p = payment.body;

    // Só ativa se o pagamento foi aprovado
    if (p.status !== 'approved') {
      return res.status(200).json({ status: p.status });
    }

    const pixels     = p.metadata.pixels.split(',').map(Number);
    const buyerName  = p.metadata.buyer_name;
    const buyerEmail = p.payer.email;
    const amount     = p.transaction_amount;

    // Salva no Supabase
    const supabaseRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/pixels`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          payment_id: p.id,
          pixel_keys: pixels,
          name: buyerName,
          email: buyerEmail,
          amount: amount,
          status: 'approved',
          created_at: new Date().toISOString(),
        }),
      }
    );

    if (!supabaseRes.ok) {
      const err = await supabaseRes.text();
      console.error('Supabase error:', err);
      return res.status(500).json({ error: 'Erro ao salvar pixels' });
    }

    console.log(`✅ Pagamento ${p.id} aprovado — ${pixels.length} pixels ativados para ${buyerName}`);
    return res.status(200).json({ success: true, pixels: pixels.length });

  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
};
