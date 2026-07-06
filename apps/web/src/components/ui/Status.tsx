/* Inline status / feedback banner. Meaning is carried by text + a decorative
   SVG icon (never by color alone — WCAG 1.4.1). Errors announce assertively via
   role="alert"; everything else is a polite role="status" so screen readers are
   informed without interrupting. */
import type { ReactNode } from 'react';
import { AlertIcon, InfoIcon } from './Icons';

type Tone = 'info' | 'success' | 'warning' | 'error';

interface Props {
  tone?: Tone;
  children: ReactNode;
  live?: 'polite' | 'assertive' | 'off';
}

export function Status({ tone = 'info', live, children }: Props) {
  const isError = tone === 'error';
  const Icon = tone === 'error' || tone === 'warning' ? AlertIcon : InfoIcon;
  return (
    <div
      className={`status status-${tone}`}
      role={isError ? 'alert' : 'status'}
      aria-live={live ?? (isError ? 'assertive' : 'polite')}
    >
      <Icon className="status-icon" size={20} />
      <span>{children}</span>
    </div>
  );
}
