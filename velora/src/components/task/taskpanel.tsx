"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

export type TaskItem = {
  id?: string | number;
  question: string;
  options: string[];
  /** correct answer index (0-based) */
  answerIndex?: number;
  /** points for this task (optional) */
  points?: number;
};

export default function TaskPanel({
  className = "",
  tasks,
  totalPoints = 0,
  isLocked = false,
  onValidated,
}: {
  className?: string;
  /** list of tasks for current video (fetched from DB) */
  tasks: TaskItem[];
  /** total points for all tasks (videos.points_total or accumulated) */
  totalPoints?: number;
  /** whether the tasks are locked */
  isLocked?: boolean;
  /** optional callback when validation is complete */
  onValidated?: (result: {
    correct: number;
    wrong: number;
    total: number;
    pointsEarned: number;
    answers: Array<number | null>;
  }) => void;
}) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array.from({ length: tasks?.length || 0 }, () => null)
  );

  const current = tasks?.[step];

  const allPoints = useMemo(() => {
    if (totalPoints && totalPoints > 0) return totalPoints;
    const sum = (tasks || []).reduce((a, b) => a + (b.points || 0), 0);
    return sum || 0;
  }, [tasks, totalPoints]);

  if (!tasks || tasks.length === 0) {
    return (
      <div className={`rounded-lg bg-neutral-800 p-6 ${className}`}>
        <h2 className="text-xl font-bold text-neutral-50">Your Task</h2>
        <p className="mt-2 text-sm text-neutral-400">
          No tasks available for this video yet.
        </p>
      </div>
    );
  }

  const isLast = step >= tasks.length - 1;

  function toastWarn(msg: string) {
    Swal.fire({
      icon: "warning",
      title: msg,
      position: "top-end",
      toast: true,
      timer: 2200,
      showConfirmButton: false,
    });
  }

  function toastResult(correct: number, wrong: number, pts: number, total: number) {
    const allCorrect = correct === total;
    Swal.fire({
      icon: allCorrect ? "success" : "info",
      title: allCorrect ? "Perfect Score! 🎉" : "Task Results",
      html: `<div style="font-size:13px;line-height:18px">
        Correct: <b>${correct}</b> • Wrong: <b>${wrong}</b><br/>Points: <b>+${pts}</b>
      </div>`,
      position: "top-end",
      toast: true,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  const handleNext = () => {
    if (selected === null) {
      toastWarn("Please select an answer first");
      return;
    }
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = selected;
      return next;
    });
    if (!isLast) {
      const nextStep = step + 1;
      setStep(nextStep);
      setSelected((prev) => answers[nextStep] ?? null);
    }
  };

  const handleDone = () => {
    if (selected === null) {
      toastWarn("Pilih salah satu jawaban dahulu");
      return;
    }
    
    // pastikan terakhir tersimpan
    const finalAnswers =
      selected === null
        ? answers
        : (() => {
            const cp = [...answers];
            cp[step] = selected;
            return cp;
          })();

    // hitung benar/salah
    let correct = 0;
    let wrong = 0;
    let pointsEarned = 0;

    const withKey = tasks.map((t, i) => ({
      t,
      ans: finalAnswers[i],
      hasKey: typeof t.answerIndex === "number" && t.answerIndex! >= 0,
    }));

    const totalWithKey = withKey.filter((x) => x.hasKey).length || tasks.length;

    withKey.forEach(({ t, ans, hasKey }) => {
      if (!hasKey) {
        // kalau tak ada kunci, treat sebagai salah/0 poin
        wrong += 1;
        return;
      }
      const good = ans === t.answerIndex;
      if (good) {
        correct += 1;
        // hitung poin:
        if (allPoints > 0) {
          // proporsional dari totalPoints
          // (pembulatan bawah agar stabil)
          pointsEarned += Math.floor((allPoints / totalWithKey) + 1e-6);
        } else {
          pointsEarned += t.points || 0;
        }
      } else {
        wrong += 1;
      }
    });

    toastResult(correct, wrong, pointsEarned, totalWithKey);

    onValidated?.({
      correct,
      wrong,
      total: totalWithKey,
      pointsEarned,
      answers: finalAnswers,
    });
  };

  return (
    <div className={`min-h-0 h-full rounded-2xl bg-neutral-800 p-6 flex flex-col ${className}`}>
      {/* Header: judul + poin */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Your Task</h2>
      </div>

      {!started ? (
        // Task intro screen
        <div className="flex-1 flex flex-col items-center justify-center text-center relative">
          {!isLocked ? (
            <>
              <div className="w-16 h-16 bg-violet-600/20 rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-violet-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Begin?</h3>
              <p className="text-neutral-400 mb-6">
                Complete {tasks.length} questions about this video{allPoints > 0 ? ` to earn ${allPoints} points` : ''}!
              </p>
              <button
                onClick={() => setStarted(true)}
                className="w-48 rounded-full py-2.5 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-violet-500 transition-colors"
              >
                Start Task
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#271759] rounded-full flex items-center justify-center mb-4">
                <svg 
                  className="w-8 h-8 text-[#9333EA]" 
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Video Locked</h3>
              <p className="text-neutral-400 mb-4">Unlock for 31 USD</p>
              <div className="flex items-center gap-2 text-neutral-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                </svg>
                <span>{allPoints} points available</span>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Progress: single badge "X / N" */}
          <div className="mt-3">
            <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/60 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
              Question {step + 1} of {tasks.length}
            </span>
          </div>

          <div className="relative flex-1">
            <div className={`space-y-4 mt-4 ${isLocked ? 'opacity-10' : ''}`}>
              <p className="text-[15px] font-semibold text-neutral-50">{current.question}</p>

              <div className="space-y-3">
                {current.options.map((label, i) => {
                  const checked = selected === i;
                  return (
                    <label
                      key={i}
                      className={[
                        "flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors",
                        "border border-neutral-700 hover:bg-neutral-700/50",
                        checked ? "bg-violet-900/20 border-[var(--primary-500)]" : "bg-transparent",
                      ].join(" ")}
                    >
                      <input
                        type="radio"
                        name={`q_${step}`}
                        checked={checked}
                        onChange={() => setSelected(i)}
                        className="form-radio size-4"
                        disabled={isLocked}
                      />
                      <span className="text-sm text-neutral-50">{label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {isLocked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="bg-neutral-800 p-4 rounded-full inline-block">
                    <svg 
                      className="w-8 h-8 text-white" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">Content Locked</h3>
                    <p className="text-neutral-200">
                      Purchase this video to unlock these tasks
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tombol aksi */}
          <div className="mt-6">
            {isLast ? (
              <button
                onClick={handleDone}
                disabled={isLocked}
                className={`w-full rounded-full py-2.5 text-sm font-semibold text-neutral-50 transition-colors
                  ${isLocked 
                    ? 'bg-neutral-700 cursor-not-allowed opacity-50' 
                    : 'bg-[var(--primary-500)] hover:bg-violet-500'}`}
              >
                Submit
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={isLocked}
                className={`w-full rounded-full py-2.5 text-sm font-semibold text-neutral-50 transition-colors
                  ${isLocked 
                    ? 'bg-neutral-700 cursor-not-allowed opacity-50' 
                    : 'bg-[var(--primary-500)] hover:bg-violet-500'}`}
              >
                Next
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}