export function commafy(n: number | string): string {
  return typeof n === 'string'
    ? n.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : commafy(n.toString());
}

export function humanize(n: number): string {
  if (n < 0) {
    return '-' + humanize(-n);
  }
  if (n >= 1000) {
    const [nat, frac] = Math.round(n / 100)
      .toString()
      .match(/^(\d*)(\d)$/)!
      .slice(1);
    return `${commafy(nat)}.${frac || '0'}K`;
  }
  return commafy(n);
}
