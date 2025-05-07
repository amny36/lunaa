import React, { useState, useEffect } from "react";
import axiosInstance from "../utils/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const PomodoroTimer = () => {
  const DEFAULT_WORK_TIME = 25 * 60;
  const DEFAULT_BREAK_TIME = 5 * 60;

  const [timeSetting, setTimeSetting] = useState({
    work: DEFAULT_WORK_TIME,
    break: DEFAULT_BREAK_TIME,
  });

  const [time, setTime] = useState(DEFAULT_WORK_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [mode, setMode] = useState("work");
  const [totalFocusTime, setTotalFocusTime] = useState(0);

  const startSound = new Audio("/sounds/start.mp3");
  const pauseSound = new Audio("/sounds/reset.mp3");
  const timerEndSound = new Audio("/sounds/end.mp3");

  const { user } = useAuth();

  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleTimerEnd();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  const saveCycle = async (updatedCycles) => {
    if (user) {
      try {
        await axiosInstance.post("/report/cycles", {
          cycles: updatedCycles,
          totalFocusTime,
        });
      } catch (err) {
        console.error("Error saving cycle data:", err);
      }
    }
  };

  const saveProgress = async (focusTime) => {
    try {
      await axiosInstance.post("/api/progress_report", {
        user_id: user.id,
        week_start_date: new Date().toISOString().split("T")[0],
        focus_time_minutes: focusTime,
        progress_score: Math.min((focusTime / 5) * 100, 100),
      });
      console.log("Pomodoro: Progress saved successfully");
    } catch (error) {
      console.error(
        "Pomodoro: Error saving progress:",
        error.response?.data || error.message
      );
    }
  };

  const handleTimerEnd = () => {
    timerEndSound.play();
    setIsRunning(false);

    const updatedFocusTime =
      totalFocusTime + (mode === "work" ? timeSetting.work / 60 : 0);
    setTotalFocusTime(updatedFocusTime);
    saveProgress(updatedFocusTime);

    if (mode === "work") {
      setMode("break");
      setTime(timeSetting.break);
      setIsBreak(true);
    } else {
      setMode("work");
      setTime(timeSetting.work);
      setIsBreak(false);
      const updatedCycles = cycles + 1;
      setCycles(updatedCycles);
      saveCycle(updatedCycles);
    }
  };

  const toggleWorkDuration = () => {
    const newWorkTime = timeSetting.work === 25 * 60 ? 50 * 60 : 25 * 60;
    setTimeSetting((prev) => ({ ...prev, work: newWorkTime }));
    if (mode === "work") {
      setTime(newWorkTime);
    }
  };

  const toggleBreakDuration = () => {
    const newBreakTime = timeSetting.break === 5 * 60 ? 10 * 60 : 5 * 60;
    setTimeSetting((prev) => ({ ...prev, break: newBreakTime }));
    if (mode === "break") {
      setTime(newBreakTime);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-primary text-white relative">
      {/* Mode Switch Buttons */}
      <div className="absolute top-20 flex justify-center space-x-8">
        <button
          onClick={() => {
            setMode("work");
            setTime(timeSetting.work);
            setIsRunning(false);
          }}
          className={`px-4 py-2 rounded-md text-lg font-semibold ${
            mode === "work"
              ? "bg-light text-primary"
              : "bg-transparent hover:bg-light hover:text-primary"
          }`}
        >
          Focus
        </button>
        <button
          onClick={() => {
            setMode("break");
            setTime(timeSetting.break);
            setIsRunning(false);
          }}
          className={`px-4 py-2 rounded-md text-lg font-semibold ${
            mode === "break"
              ? "bg-light text-primary"
              : "bg-transparent hover:bg-light hover:text-primary"
          }`}
        >
          Break
        </button>
      </div>

      {/* Timer Display */}
      <div className="text-8xl font-bold font-mono mb-10 mt-20">
        {`${Math.floor(time / 60)
          .toString()
          .padStart(2, "0")}:${(time % 60).toString().padStart(2, "0")}`}
      </div>

      {/* Start/Reset Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => {
            setIsRunning(!isRunning);
            isRunning ? pauseSound.play() : startSound.play();
          }}
          className={`px-6 py-3 rounded-lg text-lg font-semibold ${
            isRunning
              ? "bg-accent hover:bg-accent-light text-white"
              : "bg-secondary hover:bg-secondary-light text-white"
          }`}
        >
          {isRunning ? "Pause" : "Start"}
        </button>
        <button
          onClick={() => {
            saveProgress(totalFocusTime);
            setTime(mode === "work" ? timeSetting.work : timeSetting.break);
            setIsRunning(false);
          }}
          className="px-6 py-3 rounded-lg text-lg font-semibold bg-gray-500 hover:bg-gray-600 text-white"
        >
          Reset
        </button>
      </div>

      {/* Toggle Work/Break Duration */}
      <div className="flex flex-col space-y-4 mt-4 items-center">
        {mode === "work" && (
          <button
            onClick={toggleWorkDuration}
            className="px-4 py-2 bg-light text-primary font-semibold rounded-md hover:bg-white transition"
          >
            {timeSetting.work === 25 * 60
              ? "I want 50 minutes of focus"
              : "Switch to 25 minutes of focus"}
          </button>
        )}
        {mode === "break" && (
          <button
            onClick={toggleBreakDuration}
            className="px-4 py-2 bg-light text-primary font-semibold rounded-md hover:bg-white transition"
          >
            {timeSetting.break === 5 * 60
              ? "I want 10 minutes of break"
              : "Switch to 5 minutes of break"}
          </button>
        )}
      </div>

      {/* Stats */}
      <p className="mt-8 text-gray-300">
        Completed Cycles: <span className="font-bold">{cycles}</span>
      </p>
      <p className="mt-2 text-gray-300">
        Total Focus Time:{" "}
        <span className="font-bold">{Math.floor(totalFocusTime)} min</span>
      </p>
    </div>
  );
};

export default PomodoroTimer;
