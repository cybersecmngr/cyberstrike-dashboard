'use client';

import { ScanLineOverlay } from '@/lib/animations-components';

interface ScanLineProps {
  speed?: number;
  color?: string;
  thickness?: number;
}

export default function ScanLine(props: ScanLineProps) {
  return <ScanLineOverlay {...props} />;
}

