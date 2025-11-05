import { NextRequest, NextResponse } from 'next/server';
import { progressStore } from '@/lib/progress-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const target = searchParams.get('target');

    if (!target) {
      return NextResponse.json(
        { error: 'Target URL is required' },
        { status: 400 }
      );
    }

    const progressKey = `pentest_${target}`;
    const stored = progressStore.get(progressKey);

    console.log(`[Progress API] Request for target: ${target}`);
    console.log(`[Progress API] Progress key: ${progressKey}`);
    console.log(`[Progress API] Store size: ${progressStore.size}`);
    console.log(`[Progress API] Stored data:`, stored ? {
      currentStage: stored.currentStage,
      completed: stored.completed,
      stageCount: Object.keys(stored.stageProgress).length
    } : 'null');

    if (!stored) {
      return NextResponse.json({
        currentStage: 'Not started',
        stageProgress: {},
        completed: false
      });
    }

    return NextResponse.json({
      currentStage: stored.currentStage,
      stageProgress: stored.stageProgress,
      discovery_progress: stored.discovery_progress,
      completed: stored.completed,
      result: stored.completed ? stored.result : null
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

