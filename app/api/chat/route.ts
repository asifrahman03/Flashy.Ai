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
Generate 10 flashcards from the following content. Your response must be a valid JSON array of objects.
Each object should have exactly two fields: "front" for the question and "back" for the answer.
Do not include any other text or explanation in your response, only the JSON array.

Content: ${text.substring(0, 4000)}

Example format:
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
          content: 'You are a flashcard generator that only outputs valid JSON arrays containing flashcard objects with "front" and "back" fields. Never include any other text in your response.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.5,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error('No content generated');
    }

    // Try to extract JSON if the response contains any extra text
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : content;

    try {
      const flashcards = JSON.parse(jsonStr);
      if (!Array.isArray(flashcards)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each flashcard
      const validFlashcards = flashcards.filter(card => 
        card && 
        typeof card === 'object' &&
        typeof card.front === 'string' &&
        typeof card.back === 'string' &&
        card.front.trim() &&
        card.back.trim()
      );

      if (validFlashcards.length === 0) {
        throw new Error('No valid flashcards in response');
      }

      return validFlashcards;
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid flashcard format returned');
    }
  } catch (error) {
    console.error('Error in generateFlashcards:', error);
    throw error;
  }
}