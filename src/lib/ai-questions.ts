import { supabase } from './supabase'

export const AI_QUESTION_PROMPT = `
You are creating personalized questions for an Akinator-style guessing game. Generate exactly 10 unique, diverse questions that will help other players identify this person. 

GUIDELINES:
- Questions should cover different categories: hobbies, preferences, experiences, lifestyle, personality traits
- Make questions specific enough to be distinctive but not too personal or invasive
- Avoid questions about physical appearance, sensitive topics, or private information
- Focus on interests, activities, choices, and opinions that make someone unique
- Questions should be answerable with short, descriptive responses
- Mix different types: favorites, experiences, habits, preferences, opinions

QUESTION CATEGORIES TO INCLUDE:
1. Hobbies & Interests (2-3 questions)
2. Food & Entertainment Preferences (2 questions) 
3. Lifestyle & Habits (2 questions)
4. Experiences & Travel (1-2 questions)
5. Personality & Values (1-2 questions)
6. Fun & Creative (1 question)

EXAMPLE QUESTIONS:
- "What's your favorite way to spend a weekend?"
- "If you could have dinner with any historical figure, who would it be?"
- "What's the most unusual food you've ever tried and enjoyed?"
- "Do you prefer mountains or beaches for vacation?"
- "What's a skill you'd love to learn if you had unlimited time?"
- "Are you more of a morning person or night owl?"
- "What's your go-to comfort activity when stressed?"
- "If you could live in any time period, which would you choose?"
- "What's something you're passionate about that might surprise people?"
- "Do you prefer big social gatherings or intimate small groups?"

Return exactly 10 questions as a JSON array of strings. Do not include any other text or formatting.
`

export interface AIQuestion {
  question: string
  category: string
}

export async function generatePersonalizedQuestions(): Promise<AIQuestion[]> {
  try {
    // Call Supabase Edge Function for secure question generation
    const { data, error } = await supabase.functions.invoke('generate-questions')
    
    if (error) {
      console.warn('Edge function failed, using fallback questions:', error)
      return getFallbackQuestions()
    }
    
    return data.questions || getFallbackQuestions()
  } catch (err) {
    console.warn('Question generation failed, using fallback:', err)
    return getFallbackQuestions()
  }
}

function getFallbackQuestions(): AIQuestion[] {
  // This is a fallback set of questions if Edge Function is not available
  return [
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
}

export async function generateClue(playerAnswers: Record<string, string>, clueNumber: number): Promise<string> {
  try {
    // Call Supabase Edge Function for secure clue generation
    const { data, error } = await supabase.functions.invoke('generate-clue', {
      body: { playerAnswers, clueNumber }
    })
    
    if (error) {
      console.warn('Edge function failed, using fallback clue:', error)
      return getFallbackClue(clueNumber)
    }
    
    return data.clue || getFallbackClue(clueNumber)
  } catch (err) {
    console.warn('Clue generation failed, using fallback:', err)
    return getFallbackClue(clueNumber)
  }
}

function getFallbackClue(clueNumber: number): string {
  const clues = [
    "This person has shared some interesting preferences about their lifestyle.",
    "Looking at their answers, they have some unique hobbies and interests.",
    "Their personality shines through in how they approach social situations.",
    "They have some distinctive food and entertainment preferences.",
    "Their travel and experience choices reveal something about their character.",
    "There's something specific about their daily habits that stands out.",
    "Their choice of historical dinner companion is quite telling.",
    "The skill they want to learn gives insight into their aspirations.",
    "Their comfort activities reveal their true personality.",
    "The time period they'd choose to live in shows their values."
  ]
  
  return clues[Math.min(clueNumber - 1, clues.length - 1)] || "This person is quite unique in their own way!"
} 