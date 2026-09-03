import { randomUUID } from 'node:crypto'
import { AccessToken } from 'livekit-server-sdk'
import { NextResponse } from 'next/server'
import { isAllowedRoom } from '@/lib/rooms'
import { isParticipantRole, type ParticipantRole } from '@/lib/talkback'

type TokenRequestBody = {
  roomName?: unknown
  participantName?: unknown
  role?: unknown
  managerId?: unknown
}

export async function POST(request: Request) {
  let body: TokenRequestBody

  try {
    body = (await request.json()) as TokenRequestBody
  } catch {
    return NextResponse.json(
      {
        error: 'Invalid request body',
      },
      {
        status: 400,
      },
    )
  }

  if (typeof body.roomName !== 'string' || !isAllowedRoom(body.roomName)) {
    return NextResponse.json(
      {
        error: 'Room is not allowed',
      },
      {
        status: 400,
      },
    )
  }

  if (
    typeof body.participantName !== 'string' ||
    body.participantName.trim().length === 0
  ) {
    return NextResponse.json(
      {
        error: 'Display name is required',
      },
      {
        status: 400,
      },
    )
  }

  if (!isParticipantRole(body.role)) {
    return NextResponse.json(
      { error: 'Participant role is invalid' },
      { status: 400 },
    )
  }

  const role: ParticipantRole = body.role
  const managerId =
    role === 'operator_manager' && typeof body.managerId === 'string'
      ? body.managerId.trim()
      : null

  if (role === 'operator_manager' && !managerId) {
    return NextResponse.json(
      { error: 'Manager ID is required' },
      { status: 400 },
    )
  }

  const apiKey = process.env.LIVEKIT_API_KEY
  const apiSecret = process.env.LIVEKIT_API_SECRET
  const serverUrl = process.env.LIVEKIT_URL

  if (!apiKey || !apiSecret || !serverUrl) {
    console.error('Missing LiveKit environment variables')

    return NextResponse.json(
      {
        error: 'LiveKit server is not configured',
      },
      {
        status: 500,
      },
    )
  }

  try {
    const participantName = body.participantName.trim()

    const participantIdentity =
      role === 'operator_manager' ? managerId! : `operator-${randomUUID()}`

    const metadata = JSON.stringify({
      role,
      managerId: role === 'operator_manager' ? participantIdentity : 'OPM-01',
      operatorRoomId: role === 'operator' ? body.roomName : undefined,
    })

    const accessToken = new AccessToken(apiKey, apiSecret, {
      identity: participantIdentity,
      name: participantName,
      metadata,
      ttl: '10m',
    })

    accessToken.addGrant({
      room: body.roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true,
    })

    const token = await accessToken.toJwt()

    return NextResponse.json({
      serverUrl,
      token,
      roomName: body.roomName,
      participantName,
      participantIdentity,
    })
  } catch (error) {
    console.error('Failed to generate an access token', error)

    return NextResponse.json(
      {
        error: 'Failed to generate an access token',
      },
      {
        status: 500,
      },
    )
  }
}
