"use client";

import React, { useMemo, useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "@/components/ui/toast";

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
  videoId,
  userAddress,
  hasCompletedTask = false,
  earnedTaskPoints = 0,
  pointsBreakdown,
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
    total: number;
    pointsEarned: number;
    answers: Array<number | null>;
  }) => void;
  /** video ID untuk tracking progress */
  videoId?: string;
  /** user address untuk tracking progress */
  userAddress?: string;
  /** apakah user sudah pernah complete task */
  hasCompletedTask?: boolean;
  /** points yang didapat dari task sebelumnya */
  earnedTaskPoints?: number;
  /** breakdown poin dari berbagai aktivitas */
  pointsBreakdown?: {
    purchasePoints: number;
    taskPoints: number;
    sharePoints: number;
    totalPoints: number;
  };
}) {
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(hasCompletedTask); // Set to true jika sudah pernah complete
  const [earnedPoints, setEarnedPoints] = useState(earnedTaskPoints); // Set earned points dari DB
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Array<number | null>>(
    Array.from({ length: tasks?.length || 0 }, () => null)
  );

  // Update completed dan earnedPoints jika hasCompletedTask berubah
  useEffect(() => {
    setCompleted(hasCompletedTask);
    setEarnedPoints(earnedTaskPoints);
  }, [hasCompletedTask, earnedTaskPoints]);

  // Restore selected answer when step changes
  useEffect(() => {
    setSelected(answers[step] ?? null);
  }, [step, answers]);

  const current = tasks?.[step];

  const allPoints = useMemo(() => {
    if (totalPoints && totalPoints > 0) {
      // Calculate 20% of total points for tasks
      return Math.floor(totalPoints * 0.2);  // 20% dari total point
    }
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
    toast.error(
      "Selection Required",
      `${msg}\nPlease choose an option to continue`,
      4000
    );
  }

  function toastResult(correct: number, wrong: number, pts: number, total: number) {
    const allCorrect = correct === total;
    if (allCorrect) {
      toast.success(
        "Perfect Score! 🎉",
        `All answers correct!\nCorrect: ${correct} • Points: +${pts}`,
        5000
      );
    } else {
      toast.info(
        "Task Results",
        `Correct: ${correct} • Wrong: ${wrong}\nPoints: +${pts}`,
        4000
      );
    }
  }

  const handleNext = () => {
    if (selected === null) {
      toastWarn("Please select an answer first");
      return;
    }
    // Save the current answer to the answers array
    const newAnswers = [...answers];
    newAnswers[step] = selected;
    setAnswers(newAnswers);
    
    // Move to next step
    if (!isLast) {
      setStep(step + 1);
    }
  };

  const handleDone = async () => {
    if (selected === null) {
      toastWarn("Please select an answer first");
      return;
    }
    
    // Save the final answer
    const finalAnswers = [...answers];
    finalAnswers[step] = selected;

    // Hitung berapa jawaban yang benar
    let correctCount = 0;
    let totalWithAnswer = 0;

    tasks.forEach((task, idx) => {
      if (typeof task.answerIndex === "number" && task.answerIndex >= 0) {
        totalWithAnswer++;
        if (finalAnswers[idx] === task.answerIndex) {
          correctCount++;
        }
      }
    });

    // Hanya berikan poin jika semua jawaban benar
    const allCorrect = totalWithAnswer > 0 && correctCount === totalWithAnswer;
    const pointsEarned = allCorrect ? allPoints : 0;

    // Award points via API jika user address dan video ID tersedia
    if (userAddress && videoId && totalPoints > 0) {
      try {
        const response = await fetch("/api/user-progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userAddr: userAddress.toLowerCase(),
            videoId,
            action: "task",
            totalPoints,
            isCorrect: allCorrect, // Kirim info apakah jawaban benar semua
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          // Error dari server (misalnya belum purchase)
          toast.error(
            "Cannot Complete Task",
            `Error: ${data.error || "Failed to award points"}\nPlease complete the required steps first`,
            5000
          );
          return;
        }
        
        // Show completion toast
        if (allCorrect) {
          toast.success(
            "Task Completed!",
            `Perfect Score! All answers correct!\nYou've earned ${data.pointsAwarded || pointsEarned} points`,
            6000
          );
        } else {
          toast.info(
            "Task Completed",
            `Correct: ${correctCount} / ${totalWithAnswer}\nYou need all correct answers to earn points`,
            5000
          );
        }
        
        // Notify parent component
        onValidated?.({
          correct: correctCount,
          total: totalWithAnswer,
          pointsEarned: data.pointsAwarded || pointsEarned,
          answers: finalAnswers,
        });

        // Save earned points for display
        setEarnedPoints(data.pointsAwarded || pointsEarned);

        // Show completion screen
        setCompleted(true);
      } catch (error) {
        console.error("Error awarding points:", error);
        // Show error toast
        toast.error(
          "Error",
          "Failed to complete task\nPlease try again later",
          5000
        );
      }
    } else {
      // Show completion toast
      if (allCorrect) {
        toast.success(
          "Task Completed!",
          `Perfect Score! All answers correct!\nYou've earned ${pointsEarned} points`,
          6000
        );
      } else {
        toast.info(
          "Task Completed",
          `Correct: ${correctCount} / ${totalWithAnswer}\nYou need all correct answers to earn points`,
          5000
        );
      }
      
      // Notify parent component
      onValidated?.({
        correct: correctCount,
        total: totalWithAnswer,
        pointsEarned,
        answers: finalAnswers,
      });

      // Save earned points for display
      setEarnedPoints(pointsEarned);

      // Show completion screen
      setCompleted(true);
    }
  };

  return (
    <div className={`min-h-0 h-full rounded-2xl bg-neutral-800 p-6 flex flex-col ${className}`}>
      {/* Header: judul */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-50">Your Task</h2>
      </div>

      {!started || completed ? (
        // Task intro/completion screen
        <div className="flex-1 flex flex-col items-center justify-center text-center relative">
          {!isLocked ? (
            <>
              {completed ? (
                <>
                  <div className="animate-in fade-in zoom-in duration-700 ease-out">
                    <div className="mb-6">
                      <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                        <svg 
                          className="w-10 h-10 text-emerald-400 animate-pulse" 
                          viewBox="0 0 24 24" 
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-3">
                        Task Completed!
                      </h3>
                      <div className="space-y-3">
                        {earnedPoints > 0 ? (
                          <>
                            <p className="text-neutral-300">You answered all questions correctly!</p>
                            <div className="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-500/30 rounded-full px-4 py-2 mx-auto">
                              <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                              <span className="text-sm font-semibold text-emerald-300">+{earnedPoints} points earned</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-neutral-400 text-sm">
                              Good effort! To earn points, all answers must be correct.
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-gradient-to-br from-violet-500/20 to-purple-600/10 rounded-full flex items-center justify-center mb-4 mx-auto border border-violet-500/30 shadow-lg shadow-violet-500/10">
                      <svg 
                        className="w-10 h-10 text-violet-400" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mb-3">
                      Ready to Begin?
                    </h3>
                    <div className="space-y-2">
                      <p className="text-neutral-300 text-sm font-medium">
                        Test your knowledge with {tasks.length} {tasks.length === 1 ? 'question' : 'questions'}
                      </p>
                      <p className="text-neutral-400 text-xs">
                        Answer all questions correctly to earn {allPoints} {allPoints === 1 ? 'point' : 'points'}
                      </p>
                    </div>
                  </div>
                </>
              )}
              {!completed && !hasCompletedTask && (
                <button
                  onClick={() => setStarted(true)}
                  className="w-48 rounded-full py-2.5 text-sm font-semibold text-white bg-[var(--primary-500)] hover:bg-violet-500 transition-colors cursor-pointer animate-in fade-in zoom-in duration-700 ease-out delay-100"
                >
                  Start Task
                </button>
              )}
              {hasCompletedTask && !completed && (
                <p className="text-sm text-neutral-500">
                  You have already completed this task.
                </p>
              )}
            </>
          ) : (
            <>
              <div className="animate-in fade-in zoom-in duration-700 ease-out">
                <div className="w-16 h-16 bg-[#271759] rounded-full flex items-center justify-center mb-4 mx-auto">
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
                <h3 className="text-xl font-bold text-white mb-2">Task Locked</h3>
                <p className="text-neutral-400 mb-4">Purchase this video to unlock tasks and earn rewards</p>
              </div>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Progress: single badge "X / N" */}
          <div className="mt-3 flex items-center justify-between">
            <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/60 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
              Question {step + 1} of {tasks.length}
            </span>
            {allPoints > 0 && (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/30 border border-emerald-500/30 px-3 py-1">
                <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-semibold text-emerald-300">+{allPoints} if all correct</span>
              </div>
            )}
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
          <div className="mt-6 flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={isLocked}
                className={`flex items-center justify-center gap-2 rounded-full py-2.5 px-4 text-sm font-semibold text-neutral-50 transition-colors
                  ${isLocked 
                    ? 'bg-neutral-700 cursor-not-allowed opacity-50' 
                    : 'bg-neutral-700 hover:bg-neutral-600'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
            {isLast ? (
              <button
                onClick={handleDone}
                disabled={isLocked}
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-neutral-50 transition-colors
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
                className={`flex-1 rounded-full py-2.5 text-sm font-semibold text-neutral-50 transition-colors
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

      {/* Points Breakdown - Bottom */}
      {isLocked && pointsBreakdown && pointsBreakdown.totalPoints > 0 && (
        <div className="mt-6 rounded-lg border border-neutral-700 bg-neutral-900/60 p-3 text-left animate-in fade-in zoom-in duration-700 ease-out">
          <p className="text-xs font-semibold text-neutral-300 uppercase tracking-wide mb-2.5">
            Points Distribution
          </p>
          <div className="space-y-2">
            {/* Purchase Points */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-xs text-neutral-300">Buy Video</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-semibold text-yellow-400">{pointsBreakdown.purchasePoints}</span>
              </div>
            </div>

            {/* Task Points */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                <span className="text-xs text-neutral-300">Complete Tasks</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-semibold text-yellow-400">{pointsBreakdown.taskPoints}</span>
              </div>
            </div>

            {/* Share Points */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                <span className="text-xs text-neutral-300">Share Video</span>
              </div>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-semibold text-yellow-400">{pointsBreakdown.sharePoints}</span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-700 my-1.5" />

            {/* Total */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-200">Total</span>
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3 text-yellow-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-xs font-bold text-green-400">{pointsBreakdown.totalPoints}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}