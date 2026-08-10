"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { formatDuration } from "@/lib/practice-tools";

const TIMER_PRESETS = [5, 10, 15] as const;

export function PracticePulse() {
  const [bpm, setBpm] = useState(80);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [secondsRemaining, setSecondsRemaining] = useState(5 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback((): AudioContext => {
    const context = audioContextRef.current ?? new AudioContext();
    audioContextRef.current = context;
    if (context.state === "suspended") void context.resume();
    return context;
  }, []);

  const playClick = useCallback(() => {
    const context = getAudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.frequency.setValueAtTime(960, context.currentTime);
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.045);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + 0.05);
  }, [getAudioContext]);

  function chooseTimer(minutes: number) {
    setTimerMinutes(minutes);
    setSecondsRemaining(minutes * 60);
    setTimerRunning(false);
  }

  useEffect(() => {
    if (!metronomeOn) return;
    playClick();
    const interval = window.setInterval(playClick, 60_000 / bpm);
    return () => window.clearInterval(interval);
  }, [bpm, metronomeOn, playClick]);

  useEffect(() => {
    if (!timerRunning) return;
    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [timerRunning]);

  useEffect(
    () => () => {
      void audioContextRef.current?.close();
    },
    [],
  );

  return (
    <aside className="practice-pulse" aria-labelledby="practice-pulse-title">
      <div className="pulse-heading">
        <div>
          <p className="pulse-kicker">Practice utility</p>
          <h2 id="practice-pulse-title">Practice Pulse</h2>
        </div>
        <span className="pulse-dot" aria-hidden="true" />
      </div>

      <div className="pulse-tool metronome-tool">
        <div className="tool-heading">
          <span>Metronome</span>
          <output htmlFor="bpm">{bpm} BPM</output>
        </div>
        <input
          id="bpm"
          type="range"
          min="40"
          max="220"
          step="1"
          value={bpm}
          aria-label="Metronome tempo in beats per minute"
          onChange={(event) => setBpm(Number(event.target.value))}
        />
        <button
          className="pulse-button primary-pulse-button"
          type="button"
          aria-pressed={metronomeOn}
          onClick={() => setMetronomeOn((current) => !current)}
        >
          {metronomeOn ? "Stop click" : "Start click"}
        </button>
      </div>

      <div className="pulse-tool timer-tool">
        <div className="tool-heading">
          <span>Practice timer</span>
          <output aria-live="polite">{formatDuration(secondsRemaining)}</output>
        </div>
        <div className="timer-presets" aria-label="Timer duration">
          {TIMER_PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className={timerMinutes === minutes ? "selected" : ""}
              aria-pressed={timerMinutes === minutes}
              onClick={() => chooseTimer(minutes)}
            >
              {minutes}m
            </button>
          ))}
        </div>
        <div className="timer-actions">
          <button
            className="pulse-button"
            type="button"
            disabled={secondsRemaining === 0}
            onClick={() => setTimerRunning((current) => !current)}
          >
            {timerRunning ? "Pause" : "Start"}
          </button>
          <button
            className="text-button"
            type="button"
            onClick={() => {
              setSecondsRemaining(timerMinutes * 60);
              setTimerRunning(false);
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </aside>
  );
}
