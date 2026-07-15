import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Called by the backend right after it saves SiteSettings, so admin edits
// (phone, WhatsApp, nav, footer, etc.) show up on the live site immediately
// instead of waiting for the 60s ISR window in lib/settings.ts to expire.
export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ success: false, message: 'Invalid secret' }, { status: 401 });
  }

  // Root layout fetches settings and wraps every route, so revalidating it
  // busts the cached settings fetch for the whole site in one call.
  revalidatePath('/', 'layout');

  return NextResponse.json({ success: true, revalidated: true, now: Date.now() });
}
