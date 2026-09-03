// components/ModalPago.tsx
"use client";
import { useState } from "react";
import { X, CreditCard, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { procesarPago } from "@/lib/reservas";

type Metodo = "TARJETA" | "YAPE" | "PLIN" | "TRANSFERENCIA";

export function ModalPago({
  reservaId,
  monto,
  onExito,
  onCerrar,
}: {
  reservaId: string;
  monto: number;
  onExito: (referencia: string) => void;
  onCerrar: () => void;
}) {
  const [metodo, setMetodo] = useState<Metodo>("YAPE");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [tarjeta, setTarjeta] = useState({ numero: "", nombre: "", expiry: "", cvv: "" });

  async function pagar() {
    setError("");
    setProcesando(true);
    const referencia = `OP-${Date.now()}`;
    try {
      const res = await procesarPago({ reservaId, monto, metodo, referencia });
      if (res.estado === "VERIFICADO") {
        onExito(referencia);
      } else {
        setError("El pago fue rechazado. Intenta con otro método.");
      }
    } catch {
      setError("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setProcesando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-[#c7663c] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Pasarela de Pago</h3>
            <p className="text-white/80 text-sm">Total a pagar: <strong>${monto}</strong></p>
          </div>
          <button onClick={onCerrar} className="text-white/80 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          {/* Métodos */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">Método de pago</p>
            <div className="grid grid-cols-4 gap-2">
              {([
                { id: "YAPE", label: "Yape", color: "bg-purple-600" },
                { id: "PLIN", label: "Plin", color: "bg-emerald-500" },
                { id: "TARJETA", label: "Tarjeta", color: "bg-blue-600" },
                { id: "TRANSFERENCIA", label: "Transferencia", color: "bg-amber-600" },
              ] as const).map((m) => (
                <button key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={`py-2 rounded-lg text-xs font-bold text-white transition-all ${m.color} ${
                    metodo === m.id ? "ring-2 ring-offset-1 ring-gray-400 scale-105" : "opacity-60 hover:opacity-80"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Campos según método */}
          {metodo === "TARJETA" && (
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600">Número de tarjeta</label>
                <input type="text" placeholder="0000 0000 0000 0000" maxLength={19}
                  value={tarjeta.numero} onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c7663c]/30" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Nombre en la tarjeta</label>
                <input type="text" placeholder="JUAN PEREZ"
                  value={tarjeta.nombre} onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value })}
                  className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c7663c]/30" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Vencimiento</label>
                  <input type="text" placeholder="MM/AA" maxLength={5}
                    value={tarjeta.expiry} onChange={(e) => setTarjeta({ ...tarjeta, expiry: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c7663c]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">CVV</label>
                  <input type="password" placeholder="•••" maxLength={4}
                    value={tarjeta.cvv} onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value })}
                    className="w-full mt-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-[#c7663c]/30" />
                </div>
              </div>
            </div>
          )}

          {(metodo === "YAPE" || metodo === "PLIN") && (
            <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2">
              <div className={`w-20 h-20 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl ${metodo === "YAPE" ? "bg-purple-600" : "bg-emerald-500"}`}>QR</div>
              <p className="text-sm text-gray-600">Escanea el código QR con {metodo === "YAPE" ? "Yape" : "Plin"}</p>
              <p className="text-xs text-gray-400">Número: +51 954 123 456</p>
              <p className="font-bold text-[#c7663c]">${monto}</p>
            </div>
          )}

          {metodo === "TRANSFERENCIA" && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-700">Datos bancarios</p>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Banco:</span> BCP</p>
                <p><span className="font-medium">Cuenta:</span> 191-12345678-0-12</p>
                <p><span className="font-medium">CCI:</span> 002-191-00123456780-12</p>
                <p><span className="font-medium">Titular:</span> AQP GO SAC</p>
                <p><span className="font-medium">Monto:</span> <span className="text-[#c7663c] font-bold">${monto}</span></p>
              </div>
              <p className="text-xs text-amber-600 mt-2">Después de transferir, haz clic en "Confirmar pago"</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle className="h-4 w-4" /> {error}
            </div>
          )}

          <button onClick={pagar} disabled={procesando}
            className="w-full bg-[#c7663c] hover:bg-[#a9552f] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all">
            {procesando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            Confirmar pago ${monto}
          </button>
          <p className="text-xs text-gray-400 text-center">🔒 Pago simulado — No se realizará ningún cargo real</p>
        </div>
      </div>
    </div>
  );
}