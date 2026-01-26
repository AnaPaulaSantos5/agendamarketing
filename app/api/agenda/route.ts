import { NextResponse } from 'next/server'

export async function GET() {
  const res = await fetch(process.env.GOOGLE_SCRIPT_URL!)
  const data = await res.json()
  return NextResponse.json(data)
}
