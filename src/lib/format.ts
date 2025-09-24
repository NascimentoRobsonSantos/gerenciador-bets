export function formatCurrency(n: number, locale = "pt-BR", currency = "BRL") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n ?? 0);
  } catch {
    return `R$ ${Number(n ?? 0).toFixed(2)}`;
  }
}

export function formatDateForDateInput(date: Date, timeZone = 'America/Sao_Paulo') {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (!year || !month || !day) throw new Error('missing date parts');
    return `${year}-${month}-${day}`;
  } catch {
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
