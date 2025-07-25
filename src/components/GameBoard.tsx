import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateClue } from '../lib/ai-questions'

interface Player {
  id: string
  name: string
  answers: Record<string, string>
  target_player_id: string | null
  clues_used: number
  found_at: string | null
}

interface Clue {
  id: string
  content: string
  clue_number: number
  created_at: string
}

interface GameBoardProps {
  roomId: string
  playerId: string
  roomCode: string
}

export default function GameBoard({ roomId, playerId, roomCode }: GameBoardProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [targetPlayer, setTargetPlayer] = useState<Player | null>(null)
  const [clues, setClues] = useState<Clue[]>([])
  const [isRequestingClue, setIsRequestingClue] = useState(false)
  const [guess, setGuess] = useState('')
  const [isSubmittingGuess, setIsSubmittingGuess] = useState(false)
  const [error, setError] = useState('')
  const [gameFinished, setGameFinished] = useState(false)

  // Load players and set up real-time subscriptions
  useEffect(() => {
    loadPlayers()
    
    const playersSubscription = supabase
      .channel('players')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'players', filter: `room_id=eq.${roomId}` },
        () => loadPlayers()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(playersSubscription)
    }
  }, [roomId])

  // Load clues for target player
  useEffect(() => {
    if (targetPlayer) {
      loadClues()
      
      const cluesSubscription = supabase
        .channel('clues')
        .on('postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'clues', filter: `player_id=eq.${targetPlayer.id}` },
          () => loadClues()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(cluesSubscription)
      }
    }
  }, [targetPlayer])

  const loadPlayers = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('room_id', roomId)

    if (error) {
      setError('Failed to load players')
      return
    }

    setPlayers(data || [])

    // Find current player's target
    const currentPlayer = data?.find(p => p.id === playerId)
    if (currentPlayer?.target_player_id) {
      const target = data?.find(p => p.id === currentPlayer.target_player_id)
      setTargetPlayer(target || null)
    }

    // Check if game is finished (current player found their target)
    if (currentPlayer?.found_at) {
      setGameFinished(true)
    }
  }

  const loadClues = async () => {
    if (!targetPlayer) return

    const { data, error } = await supabase
      .from('clues')
      .select('*')
      .eq('player_id', targetPlayer.id)
      .order('clue_number', { ascending: true })

    if (!error) {
      setClues(data || [])
    }
  }

  const requestClue = async () => {
    if (!targetPlayer) return

    setIsRequestingClue(true)
    setError('')

    try {
      const nextClueNumber = clues.length + 1
      const clueContent = await generateClue(targetPlayer.answers, nextClueNumber)

      // Save clue to database
      const { error: clueError } = await supabase
        .from('clues')
        .insert({
          player_id: targetPlayer.id,
          content: clueContent,
          clue_number: nextClueNumber
        })

      if (clueError) throw clueError

      // Update player's clues used count
      const { error: updateError } = await supabase
        .from('players')
        .update({ clues_used: nextClueNumber })
        .eq('id', playerId)

      if (updateError) throw updateError

    } catch (err: any) {
      setError(err.message || 'Failed to request clue')
    } finally {
      setIsRequestingClue(false)
    }
  }

  const submitGuess = async () => {
    if (!guess.trim() || !targetPlayer) return

    setIsSubmittingGuess(true)
    setError('')

    try {
      const isCorrect = guess.trim().toLowerCase() === targetPlayer.name.toLowerCase()

      if (isCorrect) {
        // Mark as found
        const { error: updateError } = await supabase
          .from('players')
          .update({ found_at: new Date().toISOString() })
          .eq('id', playerId)

        if (updateError) throw updateError

        setGameFinished(true)
      } else {
        setError('Incorrect guess! Try requesting more clues.')
        setGuess('')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit guess')
    } finally {
      setIsSubmittingGuess(false)
    }
  }

  const getLeaderboard = () => {
    return players
      .filter(p => p.found_at)
      .sort((a, b) => {
        // Sort by clues used (ascending), then by found time
        if (a.clues_used !== b.clues_used) {
          return a.clues_used - b.clues_used
        }
        return new Date(a.found_at!).getTime() - new Date(b.found_at!).getTime()
      })
  }

  const currentPlayer = players.find(p => p.id === playerId)
  const leaderboard = getLeaderboard()

  if (!targetPlayer) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for game to start...</h2>
          <p className="text-gray-600">Room Code: <span className="font-mono font-bold text-lg">{roomCode}</span></p>
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Players in room:</h3>
            <div className="space-y-1">
              {players.map(player => (
                <div key={player.id} className="text-gray-700">{player.name}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (gameFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 text-center max-w-2xl w-full">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations! 🎉</h2>
          <p className="text-xl text-gray-800 mb-2">You found your target: <span className="font-bold">{targetPlayer.name}</span></p>
          <p className="text-gray-600 mb-8">You used {currentPlayer?.clues_used || 0} clues</p>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Leaderboard</h3>
            {leaderboard.length > 0 ? (
              <div className="space-y-2">
                {leaderboard.map((player, index) => (
                  <div key={player.id} className="flex justify-between items-center py-2 px-4 bg-white rounded-lg">
                    <span className="font-semibold">
                      #{index + 1} {player.name}
                    </span>
                    <span className="text-gray-600">{player.clues_used} clues</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">Be the first to finish!</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Akinator Bingo</h1>
              <p className="text-gray-600">Room: <span className="font-mono font-bold">{roomCode}</span></p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Target to find:</p>
              <p className="text-xl font-bold text-blue-600">??? (Someone in this room)</p>
              <p className="text-sm text-gray-500">Clues used: {clues.length}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clues Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Clues</h2>
              <button
                onClick={requestClue}
                disabled={isRequestingClue}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition duration-200"
              >
                {isRequestingClue ? 'Generating...' : 'Request Clue'}
              </button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {clues.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Click "Request Clue" to get your first hint!
                </p>
              ) : (
                clues.map((clue, index) => (
                  <div key={clue.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-blue-600">Clue #{index + 1}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(clue.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{clue.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Guess Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Make Your Guess</h2>
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Who do you think it is?
                </label>
                <input
                  type="text"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter player name..."
                />
              </div>

              <button
                onClick={submitGuess}
                disabled={isSubmittingGuess || !guess.trim()}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
              >
                {isSubmittingGuess ? 'Submitting...' : 'Submit Guess'}
              </button>
            </div>

            {/* Current Players */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Players in Room:</h3>
              <div className="grid grid-cols-2 gap-2">
                {players.map(player => (
                  <div
                    key={player.id}
                    className={`p-2 rounded text-sm text-center ${
                      player.found_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {player.name}
                    {player.found_at && ' ✓'}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 