import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { shuffleArray } from '../lib/utils'
import { Users, Play, Clock, CheckCircle, UserCheck } from 'lucide-react'

interface Player {
  id: string
  name: string
  answers: Record<string, string>
}

interface WaitingRoomProps {
  roomId: string
  playerId: string
  roomCode: string
  onGameStarted: () => void
}

export default function WaitingRoom({ roomId, playerId, roomCode, onGameStarted }: WaitingRoomProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [room, setRoom] = useState<any>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState('')

  const isHost = room?.created_by === playerId

  useEffect(() => {
    loadRoomAndPlayers()

    // Set up real-time subscriptions
    const playersSubscription = supabase
      .channel('waiting-room-players')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => loadRoomAndPlayers()
      )
      .subscribe()

    const roomSubscription = supabase
      .channel('waiting-room')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          setRoom(payload.new)
          if (payload.new.status === 'playing') {
            onGameStarted()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersSubscription)
      supabase.removeChannel(roomSubscription)
    }
  }, [roomId, onGameStarted])

  const loadRoomAndPlayers = async () => {
    // Load room
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single()

    if (roomError) {
      setError('Failed to load room')
      return
    }

    setRoom(roomData)

    // Load players
    const { data: playersData, error: playersError } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)

    if (playersError) {
      setError('Failed to load players')
      return
    }

    setPlayers(playersData || [])

    // If room status changed to playing, start the game
    if (roomData.status === 'playing') {
      onGameStarted()
    }
  }

  const startGame = async () => {
    if (players.length < 2) {
      setError('Need at least 2 players to start the game')
      return
    }

    setIsStarting(true)
    setError('')

    try {
      // Shuffle players and assign targets
      const shuffledPlayers = shuffleArray([...players])
      const assignments: { playerId: string; targetId: string }[] = []

      for (let i = 0; i < shuffledPlayers.length; i++) {
        const currentPlayer = shuffledPlayers[i]
        const targetPlayer = shuffledPlayers[(i + 1) % shuffledPlayers.length]
        assignments.push({
          playerId: currentPlayer.id,
          targetId: targetPlayer.id
        })
      }

      // Update all players with their target assignments
      for (const assignment of assignments) {
        const { error: updateError } = await supabase
          .from('players')
          .update({ target_player_id: assignment.targetId })
          .eq('id', assignment.playerId)

        if (updateError) throw updateError
      }

      // Update room status to playing
      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({ status: 'playing' })
        .eq('id', roomId)

      if (roomUpdateError) throw roomUpdateError

    } catch (err: any) {
      setError(err.message || 'Failed to start game')
      setIsStarting(false)
    }
  }

  const playersWithAnswers = players.filter(p => p.answers && Object.keys(p.answers).length > 0)
  const playersWithoutAnswers = players.filter(p => !p.answers || Object.keys(p.answers).length === 0)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl">
        <div className="glass-card rounded-3xl p-6 sm:p-8 slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-2xl mb-4 floating-animation">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Waiting Room
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-2">
              <span className="text-white/70">Room Code:</span>
              <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="font-mono font-bold text-xl text-blue-300 tracking-widest">
                  {roomCode}
                </span>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Share this code with other players
            </p>
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

          {/* Player Status */}
          <div className="space-y-6">
            {/* Ready Players */}
            {playersWithAnswers.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Ready to Play ({playersWithAnswers.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playersWithAnswers.map((player, index) => (
                    <div 
                      key={player.id} 
                      className="bg-green-500/20 border border-green-400/30 text-green-100 p-4 rounded-xl backdrop-blur-sm flex items-center space-x-3 slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <UserCheck className="w-5 h-5 text-green-400" />
                      <span className="font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Waiting Players */}
            {playersWithoutAnswers.length > 0 && (
              <div className="bg-white/5 rounded-2xl p-6 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Answering Questions ({playersWithoutAnswers.length})
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {playersWithoutAnswers.map((player, index) => (
                    <div 
                      key={player.id} 
                      className="bg-yellow-500/20 border border-yellow-400/30 text-yellow-100 p-4 rounded-xl backdrop-blur-sm flex items-center space-x-3 slide-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="font-medium">{player.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {players.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-white/60" />
                </div>
                <p className="text-white/60 text-lg">Waiting for players to join...</p>
              </div>
            )}
          </div>

          {/* Game Start Section */}
          <div className="mt-8 pt-6 border-t border-white/20">
            {isHost ? (
              <div className="text-center">
                <div className="bg-white/5 rounded-xl p-4 mb-4 backdrop-blur-sm">
                  <p className="text-white/80 text-sm mb-2">
                    👑 You are the host
                  </p>
                  <p className="text-white/70 text-sm">
                    Start the game when everyone is ready
                  </p>
                </div>
                <button
                  onClick={startGame}
                  disabled={isStarting || playersWithAnswers.length < 2}
                  className="success-button disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl flex items-center justify-center space-x-3 mx-auto"
                >
                  {isStarting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Starting Game...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>Start Game</span>
                    </>
                  )}
                </button>
                {playersWithAnswers.length < 2 && (
                  <p className="text-white/60 text-sm mt-3">
                    Need at least 2 players with completed answers
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <p className="text-white font-medium mb-1">
                    Waiting for host to start the game
                  </p>
                  <p className="text-white/60 text-sm">
                    The game will begin once everyone is ready
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-r from-pink-400/20 to-rose-400/20 rounded-full blur-xl floating-animation"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-full blur-xl" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
} 