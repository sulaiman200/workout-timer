//final update

//SECOND UPDATE
import React, { useState, useEffect, useRef } from 'react';

// Define the type for the color themes and tracks
interface Theme {
  from: string;
  to: string;
}

interface Track {
  name: string;
  file: File;
  url: string;
}

const colorThemes: Theme[] = [
  { from: 'from-blue-400', to: 'to-purple-500' },
  { from: 'from-green-400', to: 'to-blue-600' },
  { from: 'from-yellow-300', to: 'to-red-500' },
];

const App: React.FC = () => {
  const [workTime, setWorkTime] = useState<number>(30);  // Time for each rep (seconds)
  const [restTime, setRestTime] = useState<number>(10);  // Rest time between reps (seconds)
  const [isWorking, setIsWorking] = useState<boolean>(true);  // Work or rest phase
  const [timeLeft, setTimeLeft] = useState<number>(workTime);  // Timer countdown
  const [isRunning, setIsRunning] = useState<boolean>(false);  // Timer state (running/paused)
  const [theme, setTheme] = useState<Theme>(colorThemes[0]);  // Theme color
  const [tracks, setTracks] = useState<Track[]>([]);  // Playlist tracks
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);  // Currently playing track index
  const audioRef = useRef<HTMLAudioElement | null>(null);  // Reference to the audio element

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      if (isWorking) {
        setTimeLeft(restTime); // Switch to rest time
      } else {
        setTimeLeft(workTime); // Switch back to work time
      }
      setIsWorking(!isWorking);  // Toggle between work/rest phases
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isWorking, restTime, workTime]);

  // Reset the timer
  const resetTimer = (): void => {
    setIsRunning(false);
    setIsWorking(true);
    setTimeLeft(workTime);
  };

  // Handle file input for adding to the playlist
  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const files = event.target.files;
    if (files) {
      const newTracks: Track[] = Array.from(files).map(file => ({
        name: file.name,
        file: file,
        url: URL.createObjectURL(file)
      }));
      setTracks([...tracks, ...newTracks]);
    }
  };

  // Play the selected track
  const playTrack = (index: number): void => {
    setCurrentTrackIndex(index);
    if (audioRef.current) {
      audioRef.current.src = tracks[index].url;
      audioRef.current.play();
    }
  };

  // Handle play/pause
  const togglePlayPause = (): void => {
    if (audioRef.current) {
      if (audioRef.current.paused) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Play next track
  const playNextTrack = (): void => {
    if (currentTrackIndex !== null && currentTrackIndex < tracks.length - 1) {
      playTrack(currentTrackIndex + 1);
    }
  };

  // Play previous track
  const playPrevTrack = (): void => {
    if (currentTrackIndex !== null && currentTrackIndex > 0) {
      playTrack(currentTrackIndex - 1);
    }
  };

  // Remove a track from the playlist
  const removeTrack = (index: number): void => {
    setTracks(tracks.filter((_, i) => i !== index));
    if (index === currentTrackIndex) {
      setCurrentTrackIndex(null);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-r ${theme.from} ${theme.to} text-white p-4`}>
      <h1 className="text-4xl font-bold mb-8">Workout Timer</h1>

      {/* Timer display */}
      <div className="text-6xl font-mono">
        {isWorking ? 'Work!' : 'Rest!'} - {timeLeft}s
      </div>

      {/* Timer controls */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={resetTimer}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Reset
        </button>
      </div>

      {/* Set work and rest times */}
      <div className="mt-8">
        <label className="block mb-2">Set Work Time (seconds):</label>
        <input
          type="number"
          value={workTime}
          onChange={(e) => setWorkTime(Number(e.target.value))}
          className="w-20 p-2 text-black"
        />
        <label className="block mb-2 mt-4">Set Rest Time (seconds):</label>
        <input
          type="number"
          value={restTime}
          onChange={(e) => setRestTime(Number(e.target.value))}
          className="w-20 p-2 text-black"
        />
      </div>

      {/* Audio player controls */}
      <div className="mt-8 w-full max-w-lg">
        <label className="block mb-2">Upload Your Playlist:</label>
        <input
          type="file"
          accept="audio/*"
          multiple
          onChange={handleAudioUpload}
        />

        {/* Display playlist */}
        <div className="mt-4">
          <h2 className="text-2xl font-semibold">Playlist:</h2>
          <ul className="mt-2">
            {tracks.map((track, index) => (
              <li key={index} className="flex justify-between items-center mb-2">
                <span>{track.name}</span>
                <div>
                  <button
                    onClick={() => playTrack(index)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                  >
                    Play
                  </button>
                  <button
                    onClick={() => removeTrack(index)}
                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Music player controls */}
        <div className="mt-4 flex gap-4">
          <button
            onClick={playPrevTrack}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Previous
          </button>
          <button
            onClick={togglePlayPause}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Play/Pause
          </button>
          <button
            onClick={playNextTrack}
            className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded"
          >
            Next
          </button>
        </div>

        {/* Audio element */}
        <audio ref={audioRef} />
      </div>

      {/* Theme selector */}
      <div className="mt-8">
        <label className="block mb-2">Select Theme Color:</label>
        <select
          onChange={(e) => setTheme(colorThemes[Number(e.target.value)])}
          className="p-2 bg-white text-black"
        >
          {colorThemes.map((theme, index) => (
            <option value={index} key={index}>
              {`Theme ${index + 1}`}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default App;


//STARTER
// import React, { useState, useEffect } from 'react';

// // Define the type for color themes
// interface Theme {
//   from: string;
//   to: string;
// }

// const colorThemes: Theme[] = [
//   { from: 'from-blue-400', to: 'to-purple-500' },
//   { from: 'from-green-400', to: 'to-blue-600' },
//   { from: 'from-yellow-300', to: 'to-red-500' },
// ];

// const App: React.FC = () => {
//   // State for work and rest times
//   const [workTime, setWorkTime] = useState<number>(30); // Time for each rep (seconds)
//   const [restTime, setRestTime] = useState<number>(10); // Rest time between reps (seconds)
//   const [isWorking, setIsWorking] = useState<boolean>(true); // Whether in work or rest phase
//   const [timeLeft, setTimeLeft] = useState<number>(workTime); // Timer countdown
//   const [isRunning, setIsRunning] = useState<boolean>(false); // Timer state (running/paused)
//   const [theme, setTheme] = useState<Theme>(colorThemes[0]); // Color theme

//   // Timer logic: switch between work and rest times when timer reaches 0
//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     if (isRunning && timeLeft > 0) {
//       interval = setInterval(() => {
//         setTimeLeft((prevTime) => prevTime - 1);
//       }, 1000);
//     } else if (timeLeft === 0) {
//       if (isWorking) {
//         setTimeLeft(restTime); // Switch to rest time
//       } else {
//         setTimeLeft(workTime); // Switch back to work time
//       }
//       setIsWorking(!isWorking); // Toggle between work and rest phases
//     }

//     return () => clearInterval(interval);
//   }, [isRunning, timeLeft, isWorking, restTime, workTime]);

//   // Reset the timer to initial work time
//   const resetTimer = (): void => {
//     setIsRunning(false);
//     setIsWorking(true);
//     setTimeLeft(workTime);
//   };

//   // Handle file input for audio playback
//   const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
//     const file = event.target.files?.[0];
//     if (file) {
//       const audio = new Audio(URL.createObjectURL(file));
//       audio.play();
//     }
//   };

//   return (
//     <div className={`min-h-screen flex flex-col items-center justify-center bg-gradient-to-r ${theme.from} ${theme.to} text-white p-4`}>
//       <h1 className="text-4xl font-bold mb-8">Workout Timer</h1>

//       {/* Timer display */}
//       <div className="text-6xl font-mono">
//         {isWorking ? 'Work!' : 'Rest!'} - {timeLeft}s
//       </div>

//       {/* Control buttons */}
//       <div className="flex gap-4 mt-8">
//         <button
//           onClick={() => setIsRunning(!isRunning)}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//         >
//           {isRunning ? 'Pause' : 'Start'}
//         </button>
//         <button
//           onClick={resetTimer}
//           className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Inputs for work and rest times */}
//       <div className="mt-8">
//         <label className="block mb-2">Set Work Time (seconds):</label>
//         <input
//           type="number"
//           value={workTime}
//           onChange={(e) => setWorkTime(Number(e.target.value))}
//           className="w-20 p-2 text-black"
//         />
//         <label className="block mb-2 mt-4">Set Rest Time (seconds):</label>
//         <input
//           type="number"
//           value={restTime}
//           onChange={(e) => setRestTime(Number(e.target.value))}
//           className="w-20 p-2 text-black"
//         />
//       </div>

//       {/* Theme selector */}
//       <div className="mt-8">
//         <label className="block mb-2">Select Theme Color:</label>
//         <select
//           onChange={(e) => setTheme(colorThemes[Number(e.target.value)])}
//           className="p-2 bg-white text-black"
//         >
//           {colorThemes.map((theme, index) => (
//             <option value={index} key={index}>
//               {`Theme ${index + 1}`}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Audio player */}
//       <div className="mt-8">
//         <label className="block mb-2">Play Your Workout Music:</label>
//         <input
//           type="file"
//           accept="audio/*"
//           onChange={handleAudioUpload}
//         />
//       </div>
//     </div>
//   );
// };

// export default App;






//First

// import  { useState, useEffect } from 'react';

// function App() {
//   const [workTime, setWorkTime] = useState(30);  // Time for each rep (seconds)
//   const [restTime, setRestTime] = useState(10);  // Rest time between reps (seconds)
//   const [isWorking, setIsWorking] = useState(true);  // Whether in work or rest phase
//   const [timeLeft, setTimeLeft] = useState(workTime);  // Timer countdown
//   const [isRunning, setIsRunning] = useState(false);  // Timer state (running/paused)

//   // Start the timer countdown
//   useEffect(() => {
//     let interval;
//     if (isRunning && timeLeft > 0) {
//       interval = setInterval(() => {
//         setTimeLeft(timeLeft - 1);
//       }, 1000);
//     } else if (timeLeft === 0) {
//       // Switch between work and rest times when timer hits 0
//       if (isWorking) {
//         setTimeLeft(restTime);
//       } else {
//         setTimeLeft(workTime);
//       }
//       setIsWorking(!isWorking);
//     }
//     return () => clearInterval(interval);
//   }, [isRunning, timeLeft, isWorking, restTime, workTime]);

//   const resetTimer = () => {
//     setIsRunning(false);
//     setIsWorking(true);
//     setTimeLeft(workTime);
//   };

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 text-white p-4">
//       <h1 className="text-4xl font-bold mb-8">Workout Timer</h1>

//       {/* Display Timer */}
//       <div className="text-6xl font-mono">
//         {isWorking ? "Work!" : "Rest!"} - {timeLeft}s
//       </div>

//       {/* Controls */}
//       <div className="flex gap-4 mt-8">
//         <button
//           onClick={() => setIsRunning(!isRunning)}
//           className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
//         >
//           {isRunning ? "Pause" : "Start"}
//         </button>
//         <button
//           onClick={resetTimer}
//           className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
//         >
//           Reset
//         </button>
//       </div>

//       {/* Set Work and Rest Time */}
//       <div className="mt-8">
//         <label className="block mb-2">Set Work Time (seconds):</label>
//         <input
//           type="number"
//           value={workTime}
//           onChange={(e) => setWorkTime(Number(e.target.value))}
//           className="w-20 p-2 text-black"
//         />
//         <label className="block mb-2 mt-4">Set Rest Time (seconds):</label>
//         <input
//           type="number"
//           value={restTime}
//           onChange={(e) => setRestTime(Number(e.target.value))}
//           className="w-20 p-2 text-black"
//         />
//       </div>

//       {/* Add Audio Player */}
//       <div className="mt-8">
//         <label className="block mb-2">Play Your Workout Music:</label>
//         <input
//           type="file"
//           accept="audio/*"
//           onChange={(e) => {
//             const audio = new Audio(URL.createObjectURL(e.target.files[0]));
//             audio.play();
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default App;
