"use client";

function base64UrlToBytes(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  const padded = base64 + (pad ? "=".repeat(4 - pad) : "");
  const raw = atob(padded);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function hmacSha256(secret: string, messageBytes: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    {name: "HMAC", hash: "SHA-256"},
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, messageBytes);
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function buildFernet(secret: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret));
  const key = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
  return new window.fernet.Secret(key);
}

export class SecureWebSocket {
  private url: string;
  private sharedSecret: string;
  private name: string;
  private ws: WebSocket | null = null;
  private fernetSecret: any = null;

  constructor(url: string, sharedSecret: string, name: string) {
    this.url = url;
    this.sharedSecret = sharedSecret;
    this.name = name;
  }

  async connect(onMessage?: (msg: any) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log(`[${this.name}] Connected`);
      };

      this.ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "handshake") {
            const challengeBytes = base64UrlToBytes(msg.challenge);
            const responseHex = await hmacSha256(this.sharedSecret, challengeBytes);
            this.ws?.send(JSON.stringify({response: responseHex}));
          } else if (msg.type === "handshake_ok") {
            this.fernetSecret = await buildFernet(this.sharedSecret);
            console.log(`[${this.name}] Handshake OK`);
            resolve();
          }
        } catch {
          if (!this.fernetSecret) return;
          try {
            const token = event.data;
            const f = new window.fernet.Token({secret: this.fernetSecret, token, ttl: 0});
            const plaintext = f.decode();
            console.log(`[${this.name}] Recv: ${plaintext}`);
            onMessage?.(plaintext);
          } catch (err) {
            console.error(`[${this.name}] Decrypt error: ${err}`);
          }
        }
      };

      this.ws.onerror = (e) => reject(e);
      this.ws.onclose = () => console.log(`[${this.name}] Closed`);
    });
  }

  sendJson(obj: any) {
    if (!this.fernetSecret) throw new Error("Handshake not done");
    const token = new window.fernet.Token({secret: this.fernetSecret});
    this.ws?.send(token.encode(JSON.stringify(obj)));
    console.log(`[${this.name}] Sent: ${JSON.stringify(obj)}`);
  }

  close(): void {
    this.ws.close();
  }
}
