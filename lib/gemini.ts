import { GoogleGenerativeAI } from '@google/generative-ai'
import type { WeddingContext } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-latest',
})

export function buildNudgePrompt(context: WeddingContext): string {
  const today = new Date().toISOString().split('T')[0]
  return `You are a wedding planning assistant for a Pakistani wedding with 3 events:
Nikkah (Dec 18), Shaadi (Dec 20), and Valima (Dec 22), all in 2026.
Today is ${today}. There are ${context.daysRemaining} days until the Shaadi.

Wedding planning state:
${JSON.stringify(context, null, 2)}

Generate exactly 3 short, specific nudges about what needs attention right now.
Rules:
- Be direct and specific. Name the actual missing thing.
- Each nudge must be under 20 words.
- Categorize each as: "warning" (urgent/missing), "info" (upcoming), or "ok" (on track).
- Respond ONLY with a JSON array: [{ "text": "...", "type": "warning"|"info"|"ok" }]
- No markdown, no preamble, just the JSON array.`
}

export function buildChatSystemPrompt(context: WeddingContext): string {
  return `You are a wedding planning assistant for a Pakistani desi wedding.
The couple is getting married across 3 events in December 2026.

Current planning state:
${JSON.stringify(context, null, 2)}

Rules:
- Answer conversationally and specifically. Reference their actual data when relevant.
- You understand Pakistani wedding culture: Nikkah, Shaadi, Barat, Valima, mehndi,
  dholki, sherwani, lehenga, gharara, waleema — use these terms naturally.
- If asked about vendors, remind them to save vendors they find to their Vendor Board.
- You do NOT browse the internet. Work only with what's in the planning state above.
- Keep responses concise unless the question requires detail.
- For budget questions, use PKR unless the user says otherwise.`
}
