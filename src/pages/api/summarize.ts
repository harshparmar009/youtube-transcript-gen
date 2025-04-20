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


// import type { NextApiRequest, NextApiResponse } from 'next';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   const { text } = req.body;

//   if (!text || typeof text !== 'string') {
//     return res.status(400).json({ error: 'Text is required and must be a string.' });
//   }

//   try {
//     const response = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       store: true,
//       messages: [
//         {
//           role: 'user',
//           content: `Summarize and format this YouTube transcript into a clean script format:\n\n${text}`,
//         },
//       ],

//       // model: 'gpt-3.5-turbo', // or "gpt-3.5-turbo" if you prefer,
//       // messages: [
//       //   {
//       //     role: 'user',
//       //     content: `Summarize and format this YouTube transcript into a clean script format:\n\n${text}`,
//       //   },
//       // ],
//       // temperature: 0.7,
//     });

//     // response.then((result) => console.log(result.choices[0].message));

//     console.log(response.choices[0].message);
    
//     const summary = response.choices[0].message?.content || '';

//     return res.status(200).json({ summary });
//   } catch (error: any) {
//     console.error('OpenAI API Error:', error.message || error);
//     return res.status(500).json({ error: error.message || 'Something went wrong' });
//   }
// }
