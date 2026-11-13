"use client";

import React, { useState, useMemo } from "react";
import {
  Course,
  Instructor,
  LearningStyleTag,
  Review,
  TAProfile,
} from "@/types";
import { LEARNING_STYLE_OPTIONS } from "@/data/mockData";
import { analyzeReviewSubstance } from "@/utils/substanceAnalyzer";
import {
  X,
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Ban,
  Wand2,
  CheckCircle2,
  Send,
  GraduationCap,
  Building2,
  Users,
  Lock,
} from "lucide-react";

interface GuidedReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  instructors: Instructor[];
  tas: TAProfile[];
  initialCourseCode?: string;
  initialTAName?: string;
  onSubmitReview: (
    newReview: Review,
    newTAEndorsement?: { taName: string; quote: string; context: string },
    newTAPrivateTip?: { taName: string; note: string; actionableTip: string },
    autoCreateBackendIssue?: {
      courseCode: string;
      title: string;
      summary: string;
      quote: string;
    }
  ) => void;
}

export default function GuidedReviewModal({
  isOpen,
  onClose,
  courses,
  instructors,
  tas,
  initialCourseCode = "CS 246",
  initialTAName = "Maya Chen",
  onSubmitReview,
}: GuidedReviewModalProps) {
  const [courseCode, setCourseCode] = useState(initialCourseCode);
  const [checkpointType, setCheckpointType] = useState<
    Review["checkpointType"]
  >("Mid-Term Pulse");
  const [overallExperience, setOverallExperience] = useState<
    Review["overallExperience"]
  >("Mixed / Constructive");
  const [attendance, setAttendance] = useState<
    Review["reviewerContext"]["attendance"]
  >("Attended 80%+ lectures");
  const [officeHoursUsed, setOfficeHoursUsed] = useState<
    Review["reviewerContext"]["officeHoursUsed"]
  >("Regular TA/Prof OH user");
  const [workloadFelt, setWorkloadFelt] = useState<
    Review["reviewerContext"]["workloadFelt"]
  >("Heavy but fair");

  const [studentAdvice, setStudentAdvice] = useState(
    "Start assignments at least 5 days before the due date and attend the weekly tutorials. If you prefer structured slides, pair the lectures with the tutorial problem sets."
  );
  const [schoolFeedback, setSchoolFeedback] = useState(
    "Assignment 3 and the midterm fell in the same week, creating a severe workload spike. Spacing the A3 deadline by 48 hours or releasing practice test cases earlier would improve learning."
  );
  const [selectedTA, setSelectedTA] = useState(initialTAName);
  const [taFeedback, setTaFeedback] = useState(
    "Walked through pointer edge cases step-by-step on the whiteboard during Tutorial 101 and stayed after class to answer questions."
  );
  const [privateTATip, setPrivateTATip] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<LearningStyleTag[]>([
    "hands-on",
    "ta-mentorship",
  ]);
  const [wasCoached, setWasCoached] = useState(false);

  const courseInstructor =
    instructors.find((i) => i.courses.includes(courseCode))?.name ||
    "Course Instructor";

  const analysis = useMemo(() => {
    return analyzeReviewSubstance(studentAdvice, schoolFeedback, taFeedback, true);
  }, [studentAdvice, schoolFeedback, taFeedback]);

  if (!isOpen) return null;

  const applyPreset = (
    type:
      | "inappropriate-rant"
      | "vague-complaint"
      | "substantive-critical"
      | "constructive-ta"
  ) => {
    setWasCoached(false);
    if (type === "inappropriate-rant") {
      setOverallExperience("Critical / Needs Reform");
      setStudentAdvice(
        "Worst person ever, total idiot prof who can't teach. Trash course avoid at all costs!"
      );
      setSchoolFeedback("Fire him immediately, this bullshit course ruined my term.");
      setTaFeedback("");
    } else if (type === "vague-complaint") {
      setOverallExperience("Critical / Needs Reform");
      setStudentAdvice("Trash course avoid at all costs. Way too hard.");
      setSchoolFeedback("Make the exams easier.");
      setTaFeedback("");
    } else if (type === "substantive-critical") {
      setOverallExperience("Critical / Needs Reform");
      setStudentAdvice(
        "Honest warning: do not rely solely on the lecture slides because exam questions test multi-step proof variations not shown in class. Form a study group in Week 2 and work through every tutorial sheet."
      );
      setSchoolFeedback(
        "There is a major disconnect between lecture examples and the Midterm/Assignment 3 grading rubric. We recommend publishing past midterm rubrics and splitting Assignment 3 into an earlier checkpoint."
      );
      setTaFeedback(
        "Tutorial walkthroughs were the one bright spot that helped bridge the gap between lecture and assignments."
      );
    } else if (type === "constructive-ta") {
      setOverallExperience("Positive");
      setStudentAdvice(
        "Hands-on learners will love this course if you code along in lecture and use the TA debugging clinics before submitting to Marmoset."
      );
      setSchoolFeedback(
        "Adding a starter Valgrind script to Assignment 2 (just like Assignment 3) would help students catch memory leaks earlier in the term."
      );
      setTaFeedback(
        "Explained RAII and move constructors visually on the whiteboard—best tutorial section this term!"
      );
      setPrivateTATip(
        "Writing slightly larger on the right side of the chalkboard would help students in the back row of MC 4041."
      );
    }
  };

  const handleApplyCoachRewrite = () => {
    if (!analysis.suggestedRewrite) return;
    setStudentAdvice(analysis.suggestedRewrite.studentAdvice);
    setSchoolFeedback(analysis.suggestedRewrite.schoolFeedback);
    setWasCoached(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analysis.isPublishable) return;

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      courseCode,
      term: "Fall 2026",
      instructorName: courseInstructor,
      taName: selectedTA || undefined,
      checkpointType,
      reviewerContext: {
        attendance,
        officeHoursUsed,
        reasonForTaking: "Core Requirement",
        workloadFelt,
      },
      studentAdvice: studentAdvice.trim(),
      schoolFeedback: schoolFeedback.trim(),
      taFeedback: taFeedback.trim() || undefined,
      overallExperience,
      substanceScore: analysis.score,
      substanceStatus: wasCoached ? "Coached & Refined" : "Verified Substantive",
      substanceBreakdown: analysis.breakdown,
      styleTags: selectedStyles,
      componentTags: analysis.detectedThemes,
      helpfulCount: 1,
      createdAt: "Just now",
    };

    const newEndorsement =
      selectedTA && taFeedback.trim().length > 15
        ? {
            taName: selectedTA,
            quote: taFeedback.trim(),
            context: `${checkpointType} • ${officeHoursUsed}`,
          }
        : undefined;

    const newPrivateTip =
      selectedTA && privateTATip.trim().length > 10
        ? {
            taName: selectedTA,
            note: privateTATip.trim(),
            actionableTip:
              "Actionable student suggestion routed privately from Fall 2026 pulse check.",
          }
        : undefined;

    const autoBackendIssue =
      overallExperience === "Critical / Needs Reform" && analysis.score >= 70
        ? {
            courseCode,
            title: `Student-Flagged Friction (${analysis.detectedThemes.join(
              " & "
            )}): Alignment & Pacing`,
            summary: schoolFeedback.trim(),
            quote: schoolFeedback.trim(),
          }
        : undefined;

    onSubmitReview(
      newReview,
      newEndorsement,
      newPrivateTip,
      autoBackendIssue
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-xl border border-slate-200">
        {/* Top Modal Header */}
        <div className="sticky top-0 z-10 bg-white px-6 py-4 flex items-center justify-between border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Guided Review
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs text-slate-500">
                Course, Instructor &amp; TA Feedback
              </span>
            </div>
            <h2 className="text-base font-semibold text-slate-900 mt-0.5">
              Submit Structured Feedback
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Quick Demo Presets */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-500" />
                Quick demo scenarios (try the substance filter):
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => applyPreset("inappropriate-rant")}
                className="text-left px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:border-slate-300 text-xs transition-colors"
              >
                <div className="font-medium text-slate-800">1. Personal Attack</div>
                <div className="text-[10px] text-slate-400">Blocked + coached</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("vague-complaint")}
                className="text-left px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:border-slate-300 text-xs transition-colors"
              >
                <div className="font-medium text-slate-800">2. Vague Complaint</div>
                <div className="text-[10px] text-slate-400">Low substance</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("substantive-critical")}
                className="text-left px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:border-slate-300 text-xs transition-colors"
              >
                <div className="font-medium text-slate-800">3. Harsh Critique</div>
                <div className="text-[10px] text-slate-400">Allowed with specifics</div>
              </button>
              <button
                type="button"
                onClick={() => applyPreset("constructive-ta")}
                className="text-left px-2.5 py-1.5 rounded border border-slate-200 bg-white hover:border-slate-300 text-xs transition-colors"
              >
                <div className="font-medium text-slate-800">4. Constructive + TA</div>
                <div className="text-[10px] text-slate-400">Praise &amp; private tip</div>
              </button>
            </div>
          </div>

          {/* Course, Timing & Reviewer Context */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Course
              </label>
              <select
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.code}>
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Timing
              </label>
              <select
                value={checkpointType}
                onChange={(e) =>
                  setCheckpointType(
                    e.target.value as Review["checkpointType"]
                  )
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="Mid-Term Pulse">Mid-Term Pulse (Week 6)</option>
                <option value="Post-Course Reflection">Post-Course (End of Term)</option>
                <option value="Alumni Retro">Alumni Retro</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Overall Experience
              </label>
              <select
                value={overallExperience}
                onChange={(e) =>
                  setOverallExperience(
                    e.target.value as Review["overallExperience"]
                  )
                }
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400"
              >
                <option value="Positive">Positive</option>
                <option value="Mixed / Constructive">Mixed / Constructive</option>
                <option value="Critical / Needs Reform">Critical / Needs Reform</option>
              </select>
            </div>
          </div>

          {/* Context Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Lecture Attendance
              </label>
              <select
                value={attendance}
                onChange={(e) =>
                  setAttendance(
                    e.target.value as Review["reviewerContext"]["attendance"]
                  )
                }
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="Attended 80%+ lectures">Attended 80%+ lectures</option>
                <option value="Watched recordings">Watched recordings</option>
                <option value="Mostly self-studied">Mostly self-studied</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Office Hours Usage
              </label>
              <select
                value={officeHoursUsed}
                onChange={(e) =>
                  setOfficeHoursUsed(
                    e.target
                      .value as Review["reviewerContext"]["officeHoursUsed"]
                  )
                }
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="Regular TA/Prof OH user">Regular TA/Prof OH user</option>
                <option value="Occasional Piazza/Ed">Occasional Piazza/Ed</option>
                <option value="Did not use OH">Did not use OH</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-500 mb-1">
                Workload Pace
              </label>
              <select
                value={workloadFelt}
                onChange={(e) =>
                  setWorkloadFelt(
                    e.target.value as Review["reviewerContext"]["workloadFelt"]
                  )
                }
                className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="Manageable">Manageable</option>
                <option value="Heavy but fair">Heavy but fair</option>
                <option value="Overwhelming spikes">Overwhelming spikes</option>
              </select>
            </div>
          </div>

          {/* Dual-Purpose Guided Feedback */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                For Future Students
              </label>
              <p className="text-[11px] text-slate-500">
                Study tips, pacing advice, and what learning styles fit best.
              </p>
              <textarea
                rows={4}
                value={studentAdvice}
                onChange={(e) => setStudentAdvice(e.target.value)}
                placeholder="e.g., Great for hands-on learners who code along. Start A3 early..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                For Department &amp; Course Team
              </label>
              <p className="text-[11px] text-slate-500">
                Actionable fixes for assignments, pacing, or rubric clarity.
              </p>
              <textarea
                rows={4}
                value={schoolFeedback}
                onChange={(e) => setSchoolFeedback(e.target.value)}
                placeholder="e.g., Assignment 4 overlaps with midterm week. Splitting it into two milestones..."
                className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* TA Feedback */}
          <div className="p-3.5 rounded-lg border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                Teaching Assistant (TA) Feedback (Optional)
              </div>
              <select
                value={selectedTA}
                onChange={(e) => setSelectedTA(e.target.value)}
                className="px-2.5 py-1 rounded-md border border-slate-200 text-xs bg-white text-slate-800"
              >
                <option value="">No specific TA selected</option>
                {tas.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Public TA Endorsement (Helpful explanations, clinics)
                </label>
                <input
                  type="text"
                  value={taFeedback}
                  onChange={(e) => setTaFeedback(e.target.value)}
                  placeholder="How did this TA assist you?"
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Private Constructive Tip for TA (Never shown publicly)
                </label>
                <input
                  type="text"
                  value={privateTATip}
                  onChange={(e) => setPrivateTATip(e.target.value)}
                  placeholder="e.g., Write slightly larger on the chalkboard"
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:border-slate-400 placeholder:text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* Live Substance Analyzer Panel */}
          <div
            className={`p-4 rounded-lg border transition-all ${
              analysis.status === "Blocked: Inappropriate / Personal Attack"
                ? "bg-rose-50/50 border-rose-200"
                : analysis.status === "Flagged: Low Substance / Rant"
                ? "bg-amber-50/50 border-amber-200"
                : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {analysis.status ===
                "Blocked: Inappropriate / Personal Attack" ? (
                  <Ban className="w-5 h-5 text-rose-500 shrink-0" />
                ) : analysis.status === "Flagged: Low Substance / Rant" ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-900">
                      Substance Score: {analysis.score}/100
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                        analysis.isPublishable
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {analysis.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-normal">
                    {analysis.coachingTip}
                  </p>
                </div>
              </div>

              {!analysis.isPublishable && analysis.suggestedRewrite && (
                <button
                  type="button"
                  onClick={handleApplyCoachRewrite}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5 text-amber-400" />
                  Auto-Reframe into Constructive Critique
                </button>
              )}
            </div>

            {/* Diagnostic checks */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-200/60 text-[11px]">
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    analysis.breakdown.respectfulTone
                      ? "text-emerald-600"
                      : "text-rose-500"
                  }`}
                />
                <span className="text-slate-700">Respectful Tone</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    analysis.breakdown.hasSpecifics
                      ? "text-emerald-600"
                      : "text-amber-500"
                  }`}
                />
                <span className="text-slate-700">Specific Course Elements</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${
                    analysis.breakdown.hasActionableCritique
                      ? "text-emerald-600"
                      : "text-amber-500"
                  }`}
                />
                <span className="text-slate-700">Actionable Feedback</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-700">Engagement Context</span>
              </div>
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Department Tag:{" "}
              <span className="font-medium text-slate-700">{analysis.detectedThemes.join(", ") || "General"}</span>
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!analysis.isPublishable}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                  analysis.isPublishable
                    ? "bg-slate-900 hover:bg-slate-800 text-white shadow-xs"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                {analysis.isPublishable
                  ? "Publish Review"
                  : "Refine Review to Publish"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
