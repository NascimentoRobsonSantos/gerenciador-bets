export function formatCurrency(n: number, locale = "pt-BR", currency = "BRL") {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n ?? 0);
  } catch {
    return `R$ ${Number(n ?? 0).toFixed(2)}`;
  }
}

