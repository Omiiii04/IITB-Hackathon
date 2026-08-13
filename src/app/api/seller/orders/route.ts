import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Endpoint active' });
}

export async function POST() {
  return NextResponse.json({ status: 'ok', message: 'Endpoint active' });
}
