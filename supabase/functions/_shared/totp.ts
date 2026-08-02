// TOTP (RFC 6238) + cifragem do segredo em repouso (AES-GCM).
const enc = new TextEncoder();
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function gerarSegredoBase32(bytes = 20) {
  const raw = crypto.getRandomValues(new Uint8Array(bytes));
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of raw) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += B32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += B32[(value << (5 - bits)) & 31];
  return out;
}

function base32Decode(secret: string) {
  const limpo = secret.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of limpo) {
    const idx = B32.indexOf(ch);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return new Uint8Array(out);
}

async function hotp(secret: string, counter: number) {
  const key = await crypto.subtle.importKey('raw', base32Decode(secret), { name: 'HMAC', hash: 'SHA-1' }, false, [
    'sign',
  ]);
  const buf = new ArrayBuffer(8);
  const view = new DataView(buf);
  view.setUint32(0, Math.floor(counter / 2 ** 32));
  view.setUint32(4, counter >>> 0);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, buf));
  const offset = sig[sig.length - 1] & 0x0f;
  const code =
    ((sig[offset] & 0x7f) << 24) | (sig[offset + 1] << 16) | (sig[offset + 2] << 8) | sig[offset + 3];
  return (code % 1_000_000).toString().padStart(6, '0');
}

/** Valida o código aceitando uma janela de ±1 passo (30s) para tolerar relógio defasado. */
export async function validarTotp(secret: string, code: string, janela = 1) {
  const limpo = (code || '').replace(/\D/g, '');
  if (limpo.length !== 6) return false;
  const step = Math.floor(Date.now() / 1000 / 30);
  for (let i = -janela; i <= janela; i++) {
    if (await hotp(secret, step + i) === limpo) return true;
  }
  return false;
}

export function otpauthUri(secret: string, conta: string, emissor = 'SBPM') {
  const label = encodeURIComponent(`${emissor}:${conta}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(emissor)}&algorithm=SHA1&digits=6&period=30`;
}

// ----------------- Cifragem em repouso -----------------
let aesKey: Promise<CryptoKey> | null = null;
const getAesKey = () => {
  if (!aesKey) {
    const secret = Deno.env.get('PORTAL_SESSION_SECRET');
    if (!secret) throw new Error('PORTAL_SESSION_SECRET ausente');
    aesKey = crypto.subtle
      .digest('SHA-256', enc.encode(`totp:${secret}`))
      .then((raw) => crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']));
  }
  return aesKey;
};

const toB64 = (b: Uint8Array) => btoa(String.fromCharCode(...b));
const fromB64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

export async function cifrar(valor: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await getAesKey(), enc.encode(valor)),
  );
  return `${toB64(iv)}.${toB64(buf)}`;
}

export async function decifrar(payload: string | null | undefined) {
  if (!payload || !payload.includes('.')) return null;
  const [iv, data] = payload.split('.');
  try {
    const buf = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: fromB64(iv) },
      await getAesKey(),
      fromB64(data),
    );
    return new TextDecoder().decode(buf);
  } catch {
    return null;
  }
}

/** Códigos de recuperação: 10 blocos legíveis, uso único, guardados só como hash. */
export function gerarRecoveryCodes(quantidade = 10) {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const codigos: string[] = [];
  for (let i = 0; i < quantidade; i++) {
    const bytes = crypto.getRandomValues(new Uint8Array(10));
    const txt = Array.from(bytes, (b) => alfabeto[b % alfabeto.length]).join('');
    codigos.push(`${txt.slice(0, 5)}-${txt.slice(5, 10)}`);
  }
  return codigos;
}
