import { NextResponse } from 'next/server';
import { generateObject } from 'ai';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';
import officeParser from 'officeparser';

// You can specify the maximum duration for the function if needed (Vercel specific)
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;

    if (!text && !file) {
      return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
    }

    const content = text || await extractTextFromFile(file);
    console.log('Content to generate flashcards from:', content);

    const flashcards = await generateFlashcards(content);

    if (flashcards.length === 0) {
      return NextResponse.json({ error: 'No flashcards were generated' }, { status: 404 });
    }

    return NextResponse.json({ flashcards });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return extractTextFromBuffer(buffer);
}

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    console.log('Extracting text from buffer...');
    const data = await officeParser.parseOfficeAsync(buffer);
    console.log('Extraction successful:', data);
    return data;
  } catch (error) {
    console.error('Error extracting text from buffer:', error);
    throw new Error('Failed to extract text from file');
  }
}

async function generateFlashcards(text: string): Promise<{ front: string; back: string }[]> {
  try {
    console.log('Generating flashcards for text:', text);
    
    // Use generateObject to force the AI to return a strictly typed JSON array
    const { object } = await generateObject({
      // Using the versatile model from your reference, as it handles structured data excellently
      model: groq('llama-3.3-70b-versatile'), 
      schema: z.object({
        flashcards: z.array(z.object({
          front: z.string().describe('The question to display on the front of the flashcard'),
          back: z.string().describe('The accurate answer to display on the back'),
        })),
      }),
      prompt: `Generate exactly 10 high-quality flashcards summarizing the core concepts of the following topic.\n\nTopic: ${text}`,
    });

    console.log('Generated flashcards:', object.flashcards);
    return object.flashcards;
    
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error;
  }
}
// import { NextResponse } from 'next/server';
// import { groq } from '@ai-sdk/groq';
// import officeParser from 'officeparser';

// // const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const text = formData.get('text') as string;
//     const file = formData.get('file') as File;

//     if (!text && !file) {
//       return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
//     }

//     const content = text || await extractTextFromFile(file);
//     console.log('Content to generate flashcards from:', content);

//     const flashcards = await generateFlashcards(content);

//     if (flashcards.length === 0) {
//       return NextResponse.json({ error: 'No flashcards were generated' }, { status: 404 });
//     }

//     return NextResponse.json({ flashcards });
//   } catch (error) {
//     console.error('Error in POST handler:', error);
//     return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
//   }
// }

// async function extractTextFromFile(file: File): Promise<string> {
//   const arrayBuffer = await file.arrayBuffer();
//   const buffer = Buffer.from(arrayBuffer);
//   return extractTextFromBuffer(buffer);
// }

// async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
//   try {
//     console.log('Extracting text from buffer...');
//     const data = await officeParser.parseOfficeAsync(buffer);
//     console.log('Extraction successful:', data);
//     return data;
//   } catch (error) {
//     console.error('Error extracting text from buffer:', error);
//     throw new Error('Failed to extract text from file');
//   }
// }

// async function generateFlashcards(text: string): Promise<{ front: string; back: string }[]> {
//   try {
//     console.log('Generating flashcards for text:', text);
//     const response = await groq.chat.completions.create({
//       messages: [
//         {
//           role: 'user',
//           content: `Generate 10 flashcards about the following topic. Each flashcard should have a question on the front and an answer on the back. Format each flashcard as follows: "Question: [Question Text] Answer: [Answer Text]".\n\nTopic: ${text}`,
//         },
//       ],
//       model: 'llama3-8b-8192',
//     });

//     console.log('AI Response:', response.choices[0]?.message?.content);

//     const flashcards = response.choices.flatMap(choice => {
//       const content = choice.message.content.trim();
//       if (!content) return [];

//       return content.split('\n').reduce((acc, line) => {
//         const questionMatch = line.match(/^Question:\s*(.*)/);
//         const answerMatch = line.match(/^Answer:\s*(.*)/);

//         if (questionMatch) {
//           acc.push({ front: questionMatch[1].trim(), back: '' });
//         } else if (answerMatch && acc.length > 0) {
//           acc[acc.length - 1].back = answerMatch[1].trim();
//         }

//         return acc;
//       }, [] as { front: string; back: string }[]);
//     });

//     console.log('Generated flashcards:', flashcards);
//     return flashcards;
//   } catch (error) {
//     console.error('Error generating flashcards:', error);
//     throw error;
//   }
// }