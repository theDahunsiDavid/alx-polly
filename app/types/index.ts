export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Poll {
  id: string
  title: string
  description?: string
  options: PollOption[]
  createdBy: string
  isActive: boolean
  allowMultipleVotes: boolean
  expiresAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface PollOption {
  id: string
  text: string
  pollId: string
  voteCount: number
}

export interface Vote {
  id: string
  pollId: string
  optionId: string
  userId: string
  createdAt: Date
}

export interface CreatePollRequest {
  title: string
  description?: string
  options: string[]
  allowMultipleVotes: boolean
  expiresAt?: Date
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}
