'use client';

import { RadarSweep as RadarSweepCanvas, type RadarSweepProps } from '@/lib/animations-components';

export default function RadarSweep(props: RadarSweepProps) {
  return <RadarSweepCanvas {...props} />;
}

