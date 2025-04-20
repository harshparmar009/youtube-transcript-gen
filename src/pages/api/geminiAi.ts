import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenAI } from '@google/genai';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // const { text } = req.body;

  // if (!text || typeof text !== 'string') {
  //   return res.status(400).json({ error: 'Text is required and must be a string.' });
  // }

  try {
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const model = 'gemini-2.5-pro-preview-03-25';

    const config = {
      responseMimeType: 'text/plain',
    };

    const contents = [
      {
        role: 'user',
        parts: [{ text: 'what is your name' }],
      },
    ];

    const stream = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let fullText = '';

    for await (const chunk of stream) {
      const part = chunk.candidates?.[0]?.content?.parts?.[0]?.text || '';
      fullText += part;
    }

    return res.status(200).json({ message: fullText || 'No response' });
  } catch (error: any) {
    console.error('Gemini API Error:', error.message || error);
    return res.status(500).json({
      error: error.message || 'Something went wrong',
    });
  }
}