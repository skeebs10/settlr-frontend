const API_BASE = import.meta.env.VITE_API_BASE || "";
let sessionId: string | null = null;

export function setSession(id: string) { 
  sessionId = id; 
  localStorage.setItem('settlr_session_id', id);
}

export function clearSession() {
  sessionId = null;
  localStorage.removeItem('settlr_session_id');
}

export function getStoredSession() {
  const stored = localStorage.getItem('settlr_session_id');
  if (stored) {
    sessionId = stored;
  }
  return sessionId;
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string,string> = { 
    "Content-Type":"application/json", 
    ...(options.headers||{}) 
  };
  if (sessionId) headers["X-Session-ID"] = sessionId;
  
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export async function joinSession(qr_token: string, name?: string) {
  const data = await request("/session/join", { 
    method:"POST", 
    body: JSON.stringify({ qr_token, name }) 
  });
  setSession(data.session_id); 
  return data;
}

export async function getCheck(id: string) { 
  return request(`/checks/${id}`); 
}

export async function claimItem(checkId: string, lineItemId: string, fraction: number) {
  return request("/claims", { 
    method:"POST", 
    body: JSON.stringify({ check_id: checkId, line_item_id: lineItemId, fraction }) 
  });
}

export async function createPaymentIntent(checkId: string, tip_cents: number) {
  return request("/payments/intent", { 
    method:"POST", 
    body: JSON.stringify({ check_id: checkId, tip_cents }) 
  });
}

export async function confirmPayment(payment_intent_id: string, payment_method?: string) { 
  return request("/payments/confirm", { 
    method:"POST",
    body: JSON.stringify({ payment_intent_id, payment_method })
  }); 
}

export async function nudgeGuests(id: string) { 
  return request(`/staff/checks/${id}/nudge`, { method:"POST" }); 
}

export async function forceClose(id: string) { 
  return request(`/staff/checks/${id}/close`, { method:"POST" }); 
}

export async function reopenCheck(id: string) { 
  return request(`/staff/checks/${id}/reopen`, { method:"POST" }); 
}

export async function getStaffChecks() {
  return request("/staff/checks");
}