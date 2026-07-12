/** Returns today's date as YYYY-MM-DD in local time */

export function getTodayDateString(): string {

  const d = new Date();

  const y = d.getFullYear();

  const m = String(d.getMonth() + 1).padStart(2, '0');

  const day = String(d.getDate()).padStart(2, '0');

  return `${y}-${m}-${day}`;

}


 

/** Formats a number as AED currency */

export function formatCurrency(amount: number): string {

  return `AED ${amount.toLocaleString('en-AE', { minimumFractionDigits: 0 })}`;

}


 

/**

 * Validates a post-login redirect URL to prevent open redirect attacks.

 * Only allows relative paths (e.g. /account, /order?cart=open).

 * Rejects protocol-relative (//evil.com) and absolute URLs (https://...).

 */

export function safeRedirect(redirect: string | null | undefined, fallback = '/account'): string {

  if (!redirect) return fallback;

  if (redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/\\')) {

    return redirect;

  }

  return fallback;

}


 

/** Basic email format check */

export function isValidEmail(email: string): boolean {

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

}