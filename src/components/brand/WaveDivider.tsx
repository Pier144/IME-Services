import { cn } from '@/lib/utils';

/**
 * Le due onde, blu (IME) e rossa (La Fabbrica), riprese dalla livrea dei
 * furgoni. Separano i due pannelli "due anime" in home.
 * Sotto i 900px il blocco si impila e le onde ruotano in orizzontale.
 */
export function WaveDivider({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn('relative flex flex-none items-center justify-center', className)}
    >
      <svg
        width="70"
        height="100%"
        viewBox="0 0 70 340"
        preserveAspectRatio="none"
        className="absolute h-full"
        focusable="false"
      >
        <path
          d="M48 0 C8 90 66 190 22 340"
          stroke="var(--color-blue)"
          strokeWidth="12"
          fill="none"
        />
        <path
          d="M64 0 C24 90 82 190 38 340"
          stroke="var(--color-red)"
          strokeWidth="8"
          fill="none"
        />
      </svg>
    </div>
  );
}
