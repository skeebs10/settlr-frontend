export interface LineItem {
  line_item_id: string;
  name: string;
  price_cents: number;
  qty: number;
  claimed_fraction: number;
}

export interface CheckTotals {
  subtotal_cents: number;
  tax_cents: number;
  tip_cents: number;
  total_cents: number;
}

export interface Check {
  check_id: string;
  status: 'open' | 'pending_close' | 'closed' | 'paid';
  venue: string;
  items: LineItem[];
  totals: CheckTotals;
  grace_end_time?: string | null;
  participants?: Participant[];
}

export interface Participant {
  session_id: string;
  name?: string;
  is_host: boolean;
  payment_status: 'pending' | 'paid';
  claimed_total_cents: number;
}

export interface Session {
  session_id: string;
  role: 'guest' | 'staff';
  check_id: string;
  share_link: string;
  name?: string;
  is_host?: boolean;
}

export interface PaymentIntent {
  client_secret: string;
  payment_intent_id: string;
  amount_cents: number;
  tip_cents: number;
}

export interface StaffCheck {
  check_id: string;
  venue: string;
  status: string;
  claimed_percentage: number;
  total_cents: number;
  grace_end_time?: string | null;
}