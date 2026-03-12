# 🇧🇷 Million Real Homepage
### Guia completo de setup, hospedagem e marketing

---

## 📁 Estrutura do projeto

```
millionreal/
├── index.html          ← site principal (1 milhão de pixels)
├── admin/
│   └── index.html      ← painel admin (ver pedidos, aprovar)
├── api/
│   ├── create-payment.js   ← gera PIX via MercadoPago
│   ├── check-payment.js    ← verifica se foi pago
│   └── webhook.js          ← ativa pixels após pagamento
├── vercel.json         ← configuração de deploy
├── package.json        ← dependências
└── README.md           ← este arquivo
```

---

## 🚀 PASSO 1 — Hospedar no Vercel (grátis)

1. Crie uma conta em **vercel.com** (grátis)
2. Instale a CLI: `npm install -g vercel`
3. Na pasta do projeto, rode: `vercel`
4. Siga as instruções (conecte ao GitHub se quiser deploy automático)
5. Seu site vai estar em: `https://millionreal.vercel.app`

**Para usar domínio próprio** (ex: millionrealhomepage.com.br):
- Compre o domínio no Registro.br (~R$40/ano)
- No painel Vercel → Settings → Domains → adicione seu domínio
- Aponte o DNS conforme indicado pelo Vercel

---

## 💳 PASSO 2 — Configurar MercadoPago (PIX)

1. Acesse **mercadopago.com.br** e crie uma conta de vendedor
2. Vá em: Seu perfil → Credenciais → Credenciais de produção
3. Copie o **Access Token** (começa com `APP_USR-...`)
4. No painel Vercel → Settings → Environment Variables, adicione:

```
MP_ACCESS_TOKEN = APP_USR-SeuTokenAqui
SUPABASE_URL    = https://XXXX.supabase.co
SUPABASE_ANON_KEY = sua_key_aqui
SITE_URL        = https://seudominio.com.br
```

5. No arquivo `index.html`, dentro do bloco `CONFIG`, atualize:
   - Descomente o bloco `fetch('/api/create-payment', ...)`
   - Descomente o `pollPayment()`
   - Substitua o bloco DEMO

---

## 🗄️ PASSO 3 — Configurar Supabase (banco de dados grátis)

1. Crie conta em **supabase.com** (grátis até 500MB)
2. Crie um novo projeto
3. Vá em SQL Editor e rode este script:

```sql
CREATE TABLE pixels (
  id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  payment_id    TEXT NOT NULL,
  pixel_keys    INTEGER[] NOT NULL,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  url           TEXT,
  amount        NUMERIC NOT NULL,
  color         INTEGER[],
  status        TEXT DEFAULT 'approved',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para busca rápida
CREATE INDEX idx_pixels_status ON pixels(status);

-- Permissões de leitura pública (para carregar os pixels no site)
ALTER TABLE pixels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Leitura pública" ON pixels FOR SELECT USING (true);
CREATE POLICY "Insert via API" ON pixels FOR INSERT WITH CHECK (true);
```

4. Copie a **URL** e **anon key** do projeto (Settings → API)
5. Cole no `index.html` dentro de `CONFIG` e nas variáveis do Vercel

---

## 🖼️ PASSO 4 — Upload de imagens

Para hospedar as imagens dos compradores, use o **Supabase Storage**:

1. No Supabase → Storage → New Bucket → nome: `pixel-images` → público
2. No formulário de compra (index.html), adicione o upload para o Supabase:

```javascript
// Dentro de submitOrder(), após validações:
const base64 = await toBase64(file);
const imgRes = await fetch(`${CONFIG.SUPABASE_URL}/storage/v1/object/pixel-images/${Date.now()}.png`, {
  method: 'POST',
  headers: {
    'Content-Type': file.type,
    'apikey': CONFIG.SUPABASE_KEY,
    'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
  },
  body: file,
});
const imgData = await imgRes.json();
const imageUrl = `${CONFIG.SUPABASE_URL}/storage/v1/object/public/pixel-images/${imgData.Key}`;
```

---

## 🔧 PASSO 5 — Ajustes finais antes de lançar

No arquivo `index.html`, atualize o bloco `CONFIG`:

```javascript
const CONFIG = {
  PAYMENT_GATEWAY: 'mercadopago',
  GATEWAY_TOKEN: '',              // deixe vazio, use variável de ambiente
  PIX_KEY: 'seucpf@gmail.com',   // sua chave PIX
  PIX_NAME: 'Seu Nome',
  PIX_CITY: 'Sao Paulo',
  SUPABASE_URL: 'https://XXXX.supabase.co',
  SUPABASE_KEY: 'sua_anon_key',
  MIN_PIXELS: 100,
  CONTACT_EMAIL: 'contato@millionrealhomepage.com.br',
};
```

No `admin/index.html`:
- Troque `ADMIN_PASS = 'admin123'` por uma senha forte

---

## 📣 PASSO 6 — MARKETING / VIRAL NO TIKTOK

### Script de vídeo para TikTok (gancho de 3 segundos):
```
"Cara, eu tô vendendo PIXELS por R$1 e vou ficar rico."
[mostra o site]
"Isso foi feito em 2005 por um estudante que faturou R$5 MILHÕES."
"Eu fiz a versão brasileira. Link na bio."
```

### Checklist de lançamento:
- [ ] Crie o perfil @millionrealhomepage no TikTok, Instagram e Twitter/X
- [ ] Grave o vídeo "origem da ideia" — conte a história do Alex Tew
- [ ] Poste atualizações de progresso: "100 pixels vendidos! 🎉"
- [ ] Marque os primeiros compradores nos stories
- [ ] Crie desafio: "quem vai comprar mais pixels?"
- [ ] Meta inicial: chegar em 10.000 pixels nas primeiras 48h (R$10.000)

### Hashtags sugeridas:
```
#millionrealhomepage #pixel #empreendedorismo #startupbrasil
#riquezaonline #pixelbrasil #historiadainternet #tiktokviral
```

### Parceiros para divulgação:
- Perfis de empreendedorismo no Instagram (DM com proposta de afiliado)
- Influencers de tecnologia e startups
- Grupos de WhatsApp de marketing digital
- Reddit: r/empreendedorismo, r/brdev

---

## 💰 Projeção de receita

| Cenário   | Pixels vendidos | Receita |
|-----------|----------------|---------|
| Mínimo    | 50.000         | R$50.000 |
| Realista  | 200.000        | R$200.000 |
| Viral     | 500.000        | R$500.000 |
| Meta      | 1.000.000      | R$1.000.000 |

---

## 📞 Suporte

Dúvidas sobre a integração? Contate o desenvolvedor.
