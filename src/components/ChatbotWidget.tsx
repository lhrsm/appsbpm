import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PUB_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente virtual da SBPM. Posso responder sobre eventos, clínicas conveniadas e dúvidas frequentes. Como posso ajudar?",
    },
  ]);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);

    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/chat-assistant`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${PUB_KEY}`,
        },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        const err = await resp.text().catch(() => "");
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = {
            role: "assistant",
            content:
              resp.status === 429
                ? "Muitas mensagens em pouco tempo. Aguarde alguns segundos e tente novamente."
                : resp.status === 402
                ? "Serviço de IA temporariamente indisponível."
                : "Desculpe, não consegui responder agora. Tente novamente em instantes.",
          };
          return copy;
        });
        console.error("chat error", resp.status, err);
        return;
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const line of parts) {
          const l = line.trim();
          if (!l.startsWith("data:")) continue;
          const payload = l.slice(5).trim();
          if (payload === "[DONE]") continue;
          try {
            const j = JSON.parse(payload);
            const delta = j.choices?.[0]?.delta?.content ?? "";
            if (delta) {
              acc += delta;
              setMessages((m) => {
                const copy = [...m];
                copy[copy.length - 1] = { role: "assistant", content: acc };
                return copy;
              });
            }
          } catch {}
        }
      }
    } catch (e) {
      console.error(e);
      setMessages((m) => {
        const copy = [...m];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Erro de conexão. Verifique sua internet e tente novamente.",
        };
        return copy;
      });
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir assistente virtual"
          className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition-transform flex items-center justify-center relative z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div
          className={cn(
            "fixed z-50 bg-card border rounded-2xl shadow-2xl flex flex-col",
            "bottom-5 right-5 w-[calc(100vw-2.5rem)] max-w-[380px] h-[70vh] max-h-[560px]",
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary text-primary-foreground rounded-t-2xl">
            <div>
              <p className="font-semibold text-sm leading-tight">Assistente SBPM</p>
              <p className="text-xs opacity-80">Tire dúvidas sobre o portal</p>
            </div>
            <div className="flex items-center gap-1">
              <a
                href="https://wa.me/5571985496972?text=Ol%C3%A1%2C%20preciso%20de%20atendimento%20humano"
                target="_blank"
                rel="noreferrer"
                aria-label="Falar com atendente humano no WhatsApp"
                title="Falar com atendente humano"
                className="rounded-full p-1.5 hover:bg-primary-foreground/20"
              >
                <Phone className="h-4 w-4" />
              </a>
              <button
                onClick={() => setOpen(false)}
                aria-label="Fechar assistente"
                className="rounded-full p-1 hover:bg-primary-foreground/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  "text-sm rounded-2xl px-3 py-2 max-w-[85%]",
                  m.role === "user"
                    ? "ml-auto bg-primary text-primary-foreground"
                    : "mr-auto bg-muted text-foreground",
                )}
              >
                {m.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-ul:my-1">
                    <ReactMarkdown>{m.content || "…"}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{m.content}</p>
                )}
              </div>
            ))}
            {loading && messages[messages.length - 1]?.content === "" && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <Loader2 className="h-3 w-3 animate-spin" /> pensando…
              </div>
            )}
          </div>

          <div className="p-2 border-t flex items-end gap-2">
            <Textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Digite sua pergunta…"
              rows={1}
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              disabled={loading}
            />
            <Button
              onClick={send}
              disabled={loading || !input.trim()}
              size="icon"
              aria-label="Enviar mensagem"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="px-3 pb-2 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span>Precisa de humano?</span>
            <a className="text-primary hover:underline" href="https://wa.me/5571985496972" target="_blank" rel="noreferrer">Previdência</a>
            <span>·</span>
            <a className="text-primary hover:underline" href="https://wa.me/5571987943414" target="_blank" rel="noreferrer">Saúde</a>
          </div>
        </div>
      )}
    </>
  );
}
