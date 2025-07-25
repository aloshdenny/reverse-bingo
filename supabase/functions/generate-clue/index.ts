import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { playerAnswers, clueNumber } = await req.json()

    // Validate input
    if (!playerAnswers || typeof clueNumber !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Missing playerAnswers or clueNumber' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate clue based on answers and clue number
    const clue = generateClueFromAnswers(playerAnswers, clueNumber)

    return new Response(
      JSON.stringify({ clue }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function generateClueFromAnswers(answers: Record<string, string>, clueNumber: number): string {
  const answerEntries = Object.entries(answers)
  
  if (answerEntries.length === 0) {
    return "This person has shared some interesting information about themselves."
  }

  // Progressive clue revelation strategy
  const clueStrategies = [
    // Clue 1: Very general
    () => "This person has shared some fascinating insights about their personality and lifestyle.",
    
    // Clue 2: Category hint
    () => {
      const categories = ["weekend activities", "food preferences", "travel interests", "hobbies", "personality traits"]
      const randomCategory = categories[Math.floor(Math.random() * categories.length)]
      return `This person has some unique preferences when it comes to ${randomCategory}.`
    },
    
    // Clue 3: Vague answer reference
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      const words = randomAnswer[1].toLowerCase().split(' ')
      const keyWord = words.find(word => word.length > 4) || words[0]
      return `Something about "${keyWord}" is particularly interesting in their answers.`
    },
    
    // Clue 4: More specific category
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      const question = randomAnswer[0].toLowerCase()
      
      if (question.includes('weekend')) {
        return "Their weekend preferences reveal something distinctive about their lifestyle."
      } else if (question.includes('food') || question.includes('eat')) {
        return "Their food choices show an adventurous or particular taste."
      } else if (question.includes('travel') || question.includes('vacation')) {
        return "Their travel preferences give insight into their ideal environment."
      } else if (question.includes('skill') || question.includes('learn')) {
        return "There's a skill they'd love to develop that reflects their interests."
      } else if (question.includes('time period') || question.includes('historical')) {
        return "Their choice of time period or historical figure is quite revealing."
      } else {
        return "One of their personality traits really stands out from their answers."
      }
    },
    
    // Clue 5: Partial answer reveal
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      const answer = randomAnswer[1]
      const words = answer.split(' ')
      
      if (words.length > 3) {
        const partialAnswer = words.slice(0, Math.ceil(words.length / 2)).join(' ')
        return `They mentioned something about "${partialAnswer}..." in their responses.`
      } else {
        return `One of their answers includes the word "${words[0]}".`
      }
    },
    
    // Clue 6: More specific
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      const answer = randomAnswer[1]
      return `They specifically mentioned: "${answer.slice(0, Math.min(30, answer.length))}${answer.length > 30 ? '...' : ''}"`
    },
    
    // Clue 7: Direct quote
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      return `They answered: "${randomAnswer[1]}"`
    },
    
    // Clue 8+: Full answers
    () => {
      const randomAnswer = answerEntries[Math.floor(Math.random() * answerEntries.length)]
      return `Question: "${randomAnswer[0]}" - Their answer: "${randomAnswer[1]}"`
    }
  ]

  const strategyIndex = Math.min(clueNumber - 1, clueStrategies.length - 1)
  return clueStrategies[strategyIndex]()
} 