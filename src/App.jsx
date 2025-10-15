import React, { useState, useEffect } from "react";

// --- Helper Components ---

// Icon for search button
const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-2"
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

// Icon for reset button
const ResetIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-2"
  >
    <polyline points="23 4 23 10 17 10"></polyline>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
  </svg>
);

// Icon for Previous Step button
const PrevIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 mr-2"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

// Icon for Next Step button
const NextIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5 ml-2"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

// --- Main Application Component ---

export default function App() {
  // State variables
  const [array, setArray] = useState([]);
  const [target, setTarget] = useState("");
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [searchState, setSearchState] = useState("idle"); // 'idle', 'searching', 'finished'
  const [message, setMessage] = useState(
    "Enter a number and click Search to begin."
  );
  const [arraySize, setArraySize] = useState(15);

  // Generate a new random, sorted array
  const generateNewArray = (size = 15) => {
    const newArray = Array.from(
      { length: size },
      () => Math.floor(Math.random() * 100) + 1
    );
    newArray.sort((a, b) => a - b);
    setArray(newArray);
    resetState();
  };

  // Reset visualization state
  const resetState = () => {
    setSteps([]);
    setCurrentStepIndex(-1);
    setSearchState("idle");
    setMessage("Enter a number and click Search to begin.");
    setTarget("");
  };

  // Generate initial array on component mount
  useEffect(() => {
    generateNewArray(arraySize);
  }, [arraySize]);

  // Handle the start of the binary search
  const handleSearch = () => {
    if (searchState !== "idle" || target === "") return;
    const targetValue = parseInt(target, 10);
    if (isNaN(targetValue)) {
      setMessage("Please enter a valid number.");
      return;
    }

    const searchSteps = [];
    let low = 0;
    let high = array.length - 1;
    let found = false;

    // Initial state
    searchSteps.push({
      low,
      high,
      mid: null,
      message: `Starting search for ${targetValue}. Low is index ${low}, High is index ${high}.`,
    });

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midValue = array[mid];

      searchSteps.push({
        low,
        high,
        mid,
        message: `Calculating midpoint: floor((${low} + ${high}) / 2) = ${mid}. Value is ${midValue}.`,
      });

      if (midValue === targetValue) {
        searchSteps.push({
          low,
          high,
          mid,
          found: true,
          message: `Element ${targetValue} found at index ${mid}!`,
        });
        found = true;
        break;
      } else if (midValue < targetValue) {
        low = mid + 1;
        searchSteps.push({
          low,
          high,
          mid,
          discard: "left",
          message: `${midValue} < ${targetValue}. Discarding left half. New Low is index ${low}.`,
        });
      } else {
        high = mid - 1;
        searchSteps.push({
          low,
          high,
          mid,
          discard: "right",
          message: `${midValue} > ${targetValue}. Discarding right half. New High is index ${high}.`,
        });
      }
    }

    if (!found) {
      searchSteps.push({
        low,
        high,
        mid: null,
        found: false,
        message: `Element ${targetValue} not found in the array.`,
      });
    }

    setSteps(searchSteps);
    setSearchState("searching");
    setCurrentStepIndex(0);
    setMessage(searchSteps[0].message);
  };

  // Handle stepping to the next part of the visualization
  const handleNextStep = () => {
    if (currentStepIndex < steps.length - 1) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      setMessage(steps[nextStepIndex].message);
      if (nextStepIndex === steps.length - 1) {
        setSearchState("finished");
      }
    }
  };

  // Handle stepping to the previous part of the visualization
  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIndex);
      setMessage(steps[prevStepIndex].message);
      if (searchState === "finished") {
        setSearchState("searching");
      }
    }
  };

  // Determine the CSS class for each array cell based on the current step
  const getCellClass = (index) => {
    if (currentStepIndex === -1 || !steps[currentStepIndex]) {
      return "bg-slate-700";
    }

    const { low, high, mid, found, discard } = steps[currentStepIndex];
    let classes = "transition-all duration-500 ";

    // Highlight found element
    if (found && index === mid)
      return classes + "bg-green-500 ring-4 ring-green-300 transform scale-110";

    // Highlight final "not found" state
    if (found === false) return classes + "bg-red-500 opacity-50";

    // Highlight mid, low, and high pointers
    if (index === mid) classes += "bg-indigo-500 transform scale-110 ";
    if (index === low) classes += "border-b-4 border-yellow-400 ";
    if (index === high) classes += "border-b-4 border-cyan-400 ";

    // Default background for active search area
    if (index >= low && index <= high) {
      classes += "bg-slate-700";
    } else {
      classes += "bg-slate-800 opacity-40";
    }

    return classes;
  };

  // Get pointer labels (Low, High, Mid)
  const getPointerLabel = (index) => {
    if (
      currentStepIndex === -1 ||
      !steps[currentStepIndex] ||
      isNaN(steps[currentStepIndex].low)
    )
      return null;

    const { low, high, mid, found } = steps[currentStepIndex];
    const labels = [];
    if (index === low)
      labels.push({ text: "Low", color: "bg-yellow-400 text-black" });
    if (index === high)
      labels.push({ text: "High", color: "bg-cyan-400 text-black" });
    if (index === mid)
      labels.push({ text: "Mid", color: "bg-indigo-500 text-white" });

    return (
      <div className="absolute -bottom-7 flex flex-col space-y-1 items-center justify-center w-full">
        {labels.map((label) => (
          <span
            key={label.text}
            className={`px-2 py-0.5 text-xs font-bold rounded-full ${label.color}`}
          >
            {label.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* --- Header --- */}
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Binary Search Visualizer
          </h1>
          <p className="text-slate-400 mt-2">
            An interactive guide to the binary search algorithm.
          </p>
        </header>

        {/* --- Definition Section --- */}
        <section className="bg-slate-800/50 p-6 rounded-xl mb-8 border border-slate-700">
          <h2 className="text-2xl font-bold text-indigo-400 mb-3">
            What is Binary Search?
          </h2>
          <p className="text-slate-300 leading-relaxed">
            Binary search is a highly efficient searching algorithm that works
            on **sorted** arrays. It follows a "divide and conquer" strategy.
            Instead of checking elements one by one, it repeatedly divides the
            search interval in half. If the value of the search key is less than
            the item in the middle of the interval, it narrows the interval to
            the lower half. Otherwise, it narrows it to the upper half. This
            process continues until the value is found or the interval is empty.
          </p>
        </section>

        {/* --- Visualization Section --- */}
        <main className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="Number to find"
              disabled={searchState !== "idle"}
              className="bg-slate-900 border-2 border-slate-600 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none w-48 text-center"
            />
            {searchState === "idle" ? (
              <button
                onClick={handleSearch}
                disabled={target === ""}
                className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
              >
                <SearchIcon /> Search
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevStep}
                  disabled={currentStepIndex <= 0}
                  className="flex items-center justify-center bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold p-2 rounded-lg transition-colors duration-300"
                >
                  <PrevIcon />
                </button>
                <button
                  onClick={handleNextStep}
                  disabled={searchState === "finished"}
                  className="flex items-center justify-center bg-slate-600 hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold p-2 rounded-lg transition-colors duration-300"
                >
                  <NextIcon />
                </button>
              </div>
            )}
            <button
              onClick={() => generateNewArray(arraySize)}
              className="flex items-center justify-center bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300"
            >
              <ResetIcon /> New Array
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <label htmlFor="arraySize" className="text-slate-300">
              Array Size:
            </label>
            <input
              type="range"
              id="arraySize"
              min="5"
              max="25"
              value={arraySize}
              onChange={(e) => setArraySize(Number(e.target.value))}
              disabled={searchState !== "idle"}
              className="w-48"
            />
            <span className="font-mono text-cyan-400">{arraySize}</span>
          </div>

          {/* Message Log */}
          <div className="h-12 flex items-center justify-center mb-8 bg-slate-900/70 rounded-lg p-3 text-center">
            <p className="font-mono text-cyan-300">{message}</p>
          </div>

          {/* Array Display */}
          <div className="flex justify-center items-end flex-wrap gap-1 sm:gap-2 min-h-[120px]">
            {array.map((value, index) => (
              <div
                key={index}
                className="flex flex-col items-center relative"
                style={{ width: "clamp(30px, 5vw, 50px)" }}
              >
                <div
                  className={`flex items-center justify-center rounded-lg font-bold text-lg h-12 w-full ${getCellClass(
                    index
                  )}`}
                >
                  {value}
                </div>
                <div className="mt-1 text-xs text-slate-500">{index}</div>
                {getPointerLabel(index)}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
