import { NextRequest, NextResponse } from 'next/server';
import { readdir, unlink, stat } from 'fs/promises';
import { join } from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;

    // Extract business name and timestamp from report ID
    // Format: BusinessName_2025-10-04T10:52:22
    const reportIdParts = reportId.split('_');
    const isoTimestamp = reportIdParts[reportIdParts.length - 1];
    const businessDir = reportIdParts.slice(0, -1).join('_');

    // Convert ISO timestamp to file timestamp format
    // 2025-10-04T10:52:22 -> 20251004_105222
    const reportTimestamp = isoTimestamp
      .replace(/[-:]/g, '')
      .replace('T', '_')
      .substring(0, 15); // YYYYMMDD_HHMMSS

    // Find and delete all files associated with this exact report timestamp
    const resultsPath = join(process.cwd(), '..', 'ai-visibility-tester', 'results');
    const filesDeleted: string[] = [];

    try {
      const businessPath = join(resultsPath, businessDir);

      try {
        const businessStat = await stat(businessPath);

        if (businessStat.isDirectory()) {
          const files = await readdir(businessPath);

          for (const file of files) {
            // Parse timestamp from filename
            const timestampMatch = file.match(/(\d{8}_\d{6})/);
            if (timestampMatch) {
              const fileTimestamp = timestampMatch[1];

              // Delete file only if it matches the exact timestamp
              if (fileTimestamp === reportTimestamp) {
                const filePath = join(businessPath, file);
                await unlink(filePath);
                filesDeleted.push(file);
                console.log(`Deleted file: ${file}`);
              }
            }
          }
        }
      } catch (error) {
        console.error(`Error processing business directory ${businessDir}:`, error);
      }

      if (filesDeleted.length === 0) {
        return NextResponse.json(
          { error: 'Report not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        filesDeleted: filesDeleted.length,
        files: filesDeleted
      });

    } catch (error) {
      console.error('Error reading results directory:', error);
      return NextResponse.json(
        { error: 'Failed to access reports directory' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 }
    );
  }
}
