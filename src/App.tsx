import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import RoomManager from './components/RoomManager'
import QuestionCollection from './components/QuestionCollection'
import WaitingRoom from './components/WaitingRoom'
import GameBoard from './components/GameBoard'
import './App.css'

type GameState = 'lobby' | 'collecting' | 'waiting' | 'playing'

function App() {
  const [gameState, setGameState] = useState<GameState>('lobby')
  const [roomId, setRoomId] = useState<string>('')
  const [playerId, setPlayerId] = useState<string>('')
  const [roomCode, setRoomCode] = useState<string>('')

  // Check if player was already in a game (page refresh handling)
  useEffect(() => {
    const savedPlayerId = localStorage.getItem('playerId')
    const savedRoomId = localStorage.getItem('roomId')
    const savedRoomCode = localStorage.getItem('roomCode')

    if (savedPlayerId && savedRoomId && savedRoomCode) {
      setPlayerId(savedPlayerId)
      setRoomId(savedRoomId)
      setRoomCode(savedRoomCode)
      
      // Check current room status and player state
      checkPlayerState(savedRoomId, savedPlayerId)
    }
  }, [])

  const checkPlayerState = async (roomId: string, playerId: string) => {
    try {
      // Get room status
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('id', roomId)
        .single()

      if (roomError || !room) {
        // Room doesn't exist, reset to lobby
        resetToLobby()
        return
      }

      // Get player data
      const { data: player, error: playerError } = await supabase
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()

      if (playerError || !player) {
        // Player doesn't exist, reset to lobby
        resetToLobby()
        return
      }

      // Determine game state based on room status and player data
      if (room.status === 'waiting') {
        if (!player.answers || Object.keys(player.answers).length === 0) {
          setGameState('collecting')
        } else {
          setGameState('waiting')
        }
      } else if (room.status === 'playing') {
        setGameState('playing')
      } else {
        setGameState('waiting')
      }

      setRoomCode(room.room_code)
    } catch (error) {
      console.error('Error checking player state:', error)
      resetToLobby()
    }
  }

  const resetToLobby = () => {
    localStorage.removeItem('playerId')
    localStorage.removeItem('roomId')
    localStorage.removeItem('roomCode')
    localStorage.removeItem('playerName')
    setGameState('lobby')
    setRoomId('')
    setPlayerId('')
    setRoomCode('')
  }

  const handleRoomJoined = (newRoomId: string, newPlayerId: string) => {
    setRoomId(newRoomId)
    setPlayerId(newPlayerId)
    
    // Save to localStorage for persistence
    localStorage.setItem('roomId', newRoomId)
    localStorage.setItem('playerId', newPlayerId)
    
    // Get room code and start collecting answers
    getRoomCode(newRoomId)
    setGameState('collecting')
  }

  const getRoomCode = async (roomId: string) => {
    const { data: room } = await supabase
      .from('rooms')
      .select('room_code')
      .eq('id', roomId)
      .single()
    
    if (room) {
      setRoomCode(room.room_code)
      localStorage.setItem('roomCode', room.room_code)
    }
  }

  const handleQuestionsCompleted = () => {
    setGameState('waiting')
  }

  const handleGameStarted = () => {
    setGameState('playing')
  }

  return (
    <div className="App">
      {gameState === 'lobby' && (
        <RoomManager onRoomJoined={handleRoomJoined} />
      )}
      
      {gameState === 'collecting' && (
        <QuestionCollection
          roomId={roomId}
          playerId={playerId}
          onQuestionsCompleted={handleQuestionsCompleted}
        />
      )}
      
      {gameState === 'waiting' && (
        <WaitingRoom
          roomId={roomId}
          playerId={playerId}
          roomCode={roomCode}
          onGameStarted={handleGameStarted}
        />
      )}
      
      {gameState === 'playing' && (
        <GameBoard
          roomId={roomId}
          playerId={playerId}
          roomCode={roomCode}
        />
      )}
    </div>
  )
}

export default App
