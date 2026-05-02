import { NextResponse } from 'next/server'
import { OPENAPI_SPEC } from '@/lib/openapi'

export function GET() {
  return NextResponse.json(OPENAPI_SPEC)
}
