import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    // For now, return the fallback questions
    // In production, you could integrate with OpenAI API here using Deno.env.get('OPENAI_API_KEY')
    
    const questions = [
      { question: "What's your favorite way to spend a weekend?", category: "lifestyle" },
      { question: "If you could have dinner with any historical figure, who would it be?", category: "personality" },
      { question: "What's the most unusual food you've ever tried and enjoyed?", category: "food" },
      { question: "Do you prefer mountains or beaches for vacation?", category: "travel" },
      { question: "What's a skill you'd love to learn if you had unlimited time?", category: "interests" },
      { question: "Are you more of a morning person or night owl?", category: "lifestyle" },
      { question: "What's your go-to comfort activity when stressed?", category: "personality" },
      { question: "If you could live in any time period, which would you choose?", category: "preferences" },
      { question: "What's something you're passionate about that might surprise people?", category: "interests" },
      { question: "Do you prefer big social gatherings or intimate small groups?", category: "personality" }
    ]

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}) 