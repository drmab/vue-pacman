export interface GlobalEnv {
  COLOR: string[]
  COS: number[]
  SIN: number[]
  SCORE: number
  SALAIRE: number
  PRIMES: number
  BONUS: number
  ECHELONS: number[]
  PARCOURS: string
  LIFE: number
  NPC_COUNT: number
}

export interface Coord {
  x: number
  y: number
  offset: number
}

export interface Vector {
  x: number
  y: number
  change?: number
}
