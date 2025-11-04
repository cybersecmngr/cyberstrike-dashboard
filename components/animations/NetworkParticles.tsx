'use client';

import { NetworkParticles as NetworkParticlesCanvas, type NetworkParticlesProps } from '@/lib/animations-components';

export default function NetworkParticles(props: NetworkParticlesProps) {
  return <NetworkParticlesCanvas {...props} />;
}

