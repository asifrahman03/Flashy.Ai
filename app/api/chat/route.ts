import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import officeParser from 'officeparser';
import { parseDocx } from 'docx-parser';
import { PdfReader } from 'pdfreader';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const text = formData.get('text') as string;
    const file = formData.get('file') as File;

    // Add detailed logging
    console.log('Vercel environment check:', {
      nodeVersion: process.version,
      platform: process.platform,
      env: process.env.NODE_ENV,
      tempDir: process.env.TEMP || process.env.TMP,
    });

    if (file) {
      console.log('File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      });
    }

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
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    switch (file.type) {
      case 'application/pdf':
        return await extractPdfText(buffer);
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return await extractDocxText(buffer);
      
      case 'text/plain':
        return buffer.toString('utf-8').trim();
      
      default:
        // Fallback to officeparser
        return await extractTextFromBuffer(buffer);
    }
  } catch (error) {
    console.error('File processing error:', {
      fileType: file.type,
      fileName: file.name,
      error: error.message
    });
    throw error;
  }
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    let text = '';
    new PdfReader().parseBuffer(buffer, (err, item) => {
      if (err) {
        reject(err);
        return;
      }
      
      // Check if we've reached the end of the PDF
      if (!item) {
        resolve(text.trim());
        return;
      }

      // Only concatenate if item exists and has text property
      if (item && typeof item.text === 'string') {
        text += item.text + ' ';
      }
    });
  });
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  try {
    const result = await parseDocx(buffer);
    return result.text;
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw error;
  }
}

async function extractTextFromBuffer(buffer: Buffer): Promise<string> {
  try {
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('File processing timed out')), 10000);
    });

    const parsePromise = officeParser.parseOfficeAsync(buffer);
    
    const data = await Promise.race([parsePromise, timeoutPromise]);
    
    if (!data) {
      throw new Error('No data extracted from file');
    }

    // Handle different response types
    if (typeof data === 'string') {
      return data.trim();
    } else if (typeof data === 'object') {
      // Some parsers might return an object with text content
      return JSON.stringify(data);
    }

    throw new Error('Unexpected data format from parser');
  } catch (error) {
    console.error('Buffer processing error:', {
      error: error.message,
      stack: error.stack,
      bufferSize: buffer.length
    });
    throw error;
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