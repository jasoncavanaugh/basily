export function cents_to_dollars_display(value_in_cents: number) {
  const dollars = Math.floor(value_in_cents / 100).toLocaleString();
  const cents =
    value_in_cents % 100 < 10
      ? `0${value_in_cents % 100}`
      : `${value_in_cents % 100}`;
  return `\$${dollars}.${cents}`;
}
