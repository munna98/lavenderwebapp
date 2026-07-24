import Decimal from "decimal.js";

export function computeTotals(
  items: Array<{ qty: string | number; rate: string | number; taxPercent?: string | number }>
) {
  let subtotal = new Decimal(0);
  let totalTax = new Decimal(0);

  for (const item of items) {
    const qty = new Decimal(item.qty);
    const rate = new Decimal(item.rate);
    const taxPct = new Decimal(item.taxPercent || 0);
    const lineSubtotal = qty.mul(rate);
    const lineTax = lineSubtotal.mul(taxPct).div(100);
    subtotal = subtotal.plus(lineSubtotal);
    totalTax = totalTax.plus(lineTax);
  }

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
