// start of ai gen code

"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Square, Download, Music, Disc } from "lucide-react";

// Sound types with their configurations - removed silence option
const SOUNDS = [
  { name: "Kick Drum", file: "kick.mp3", color: "bg-red-400" },
  { name: "Snare", file: "snare.mp3", color: "bg-blue-400" },
  { name: "Hi-Hat", file: "hihat.mp3", color: "bg-green-400" },
  { name: "Clap", file: "clap.mp3", color: "bg-yellow-400" },
  { name: "Piano", file: "piano.mp3", color: "bg-purple-400" },
];

// Import lamejs for MP3 encoding
const importLamejs = async () => {
  // In a real project, you would use a proper import
  // For this demo, we'll load it from a CDN
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js";
  script.async = true;

  return new Promise((resolve, reject) => {
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load lamejs"));
    document.body.appendChild(script);
  });
};

// Declare lamejs as a global variable
declare global {
  interface Window {
    lamejs: any;
  }
}

export default function SoundMachine() {
  const [isRecording, setIsRecording] = useState(false);
  const [volume, setVolume] = useState(80);
  const [recordedSequence, setRecordedSequence] = useState<string[]>([]);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);
  const [recordingFeedback, setRecordingFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Refs for recording
  const recordStartTimeRef = useRef<number>(0);
  const sequenceTimesRef = useRef<number[]>([]);
  const sequenceSoundsRef = useRef<string[]>([]);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const audioBuffersRef = useRef<Record<string, AudioBuffer>>({});
  const audioContextRef = useRef<AudioContext | null>(null);

  // Show error message and clear it after 5 seconds
  const showError = (message: string) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(null), 5000);
  };

  // Preload audio files
  useEffect(() => {
    // Create audio context
    audioContextRef.current = new (window.AudioContext ||
      (window as any).webkitAudioContext)();

    // Clear any existing audio elements
    audioElementsRef.current = [];
    audioBuffersRef.current = {};

    // Preload each sound
    const loadSounds = async () => {
      for (const sound of SOUNDS) {
        try {
          // Create audio element for immediate playback
          const audio = new Audio(`/audio/${sound.file}`);
          audio.preload = "auto";
          audioElementsRef.current.push(audio);

          // Also fetch and decode for Web Audio API usage
          const response = await fetch(`/audio/${sound.file}`);
          const arrayBuffer = await response.arrayBuffer();
          if (audioContextRef.current) {
            const audioBuffer = await audioContextRef.current.decodeAudioData(
              arrayBuffer
            );
            audioBuffersRef.current[sound.file] = audioBuffer;
          }
        } catch (error) {
          console.error(`Failed to load sound: ${sound.file}`, error);
          showError(`Could not load ${sound.file}. Check console for details.`);
        }
      }
    };

    loadSounds();

    // Try to preload lamejs
    importLamejs().catch((err) => {
      console.warn("Could not preload MP3 encoder:", err);
    });

    // Cleanup function
    return () => {
      // Stop all audio and clear timeouts when component unmounts
      audioElementsRef.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });

      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));

      if (
        audioContextRef.current &&
        audioContextRef.current.state !== "closed"
      ) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Play a sound
  const playSound = (sound: (typeof SOUNDS)[0]) => {
    // Set active sound for UI feedback
    setActiveSound(sound.file);
    setTimeout(() => setActiveSound(null), 300); // Reset after 300ms for button animation

    // Find the sound index
    const soundIndex = SOUNDS.findIndex((s) => s.file === sound.file);
    if (soundIndex === -1) return;

    // Create a new audio element for this sound (to allow overlapping sounds)
    const audio = new Audio(`/audio/${sound.file}`);
    audio.volume = volume / 100;

    // Play the sound
    audio.play().catch((err) => {
      console.error("Error playing sound:", err);
      setRecordingFeedback("Error playing sound. Check console for details.");
    });

    // If recording, add this sound to the sequence
    if (isRecording) {
      const currentTime = Date.now();
      const timeSinceStart = currentTime - recordStartTimeRef.current;
      sequenceTimesRef.current.push(timeSinceStart);
      sequenceSoundsRef.current.push(sound.file);
      setRecordedSequence([...sequenceSoundsRef.current]);
      setRecordingFeedback(
        `Added ${sound.name} to sequence (${sequenceSoundsRef.current.length} sounds)`
      );
    }
  };

  // Start recording
  const startRecording = () => {
    setIsRecording(true);
    setRecordingFeedback(
      "Recording started. Press sound buttons to add to sequence."
    );
    recordStartTimeRef.current = Date.now();
    sequenceTimesRef.current = [];
    sequenceSoundsRef.current = [];
    setRecordedSequence([]);
    setRecordedBlob(null);
  };

  // Stop recording and create audio file
  const stopRecording = async () => {
    setIsRecording(false);

    if (sequenceSoundsRef.current.length === 0) {
      setRecordingFeedback("No sounds were recorded.");
      return;
    }

    setRecordingFeedback(
      `Recording stopped. Processing ${sequenceSoundsRef.current.length} sounds...`
    );
    setIsProcessing(true);

    try {
      // Create a new offline audio context for rendering
      const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * 30, // 30 seconds max
        sampleRate: 44100,
      });

      // Calculate total duration needed
      const lastSoundTime =
        sequenceTimesRef.current[sequenceTimesRef.current.length - 1] || 0;
      const maxDuration = Math.max(
        lastSoundTime + 2000, // Add 2 seconds buffer
        sequenceSoundsRef.current.length * 1000 // At least 1 second per sound
      );

      // Schedule all sounds in the sequence
      for (let i = 0; i < sequenceSoundsRef.current.length; i++) {
        const soundFile = sequenceSoundsRef.current[i];
        const timeOffset = sequenceTimesRef.current[i] / 1000; // Convert ms to seconds

        // Get the audio buffer for this sound
        const buffer = audioBuffersRef.current[soundFile];
        if (!buffer) continue;

        // Create source node
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineCtx.destination);
        source.start(timeOffset);
      }

      // Render the audio
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert to MP3 using lamejs
      try {
        await importLamejs();

        // Convert AudioBuffer to MP3
        const mp3Blob = await audioBufferToMp3(renderedBuffer);
        setRecordedBlob(mp3Blob);
        setRecordingFeedback(
          `Recording complete! ${sequenceSoundsRef.current.length} sounds captured.`
        );
      } catch (err) {
        console.error("MP3 encoding failed:", err);

        // Fallback to WAV if MP3 encoding fails
        const wavBlob = audioBufferToWav(renderedBuffer);
        setRecordedBlob(wavBlob);
        setRecordingFeedback(
          `Recording complete! (WAV format - MP3 encoding failed)`
        );
        showError(
          "MP3 encoding failed. Your recording will be saved as a WAV file instead."
        );
      }
    } catch (err) {
      console.error("Error creating recording:", err);
      setRecordingFeedback(
        "Failed to create recording. Your browser may not support the required features."
      );
      showError("Could not create audio recording. Try a different browser.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Convert AudioBuffer to MP3 Blob using lamejs
  const audioBufferToMp3 = async (buffer: AudioBuffer): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      try {
        // @ts-ignore - lamejs is loaded via script tag
        if (typeof window.lamejs === "undefined") {
          throw new Error("MP3 encoder not available");
        }

        // Get the left channel data
        const samples = buffer.getChannelData(0);

        // Convert float32 to int16
        const sampleCount = samples.length;
        const left = new Int16Array(sampleCount);
        const right = new Int16Array(sampleCount);

        for (let i = 0; i < sampleCount; i++) {
          // Convert float32 to int16
          left[i] =
            samples[i] < 0
              ? Math.max(-32768, Math.floor(samples[i] * 32768))
              : Math.min(32767, Math.floor(samples[i] * 32767));

          // If stereo, get right channel, otherwise duplicate left
          if (buffer.numberOfChannels > 1) {
            right[i] =
              buffer.getChannelData(1)[i] < 0
                ? Math.max(
                    -32768,
                    Math.floor(buffer.getChannelData(1)[i] * 32768)
                  )
                : Math.min(
                    32767,
                    Math.floor(buffer.getChannelData(1)[i] * 32767)
                  );
          } else {
            right[i] = left[i];
          }
        }

        // Initialize MP3 encoder
        // @ts-ignore - lamejs is loaded via script tag
        const mp3encoder = new window.lamejs.Mp3Encoder(
          2,
          buffer.sampleRate,
          128
        );
        const mp3Data = [];

        // Encode in chunks to avoid stack overflow
        const chunkSize = 1152;
        for (let i = 0; i < sampleCount; i += chunkSize) {
          const leftChunk = left.subarray(i, i + chunkSize);
          const rightChunk = right.subarray(i, i + chunkSize);
          const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
          if (mp3buf.length > 0) {
            mp3Data.push(mp3buf);
          }
        }

        // Finalize the MP3
        const end = mp3encoder.flush();
        if (end.length > 0) {
          mp3Data.push(end);
        }

        // Create blob from all chunks
        const blob = new Blob(mp3Data, { type: "audio/mp3" });
        resolve(blob);
      } catch (err) {
        reject(err);
      }
    });
  };

  // Convert AudioBuffer to WAV Blob (fallback)
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const numOfChan = buffer.numberOfChannels;
    const length = buffer.length * numOfChan * 2;
    const result = new Uint8Array(44 + length);

    // RIFF identifier
    result.set([82, 73, 70, 70]); // "RIFF"

    // file length
    const dv = new DataView(result.buffer);
    dv.setUint32(4, 36 + length, true);

    // WAVE identifier
    result.set([87, 65, 86, 69], 8); // "WAVE"

    // format chunk identifier
    result.set([102, 109, 116, 32], 12); // "fmt "

    // format chunk length
    dv.setUint32(16, 16, true);

    // sample format (raw)
    dv.setUint16(20, 1, true);

    // channel count
    dv.setUint16(22, numOfChan, true);

    // sample rate
    dv.setUint32(24, buffer.sampleRate, true);

    // byte rate (sample rate * block align)
    dv.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);

    // block align (channel count * bytes per sample)
    dv.setUint16(32, numOfChan * 2, true);

    // bits per sample
    dv.setUint16(34, 16, true);

    // data chunk identifier
    result.set([100, 97, 116, 97], 36); // "data"

    // data chunk length
    dv.setUint32(40, length, true);

    // Write the PCM samples
    let offset = 44;
    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      for (let j = 0; j < channelData.length; j++, offset += 2) {
        const sample = Math.max(-1, Math.min(1, channelData[j]));
        const int16 = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
        dv.setInt16(offset, int16, true);
      }
    }

    return new Blob([result], { type: "audio/wav" });
  };

  // Play back the recorded sequence
  const playRecordedSequence = () => {
    if (isPlaying || sequenceSoundsRef.current.length === 0) return;

    setIsPlaying(true);
    setRecordingFeedback("Playing sequence...");

    // Clear any existing timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];

    // Play each sound in the sequence at the recorded times
    sequenceSoundsRef.current.forEach((soundFile, index) => {
      const sound = SOUNDS.find((s) => s.file === soundFile);
      if (!sound) return;

      const timeout = window.setTimeout(() => {
        playSound(sound);
      }, sequenceTimesRef.current[index]);

      timeoutsRef.current.push(timeout);
    });

    // Stop playing after the last sound
    const finalTimeout = window.setTimeout(() => {
      setIsPlaying(false);
      setRecordingFeedback("Playback complete.");
    }, sequenceTimesRef.current[sequenceTimesRef.current.length - 1] + 500);

    timeoutsRef.current.push(finalTimeout);
  };

  // Stop playback
  const stopPlayback = () => {
    setIsPlaying(false);
    setRecordingFeedback("Playback stopped.");

    // Clear all timeouts
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current = [];
  };

  // Download recorded audio
  const downloadRecording = () => {
    if (!recordedBlob) {
      showError("Please record a sequence first.");
      return;
    }

    // Download the audio blob
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;

    // Set the file extension based on the blob type
    const extension = recordedBlob.type.includes("mp3") ? "mp3" : "wav";
    a.download = `sound-sequence.${extension}`;

    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-[68px]">
      <div>
        <h2 className="font-semibold text-slate-800 text-2xl md:text-4xl">
          Sound Machine
        </h2>
      </div>
      <div
        className="bg-slate-50 border border-slate-400 rounded-sm mt-6"
        style={{
          backgroundImage: `radial-gradient(circle, rgb(254, 226, 226) 4px, transparent 4px)`,
          backgroundSize: `12px 12px`,
        }}
      >
        <div className="bg-slate-50 border border-slate-400 m-4 md:m-[40px] rounded-sm min-h-[600px] p-6">
          <div className="flex flex-col space-y-8">
            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {errorMessage}
              </div>
            )}

            {/* Recording Status */}
            {isRecording && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">Recording in progress...</span>
                </div>
                <div className="text-sm">
                  {recordedSequence.length} sounds recorded
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-2 animate-pulse"></div>
                  <span className="font-medium">Processing audio...</span>
                </div>
              </div>
            )}

            {recordingFeedback && !isRecording && !isProcessing && (
              <div className="bg-slate-100 border border-slate-300 text-slate-700 px-4 py-3 rounded">
                {recordingFeedback}
              </div>
            )}

            {/* Sound Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SOUNDS.map((sound) => (
                <button
                  key={sound.file}
                  onClick={() => playSound(sound)}
                  className={`${
                    sound.color
                  } text-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center h-32 transition-transform ${
                    activeSound === sound.file ? "scale-95" : "hover:scale-105"
                  }`}
                  disabled={isProcessing}
                >
                  <div className="text-3xl mb-2">
                    <Music size={32} />
                  </div>
                  <div className="font-medium">{sound.name}</div>
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-slate-100 p-6 rounded-lg shadow-sm">
              <div className="flex flex-col space-y-6">
                {/* Volume Control */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">Volume</label>
                    <span className="text-xs text-slate-500">{volume}%</span>
                  </div>
                  <Slider
                    value={[volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(value) => setVolume(value[0])}
                  />
                </div>

                {/* Recording Controls */}
                <div className="flex flex-wrap gap-4">
                  {isRecording ? (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      <Square className="mr-2 h-4 w-4" /> Stop Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={startRecording}
                      className="bg-red-400 hover:bg-red-500 flex-1"
                      disabled={isProcessing}
                    >
                      <Disc className="mr-2 h-4 w-4" /> Start Recording
                    </Button>
                  )}

                  {recordedSequence.length > 0 && !isRecording && (
                    <>
                      {isPlaying ? (
                        <Button
                          onClick={stopPlayback}
                          variant="outline"
                          className="flex-1"
                          disabled={isProcessing}
                        >
                          <Square className="mr-2 h-4 w-4" /> Stop Playback
                        </Button>
                      ) : (
                        <Button
                          onClick={playRecordedSequence}
                          variant="outline"
                          className="flex-1"
                          disabled={isProcessing}
                        >
                          <Play className="mr-2 h-4 w-4" /> Play Sequence
                        </Button>
                      )}
                    </>
                  )}

                  {recordedSequence.length > 0 && !isRecording && (
                    <Button
                      onClick={downloadRecording}
                      className="bg-green-500 hover:bg-green-600 flex-1"
                      disabled={isProcessing || !recordedBlob}
                    >
                      <Download className="mr-2 h-4 w-4" /> Download Recording
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Recorded Sequence Display */}
            {recordedSequence.length > 0 && (
              <div className="bg-slate-100 p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-4">Recorded Sequence</h3>
                <div className="flex flex-wrap gap-2">
                  {recordedSequence.map((soundFile, index) => {
                    const sound = SOUNDS.find((s) => s.file === soundFile);
                    return (
                      <div
                        key={index}
                        className={`px-3 py-1 rounded text-white text-sm ${
                          sound?.color || "bg-slate-400"
                        }`}
                      >
                        {sound?.name || "Unknown"}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Audio Preview */}
            {recordedBlob && (
              <div className="bg-slate-100 p-6 rounded-lg shadow-sm">
                <h3 className="font-medium mb-4">Preview Recording</h3>
                <audio
                  controls
                  src={URL.createObjectURL(recordedBlob)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div>
        <p className="text-xl md:text-[28px] font-medium mt-6">
          This sound machine lets you create music by sequencing different
          sounds like drums, snares, and piano notes. Press "Start Recording"
          and then tap the sound buttons in the order you want them to play.
          Each button press adds that sound to your sequence. When you're done,
          press "Stop Recording" to combine all sounds into a single MP3 file
          that you can download and share.
        </p>
      </div>
    </div>
  );
}

// end of ai gen code
