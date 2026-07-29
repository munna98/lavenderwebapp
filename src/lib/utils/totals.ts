import Decimal from "decimal.js";

export function computeTotals(
  items: Array<{ qty: string | number; rate: string | number; taxPercent?: string | number }>
) {
  let subtotal = new Decimal(0);

  for (const item of items) {
    const qty = new Decimal(item.qty || 0);
    const rate = new Decimal(item.rate || 0);
    const lineSubtotal = qty.mul(rate);
    subtotal = subtotal.plus(lineSubtotal);
  }

  const totalTax = subtotal.mul(0.05);
  const total = subtotal.plus(totalTax);

  const fmt = (d: Decimal) =>
    d.toDecimalPlaces(2).toNumber().toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return {
    subtotal: subtotal.toDecimalPlaces(2).toNumber(),
    totalTax: totalTax.toDecimalPlaces(2).toNumber(),
    total: total.toDecimalPlaces(2).toNumber(),
    subtotalFormatted: fmt(subtotal),
    totalTaxFormatted: fmt(totalTax),
    totalFormatted: fmt(total),
  };
}
