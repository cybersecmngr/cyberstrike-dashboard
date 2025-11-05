import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import crypto from 'crypto';

const execPromise = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const toolType = formData.get('toolType') as string;

    if (!file) {
      return NextResponse.json({ success: false, error: 'File required' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const tempPath = join(tmpdir(), `forensic_${crypto.randomBytes(8).toString('hex')}_${file.name}`);

    try {
      await writeFile(tempPath, buffer);

      try {
        const pythonCheck = await execPromise('which python3').catch(() => ({ stdout: '' }));
        if (pythonCheck.stdout) {
          try {
            const scriptPath = process.cwd() + '/scripts/forensic_tools.py';
            const { stdout } = await execPromise(
              `python3 ${scriptPath} ${toolType} "${tempPath}"`,
              { timeout: 30000 }
            );
            const result = JSON.parse(stdout);
            if (result && result.success) {
              await unlink(tempPath).catch(() => {});
              return NextResponse.json({ success: true, result: result.result });
            }
          } catch {
            // Fall through
          }
        }
      } catch {
        // Fall through
      }

      await unlink(tempPath).catch(() => {});

      return NextResponse.json({
        success: true,
        mock: true,
        result: { note: 'Python script not available. Returning mock data.' },
      });
    } catch (error) {
      await unlink(tempPath).catch(() => {});
      throw error;
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

