'use client';

import { HexagonGrid as HexagonGridSVG, type HexagonGridProps } from '@/lib/animations-components';

export default function HexagonGrid(props: HexagonGridProps) {
  return <HexagonGridSVG {...props} />;
}

