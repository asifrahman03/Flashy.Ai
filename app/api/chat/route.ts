import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import officeParser from 'officeparser';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;

    console.log('Received request:', { hasText: !!text, hasFile: !!file });

    if (!text && !file) {
      return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
    }

    let content = '';
    if (file) {
      console.log('Processing file:', file.name, file.type);
      content = await extractTextFromFile(file);
    } else {
      content = text.trim();
    }

    if (!content) {
      return NextResponse.json({ error: 'No content to process' }, { status: 400 });
    }

    console.log('Content length:', content.length);
    console.log('Content preview:', content.substring(0, 100) + '...');

    const flashcards = await generateFlashcards(content);

    if (!flashcards || flashcards.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate flashcards. Please try with different content.' 
      }, { status: 404 });
    }

    // Validate flashcard format
    const validFlashcards = flashcards.filter(card => 
      card.front && card.front.trim() && 
      card.back && card.back.trim()
    );

    if (validFlashcards.length === 0) {
      return NextResponse.json({ 
        error: 'Generated flashcards were invalid. Please try again.' 
      }, { status: 422 });
    }

    return NextResponse.json({ flashcards: validFlashcards });
  } catch (error) {
    console.error('Error in POST handler:', error);
    return NextResponse.json({ 
      error: 'An error occurred while generating flashcards: ' + error.message 
    }, { status: 500 });
  }
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    if (!file.size) {
      throw new Error('File is empty');
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Handle text files directly
    if (file.type === 'text/plain') {
      return buffer.toString('utf-8');
    }
    
    return await extractTextFromBuffer(buffer);
  } catch (error) {
    console.error('Error extracting text from file:', error);
    throw new Error(`Failed to process file: ${error.message}`);
  }
}

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await officeParser.parseOfficeAsync(buffer);
    if (!data || typeof data !== 'string') {
      throw new Error('Invalid text extraction result');
    }
    return data.trim();
  } catch (error) {
    console.error('Error extracting text from buffer:', error);
    throw new Error('Failed to extract text from file');
  }
}

async function generateFlashcards(text: string): Promise<{ front: string; back: string }[]> {
  try {
    const prompt = `
Create 10 flashcards from the following content. Format as JSON array of objects with 'front' and 'back' properties.
Each flashcard should have a clear question on the front and a concise answer on the back.
Make the flashcards specific and focused on key concepts.

Content: ${text.substring(0, 4000)} // Limit content length to avoid token limits

Expected format:
[
  {
    "front": "What is...",
    "back": "It is..."
  }
]`;

    const response = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a flashcard generator. Respond only with properly formatted JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No content generated');
    }

    // Parse JSON response
    try {
      const flashcards = JSON.parse(content);
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
      return flashcards;
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid flashcard format returned');
    }
  } catch (error) {
    console.error('Error in generateFlashcards:', error);
    throw error;
  }
}
// import { NextResponse } from 'next/server';
// import Groq from 'groq-sdk';
// import officeParser from 'officeparser';

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// export async function POST(request: Request) {
//   try {
//     const formData = await request.formData();
//     const text = formData.get('text') as string;
//     const file = formData.get('file') as File;

//     console.log('Received request:', { text: !!text, file: !!file });

//     if (!text && !file) {
//       return NextResponse.json({ error: 'No text or file provided' }, { status: 400 });
//     }

//     let content;
//     if (file) {
//       console.log('Processing file:', file.name, file.type);
//       content = await extractTextFromFile(file);
//     } else {
//       content = text;
//     }

//     console.log('Content to generate flashcards from:', content.substring(0, 100) + '...');

//     const flashcards = await generateFlashcards(content);

//     if (flashcards.length === 0) {
//       return NextResponse.json({ error: 'No flashcards were generated' }, { status: 404 });
//     }

//     return NextResponse.json({ flashcards });
//   } catch (error) {
//     console.error('Error in POST handler:', error);
//     return NextResponse.json({ error: 'Failed to generate flashcards: ' + error.message }, { status: 500 });
//   }
// }

// async function extractTextFromFile(file: File): Promise<string> {
//   try {
//     console.log('Extracting text from file:', file.name, file.type);
//     const arrayBuffer = await file.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
//     return extractTextFromBuffer(buffer);
//   } catch (error) {
//     console.error('Error in extractTextFromFile:', error);
//     throw error;
//   }
// }

// async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
//   try {
//     console.log('Extracting text from buffer...');
//     const data = await officeParser.parseOfficeAsync(buffer);
//     console.log('Extraction successful, data length:', data.length);
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