type PriceProps = {
  amount: number;
  className?: string;
};

export function Price({ amount, className }: PriceProps) {
  return (
    <span className={className} dir="ltr">
      {amount} د.م.
    </span>
  );
}

export function formatPrice(amount: number): string {
  return `${amount} د.م.`;
}
