import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ALLOWED_ROLES = ['ADMIN', 'SUB_ADMIN', 'SUPER_ADMIN'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !ALLOWED_ROLES.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.platformSettings.findFirst();
    if (!settings) {
       const newSettings = await prisma.platformSettings.create({ data: {} });
       return NextResponse.json(newSettings);
    }
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !ALLOWED_ROLES.includes((session.user as any).role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const current = await prisma.platformSettings.findFirst();
    if (!current) return NextResponse.json({ error: 'Settings not initialized' }, { status: 400 });

    const updated = await prisma.platformSettings.update({
      where: { id: current.id },
      data: body
    });

    return NextResponse.json({ message: 'Settings updated successfully', settings: updated });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
