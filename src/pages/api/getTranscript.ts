import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { videoId } = req.body;

  try {
    const response = await fetch('https://www.youtube-transcript.io/api/transcripts', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${process.env.RAPID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids: [videoId] }),
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error('Transcript fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch transcript.' });
  }
}