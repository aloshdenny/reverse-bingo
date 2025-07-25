import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { generateRoomCode } from '../lib/utils'
import { v4 as uuidv4 } from 'uuid'
import { Users, Plus, LogIn, Sparkles } from 'lucide-react'

interface RoomManagerProps {
  onRoomJoined: (roomId: string, playerId: string) => void
}

export default function RoomManager({ onRoomJoined }: RoomManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [playerName, setPlayerName] = useState('')
  const [error, setError] = useState('')

  const createRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }

    setIsCreating(true)
    setError('')

    try {
      const playerId = uuidv4()
      const code = generateRoomCode()

      // Create room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .insert({
          room_code: code,
          created_by: playerId,
          status: 'waiting'
        })
        .select()
        .single()

      if (roomError) throw roomError

      // Create player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          room_id: room.id,
          name: playerName.trim()
        })

      if (playerError) throw playerError

      localStorage.setItem('playerId', playerId)
      localStorage.setItem('playerName', playerName.trim())
      onRoomJoined(room.id, playerId)
    } catch (err: any) {
      setError(err.message || 'Failed to create room')
    } finally {
      setIsCreating(false)
    }
  }

  const joinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name')
      return
    }
    if (!roomCode.trim()) {
      setError('Please enter room code')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      const playerId = uuidv4()

      // Find room
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .single()

      if (roomError || !room) {
        throw new Error('Room not found')
      }

      // Check if room is still accepting players
      if (room.status !== 'waiting' && room.status !== 'collecting') {
        throw new Error('Room is no longer accepting players')
      }

      // Create player
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          id: playerId,
          room_id: room.id,
          name: playerName.trim()
        })

      if (playerError) throw playerError

      localStorage.setItem('playerId', playerId)
      localStorage.setItem('playerName', playerName.trim())
      onRoomJoined(room.id, playerId)
    } catch (err: any) {
      setError(err.message || 'Failed to join room')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl mb-4 floating-animation">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Akinator Bingo
            </h1>
            <p className="text-white/80 text-sm sm:text-base">
              Guess who with AI-generated clues!
            </p>
          </div>

          {/* Player Name Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white/90 mb-2">
              Your Name
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                placeholder="Enter your name"
                maxLength={50}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 text-red-100 rounded-xl backdrop-blur-sm slide-up">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                {error}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Create Room Button */}
            <button
              onClick={createRoom}
              disabled={isCreating || !playerName.trim()}
              className="w-full gradient-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              <span>{isCreating ? 'Creating Room...' : 'Create New Room'}</span>
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-transparent text-white/60 text-sm font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Join Room Section */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent backdrop-blur-sm transition-all duration-200 text-center font-mono text-lg tracking-widest"
                  placeholder="ENTER CODE"
                  maxLength={6}
                />
              </div>
              
              <button
                onClick={joinRoom}
                disabled={isJoining || !playerName.trim() || !roomCode.trim()}
                className="w-full success-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <LogIn className="w-5 h-5" />
                <span>{isJoining ? 'Joining Room...' : 'Join Room'}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-white/60 text-xs sm:text-sm">
              Create or join a room to start playing with friends
            </p>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </div>
    </div>
  )
} 