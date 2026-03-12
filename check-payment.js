// api/check-payment.js
// Verifica se o pagamento foi aprovado (polling do frontend)

const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'ID obrigatório' });

  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN,
  });

  try {
    const payment = await mercadopago.payment.get(id);
    const p = payment.body;

    return res.status(200).json({
      payment_id: p.id,
      status: p.status,           // 'pending' | 'approved' | 'rejected'
      name: p.metadata.buyer_name,
      pixels: p.metadata.pixels,
    });

  } catch (err) {
    console.error('Check payment error:', err);
    return res.status(500).json({ error: 'Erro ao verificar pagamento' });
  }
};
