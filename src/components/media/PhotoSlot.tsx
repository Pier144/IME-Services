import Image from 'next/image';
import { cn } from '@/lib/utils';

type PhotoSlotProps = {
  /**
   * Etichetta descrittiva presa dal mockup: è il brief fotografico per il
   * cliente ("FOTO — albero 6 m in piazza"). Resta anche quando la foto
   * arriva, come testo alternativo di riserva.
   */
  label: string;
  /** La foto vera, quando c'è. Il layout non cambia. */
  src?: string | null;
  /** Testo alternativo della foto vera. Se manca si usa `label`. */
  alt?: string;
  /** Proporzione CSS, es. "620/360". Alternativa all'altezza fissa. */
  ratio?: string;
  className?: string;
  /** Posizione dell'etichetta: al centro (default) o in alto a destra (hero). */
  labelPosition?: 'center' | 'top-right';
  labelClassName?: string;
  priority?: boolean;
  sizes?: string;
  /** Veli, testi e twinkle che vanno sopra la foto. */
  children?: React.ReactNode;
};

/**
 * Segnaposto fotografico del design system: fondo `#131a30` con righe
 * diagonali a 45° e l'etichetta del soggetto richiesto.
 *
 * Quando il cliente consegna le immagini basta passare `src`: proporzioni,
 * ritaglio e ingombro restano identici, quindi nessuna pagina va ritoccata.
 */
export function PhotoSlot({
  label,
  src,
  alt,
  ratio,
  className,
  labelPosition = 'center',
  labelClassName,
  priority,
  sizes = '100vw',
  children,
}: PhotoSlotProps) {
  return (
    <div
      className={cn('photo-slot', className)}
      style={ratio ? { aspectRatio: ratio } : undefined}
      data-photo-slot={src ? 'filled' : 'empty'}
    >
      {src ? (
        <Image
          src={src}
          alt={alt ?? label}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      ) : (
        <span
          className={cn(
            'photo-slot-label',
            labelPosition === 'top-right' && 'absolute top-14 right-16 text-left',
            labelClassName,
          )}
        >
          {label}
        </span>
      )}
      {children}
    </div>
  );
}
