/**
 * Persistent identity management via localStorage.
 * Generates stable UUIDs for volunteers and employers on first use.
 */

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ── Employer ──────────────────────────────────────────────────────────────────

export interface EmployerSession {
  id: string;
}

export function getEmployerSession(): EmployerSession {
  if (typeof window === 'undefined') return { id: 'ssr' };
  const stored = localStorage.getItem('shiftpass_employer');
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  const session: EmployerSession = { id: generateUUID() };
  localStorage.setItem('shiftpass_employer', JSON.stringify(session));
  return session;
}

// ── Volunteer ─────────────────────────────────────────────────────────────────

export interface VolunteerSession {
  id: string;
  name: string;
  email: string;
}

export function getVolunteerSession(): VolunteerSession | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('shiftpass_volunteer');
  if (!stored) return null;
  try { return JSON.parse(stored); } catch { return null; }
}

export function saveVolunteerSession(name: string, email: string): VolunteerSession {
  const existing = getVolunteerSession();
  const session: VolunteerSession = {
    id: existing?.id ?? generateUUID(),
    name,
    email,
  };
  localStorage.setItem('shiftpass_volunteer', JSON.stringify(session));
  return session;
}

export function clearVolunteerSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('shiftpass_volunteer');
  }
}
