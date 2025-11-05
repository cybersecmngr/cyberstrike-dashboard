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

