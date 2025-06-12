// Cosmic Platform Shared Types

export interface StarSystemType {
  id: string
  username: string
  email: string
  reputation: number
  brightness: number
  createdAt: Date
  updatedAt: Date
}

export interface PlanetType {
  id: string
  starSystemId: string
  planetType: 'MERCURY' | 'VENUS' | 'MARS' | 'JUPITER' | 'EARTH' | 'KRONOS'
  config: Record<string, any>
  createdAt: Date
}

export interface ContentType {
  id: string
  planetId: string
  type: 'LAYER' | 'SATELLITE'
  title: string
  body?: string
  metadata: Record<string, any>
  entropyScore: number
  createdAt: Date
  updatedAt: Date
}

export interface BridgeType {
  id: string
  sourceId: string
  targetId: string
  creatorId: string
  bridgeType: 'REFERENCE' | 'INSPIRATION' | 'UPDATE' | 'DEBATE'
  reason: string
  confidence: number
  createdAt: Date
}
