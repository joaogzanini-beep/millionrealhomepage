// api/create-payment.js
// Serverless function para Vercel
// Integração MercadoPago — gera pagamento PIX

const mercadopago = require('mercadopago');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { amount, name, email, pixels } = req.body;

  if (!amount || amount < 1) {
    return res.status(400).json({ error: 'Valor inválido' });
  }

  // Configura MercadoPago com seu Access Token
  mercadopago.configure({
    access_token: process.env.MP_ACCESS_TOKEN, // variável de ambiente
  });

  try {
    const payment = await mercadopago.payment.create({
      transaction_amount: amount,
      description: `${amount} pixels – Million Real Homepage`,
      payment_method_id: 'pix',
      payer: {
        email: email,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').slice(1).join(' ') || 'Comprador',
      },
      metadata: {
        pixels: pixels.join(','),
        buyer_name: name,
      },
      notification_url: `${process.env.SITE_URL}/api/webhook`,
    });

    const data = payment.body;

    return res.status(200).json({
      payment_id: data.id,
      status: data.status,
      qr_code: data.point_of_interaction.transaction_data.qr_code,
      qr_code_base64: `data:image/png;base64,${data.point_of_interaction.transaction_data.qr_code_base64}`,
      amount: data.transaction_amount,
    });

  } catch (err) {
    console.error('MP Error:', err);
    return res.status(500).json({ error: 'Erro ao criar pagamento' });
  }
};
