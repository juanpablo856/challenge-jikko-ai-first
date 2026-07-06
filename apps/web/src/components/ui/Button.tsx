/* Accessible button. Real <button> element (keyboard + focus for free).
   Icon slot is decorative; the label text carries the accessible name.
   Icon-only buttons must pass an explicit `aria-label`. */
import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({ variant = 'primary', icon, children, className = '', type, ...rest }: Props) {
  return (
    <button type={type ?? 'button'} className={`btn btn-${variant} ${className}`.trim()} {...rest}>
      {icon}
      {children != null && <span>{children}</span>}
    </button>
  );
}
