"use client";

import React, { useMemo, useState } from "react";
import Swal from "sweetalert2";

export type TaskItem = {
  id?: string | number;
  question: string;
  options: string[];
  /** index jawaban benar (0-based). */
  answerIndex?: number;
  /** poin untuk task ini (opsional) */
  points?: number;
};

export default function TaskPanel({
  className = "",
  tasks,
  totalPoints = 0,
  onValidated,
}: {
  className?: string;
  /** daftar task untuk video saat ini (diambil dari DB) */
  tasks: TaskItem[];
  /** total poin untuk semua task (videos.points_total atau akumulasi) */
  totalPoints?: number;
  /** callback opsional ketika selesai validasi */
  onValidated?: (result: {
    correct: number;
    wrong: number;
    total: number;
    pointsEarned: number;
    answers: Array<number | null>;
  }) => void;
}) {
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
          Belum ada task untuk video ini.
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
      title: allCorrect ? "Semua benar! 🎉" : "Hasil validasi",
      html: `<div style="font-size:13px;line-height:18px">
        Benar: <b>${correct}</b> • Salah: <b>${wrong}</b><br/>Poin: <b>+${pts}</b>
      </div>`,
      position: "top-end",
      toast: true,
      timer: 3000,
      showConfirmButton: false,
    });
  }

  const handleNext = () => {
    if (selected === null) {
      toastWarn("Pilih salah satu jawaban dahulu");
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
        <div className="flex items-center gap-2">
          <svg
            className="size-5 text-yellow-400"
            viewBox="0 0 256 256"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41Z" />
          </svg>
          <span className="font-semibold text-neutral-50">{allPoints} pts</span>
        </div>
      </div>

      {/* Progress: hanya satu badge "X / N" */}
      <div className="mt-3">
        <span className="inline-flex items-center rounded-full border border-neutral-700 bg-neutral-900/60 px-2.5 py-0.5 text-xs font-medium text-neutral-300">
          {step + 1} / {tasks.length}
        </span>
      </div>

      {/* Konten pertanyaan + opsi */}
      <div className="mt-4 flex-1 space-y-4 overflow-y-auto">
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
                />
                <span className="text-sm text-neutral-50">{label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="mt-6">
        {isLast ? (
          <button
            onClick={handleDone}
            className="w-full rounded-full bg-[var(--primary-500)] py-2.5 text-sm font-semibold text-neutral-50 hover:bg-violet-500"
          >
            Done
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="w-full rounded-full bg-[var(--primary-500)] py-2.5 text-sm font-semibold text-neutral-50 hover:bg-violet-500"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
