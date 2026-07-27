'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

/* --------------------------------------------------------------------------
 * Etichette
 * Pubblico: 11px, .1em, `text-3`, 7px sotto.
 * Admin:    10.5px, .2em, `text-4`, 8px sotto.
 * Sono <label> veri legati al campo: mai solo placeholder.
 * ----------------------------------------------------------------------- */

export function FieldLabel({
  htmlFor,
  children,
  required,
  requiredHint,
  tone = 'public',
  className,
}: {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
  requiredHint?: string;
  tone?: 'public' | 'admin';
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        'block font-body',
        tone === 'admin'
          ? 'mb-8 text-10-5 font-medium tracking-20 text-ink-4'
          : 'mb-7 text-11 font-normal tracking-10 text-ink-3',
        className,
      )}
    >
      {children}
      {required && (
        <>
          {' '}
          <span aria-hidden="true" className="text-gold">
            *
          </span>
          {requiredHint && <span className="sr-only"> ({requiredHint})</span>}
        </>
      )}
    </label>
  );
}

export function FieldError({ id, children }: { id?: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-6 font-body text-12 font-normal text-red">
      {children}
    </p>
  );
}

/** Contenitore etichetta + campo + errore. */
export function Field({
  label,
  htmlFor,
  required,
  requiredHint,
  error,
  tone = 'public',
  className,
  children,
}: {
  label: React.ReactNode;
  htmlFor: string;
  required?: boolean;
  requiredHint?: string;
  error?: string;
  tone?: 'public' | 'admin';
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn('min-w-0', className)}>
      <FieldLabel htmlFor={htmlFor} required={required} requiredHint={requiredHint} tone={tone}>
        {label}
      </FieldLabel>
      {children}
      <FieldError id={`${htmlFor}-error`}>{error}</FieldError>
    </div>
  );
}

/* --------------------------------------------------------------------------
 * Campi
 * ----------------------------------------------------------------------- */

const controlBase =
  'w-full border bg-field-bg font-body font-medium text-ink-2 rounded-none ' +
  'transition-colors duration-200 ease-out placeholder:text-ink-4 ' +
  'focus:border-gold focus:outline-none focus-visible:outline-none';

const controlPublic = 'px-14 py-12 text-14';
const controlAdmin = 'px-14 py-11 text-14';

function stateBorder(invalid?: boolean) {
  return invalid ? 'border-red' : 'border-field-border';
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  tone?: 'public' | 'admin';
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, tone = 'public', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        tone === 'admin' ? controlAdmin : controlPublic,
        stateBorder(invalid),
        className,
      )}
      {...rest}
    />
  );
});

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
  tone?: 'public' | 'admin';
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid, tone = 'public', ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        controlBase,
        'resize-y leading-170',
        tone === 'admin' ? controlAdmin : controlPublic,
        stateBorder(invalid),
        className,
      )}
      {...rest}
    />
  );
});

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  invalid?: boolean;
  tone?: 'public' | 'admin';
};

/** La freccia della select è il carattere "▼", come nel mockup. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid, tone = 'public', children, ...rest },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          controlBase,
          'cursor-pointer appearance-none pr-34',
          tone === 'admin' ? controlAdmin : controlPublic,
          stateBorder(invalid),
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-14 -translate-y-1/2 text-10 text-ink-3"
      >
        ▼
      </span>
    </div>
  );
});

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  children: React.ReactNode;
};

/** Quadrato 15px senza raggio: quando è selezionato si riempie d'oro. */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { className, invalid, children, id, ...rest },
  ref,
) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'flex cursor-pointer items-start gap-10 font-body text-13-5 font-medium text-ink-3',
        className,
      )}
    >
      <input
        ref={ref}
        id={id}
        type="checkbox"
        aria-invalid={invalid || undefined}
        className={cn(
          'mt-2 size-15 flex-none appearance-none rounded-none border bg-transparent',
          'transition-colors duration-200 ease-out',
          'checked:border-gold checked:bg-gold',
          invalid ? 'border-red' : 'border-check',
        )}
        {...rest}
      />
      <span>{children}</span>
    </label>
  );
});

/** Interruttore "IN EVIDENZA" dell'editor: 34×19, pallino 15px. */
export function Toggle({
  id,
  checked,
  onChange,
  labelOn,
  labelOff,
  describedBy,
}: {
  id: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  labelOn: string;
  labelOff: string;
  describedBy?: string;
}) {
  return (
    <div className="mt-12 flex items-center gap-9">
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-describedby={describedBy}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-19 w-34 flex-none rounded-pill transition-colors duration-200 ease-out',
          checked ? 'bg-gold' : 'bg-field-border',
        )}
      >
        <span
          className={cn(
            'absolute top-2 size-15 rounded-full transition-[left] duration-200 ease-out',
            checked ? 'left-17 bg-gold-ink' : 'left-2 bg-ink-3',
          )}
        />
      </button>
      <span className="font-body text-13-5 font-medium text-ink-2">
        {checked ? labelOn : labelOff}
      </span>
    </div>
  );
}
