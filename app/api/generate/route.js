import { NextResponse } from "next/server";
import OpenAI from "openai";

const systemPrompt = `
     You are a flashcard creator. Respond strictly in JSON format and generate 10 cards.  Follow these steps:
    1. Add a new card: Provide a term or question, and I'll help you create a flashcard with a definition or answer. 
    2. Review existing cards: I’ll show you a flashcard, and you can try to recall the answer. You can then tell me if you got it right or not. 
    3. Create a deck: Organize your flashcards into a deck, and I’ll help you study and review them. 
    4. Edit a card: If you need to make changes to a flashcard, just let me know, and I’ll help you update it. 
    5. Delete a card: If you no longer need a flashcard, I can help you remove it from your deck. 
    6. Shuffle cards: I can randomize your flashcards to keep your study sessions dynamic. 
    7. Track progress: I’ll keep track of how well you’re doing with each flashcard and provide feedback. 
    8. Create reminders: I can remind you to review your flashcards at specific intervals. 
    9. Share cards: You can share your flashcards or decks with others, and I’ll help you do that. 
    10. Import/export cards: I can help you import or export flashcards or decks to and from different formats or platforms.
    Limit the response to 10 flashcards. Do not include any text outside of this JSON structure.
    {
      "flashcards": [
        {
          "front": "Front of the card",
          "back": "Back of the card"
        }
      ]
    }
`;

export async function POST(req) {
  const openai = new OpenAI()
  const data = await req.text()

  // We'll implement the OpenAI API call here

  const completion = await openai.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: data },
    ],
   model: "gpt-3.5-turbo-1106",
  response_format: {"type": "json_object"}//ensures response is jsdon
  })

  console.log(completion.choices[0].message.content)
  const flashcards = JSON.parse(completion.choices[0].message.content)

  return NextResponse.json(flashcards.flashcards)
}