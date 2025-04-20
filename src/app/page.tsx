"use client";

import { useState } from "react";
import Loader from "../components/Loader";
import VideoPlayer from "../components/VideoPlayer";
import { Copy, Check } from "lucide-react";

export default function Home() {
  type MicroformatRenderer = {
    category?: string;
    lengthSeconds?: number;
  };

  type TranscriptData = {
    title: string;
    keywords?: string[];
    tracks?: {
      transcript: {
        start: number;
        text: string;
      }[];
    }[];
    channelId?: string;
    id?: string;
    microformat?: {
      playerMicroformatRenderer?: MicroformatRenderer;
    };
  };

  type TranscriptItem = {
    start: number;
    text: string;
  };
  
  const [videoUrl, setVideoUrl] = useState("");
  const [data, setData] = useState<TranscriptData | null>(null);
  const [summary, setSummary] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const handleSummarize = async () => {
    const videoId = extractVideoId(videoUrl);
    if (!videoId) return alert("Invalid YouTube link");

    setLoading(true);
    setSummary([]);

    try {
      const transcriptRes = await fetch("/api/getTranscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      const transcriptData = await transcriptRes.json();
      setData(transcriptData[0]);


      const transcriptArray = transcriptData?.[0].tracks?.[0].transcript as TranscriptItem[] || [];

      const transcriptText = transcriptArray.map((t) => t.text).join(" ");

      const formattedTranscript = transcriptArray.map((item) => {
        const startSeconds = item.start;
        const minutes = Math.floor(startSeconds / 60);
        const seconds = Math.floor(startSeconds % 60).toString().padStart(2, "0");
        const timestamp = `${minutes}:${seconds}`;
      
        return `[${timestamp}] ${item.text}`;
      });
      //for summarizer logic
      // const summaryRes = await fetch('/api/summarize', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: transcriptText }),
      // });
      // const summaryData = await summaryRes.json();

      // console.log(summaryData.summary);

      //fetch deepseek api
      // const summaryRes = await fetch('/api/deepSeek', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ text: "what is your name?" }),
      // });
      // const summaryData = await summaryRes.json();
      // console.log(summaryData);
      

      setSummary(formattedTranscript);
      console.log(transcriptData);
      
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timeInSecond?: number): string => {
    if (typeof timeInSecond !== "number") return "N/A";
    const minutes = Math.floor(timeInSecond / 60);
    const seconds = timeInSecond % 60;
    return `${minutes}m:${seconds.toString().padStart(2, "0")}s`;
  };

  const handleCopy = (value: string, label: string) => {
    navigator.clipboard.writeText(value);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <>
      <main className="min-h-screen bg-black text-white px-4 py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-3xl text-center">
          <h1 className="text-4xl font-bold mb-4">
            YouTube Transcript and Details Extractor
          </h1>
          <p className="text-gray-400 mb-8">
            Easily convert a YouTube video to transcript, copy and download the
            generated transcript in one click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
            <input
              type="text"
              placeholder="https://youtu.be/9KVG_X_7Naw?si=xyz"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full sm:w-3/4 bg-[#111] text-white border border-gray-700 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
            />
            <button
              onClick={handleSummarize}
              className="w-full sm:w-1/4 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold transition"
            >
              Get Transcript
            </button>
          </div>

          {loading && (
            <div className="mt-6">
              <Loader />
            </div>
          )}

        </div>
          {data && (
            <div className="flex items-center justify-center flex-col md:flex-row w-full max-w-5xl gap-2 ">
              <div className="mt-10 p-4 bg-[#1a1a1a] rounded-lg text-left border border-gray-700 h-[600px] max-h-[600px] overflow-y-auto md:w-1/2">
                <h2 className="text-xl font-semibold mb-2 text-pink-500">
                  📄 Script Output:
                </h2>
                <h3 className="text-xl font-semibold mb-2 text-white w-full text-center mt-4">
                  {data?.title || "Untitled Video"}
                </h3>
                {/* <p className="text-gray-300 whitespace-pre-wrap leading-relaxed ">{summary}</p> */}
                <p className="text-white/80">
                  {summary.map((line, index) => (
                    <span key={index}>
                      {line}
                      <br />
                    </span>
                  ))}
                </p>
              </div>

              <div className="mt-10 py-4 px-[4px] bg-[#1a1a1a] rounded-lg text-left border border-gray-700 h-[600px] max-h-[600px] overflow-y-auto md:w-1/2">
                <h2 className="text-xl font-semibold mb-2 text-pink-500">
                  📄 Video Details:
                </h2>
                {/* <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p> */}
                <div className="flex items-center mb-4">
                  <VideoPlayer id={data?.id} />
                </div>
                <div className="flex items-center justify-center w-full gap-2">
                  <div className="border-[1px] border-white/40 rounded-2xl text-white/90 text-sm px-2 py-1 bg-white/10">
                    {data?.microformat?.playerMicroformatRenderer?.category}
                  </div>
                  <div className="border-[1px] border-white/40 rounded-2xl text-white/90 text-sm px-2 py-1 bg-white/10">
                    {formatTime(
                      data?.microformat?.playerMicroformatRenderer
                        ?.lengthSeconds
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-center w-full flex-col">
                  <div className="flex items-start justify-center flex-col mx-[2px] mb-6 mt-6">
                    <div className="py-[2px] px-[6px] text-sm text-white/80 md:pl-4">
                      Keywords:
                    </div>
                    <div className="flex gap-[4px] flex-wrap justify-center mt-2">
                      {data?.keywords?.map((keyword, idx) => (
                        <div
                          key={idx}
                          className="border-[1px] border-white/40 rounded-full text-white/90 text-sm px-3 py-1"
                        >
                          {keyword}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative w-full flex items-center justify-between px-6 mt-2">
                    {/* Channel ID */}
                    <div className="flex items-center flex-col gap-[2px] cursor-pointer">
                      <div className="py-[2px] px-[6px] text-sm text-white/80">
                        Channel ID:
                      </div>

                      <button
                        onClick={() =>
                          data?.channelId &&
                          handleCopy(data?.channelId, "Channel ID")
                        }
                        className="ml-2 flex items-center justify-center border border-white/40 rounded-lg text-white/90 text-sm px-3 py-1 hover:bg-white/10 transition cursor-pointer"
                      >
                        <div className="max-w-[100px] truncate ">
                          {data?.channelId || "—"}
                        </div>
                        {copied === "Channel ID" ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>

                    {/* Video ID */}
                    <div className="flex items-center flex-col gap-[2px] cursor-pointer">
                      <div className="py-[2px] px-[6px] text-sm text-white/80">
                        Video ID:
                      </div>

                      <button
                        onClick={() =>
                          data?.id && handleCopy(data?.id, "Video ID")
                        }
                        className="ml-2 flex items-center justify-center border border-white/40 rounded-lg text-white/90 text-sm px-3 py-1 hover:bg-white/10 transition cursor-pointer"
                      >
                        <div className="max-w-[100px] truncate">
                          {data?.id || "—"}
                        </div>
                        {copied === "Video ID" ? (
                          <Check size={18} />
                        ) : (
                          <Copy size={18} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
      </main>
    </>
  );
}
