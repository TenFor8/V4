"use client";

import React, { useState } from "react";
import { Instructor, TAProfile } from "@/types";
import { LEARNING_STYLE_OPTIONS } from "@/data/mockData";
import {
  GraduationCap,
  Award,
  Eye,
  Lock,
  BookOpen,
  MessageSquarePlus,
  Share2,
  Sliders,
  UserCheck,
  Lightbulb,
} from "lucide-react";

interface TAAndInstructorHubProps {
  tas: TAProfile[];
  instructors: Instructor[];
  selectedTAName: string | null;
  onSelectTAName: (name: string) => void;
  onToggleTAPublic: (taId: string) => void;
  onToggleEndorsementPublic: (taId: string, endorsementId: string) => void;
  onOpenReviewModal: (courseCode?: string, taName?: string) => void;
}

export default function TAAndInstructorHub({
  tas,
  instructors,
  selectedTAName,
  onSelectTAName,
  onToggleTAPublic,
  onToggleEndorsementPublic,
  onOpenReviewModal,
}: TAAndInstructorHubProps) {
  const [viewMode, setViewMode] = useState<"public-student" | "ta-self-portal">(
    "ta-self-portal"
  );
  const [copiedPortfolio, setCopiedPortfolio] = useState(false);

  const activeTA = tas.find((t) => t.name === selectedTAName) || tas[0];

  const handleCopyShareLink = () => {
    setCopiedPortfolio(true);
    setTimeout(() => setCopiedPortfolio(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Clean Minimal Page Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              TAs &amp; Teaching Portfolios
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {tas.length} Verified TAs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Opt-in public portfolios for teaching recognition, plus private mid-term feedback for coaching.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs font-medium text-slate-600 shrink-0">
          <button
            onClick={() => setViewMode("ta-self-portal")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "ta-self-portal"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>TA Self-View</span>
          </button>
          <button
            onClick={() => setViewMode("public-student")}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              viewMode === "public-student"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "hover:text-slate-900"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Student Directory View</span>
          </button>
        </div>
      </div>

      {/* TA Directory & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: TA List */}
        <div className="lg:col-span-4 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Select Teaching Assistant
          </div>

          <div className="space-y-2">
            {tas.map((ta) => {
              const isSelected = ta.id === activeTA.id;
              return (
                <button
                  key={ta.id}
                  onClick={() => onSelectTAName(ta.name)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                    isSelected
                      ? "bg-white text-slate-900 border-slate-900 shadow-xs ring-1 ring-slate-900"
                      : "bg-white hover:bg-slate-50 text-slate-900 border-slate-200/80"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm">{ta.name}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                        ta.isPublicOptIn
                          ? "bg-emerald-50 text-emerald-800"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {ta.isPublicOptIn ? "Public" : "Private"}
                    </span>
                  </div>
                  <p className="text-xs mt-1 text-slate-500 line-clamp-1">
                    {ta.role}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {ta.coursesTaught.map((ct, i) => (
                      <span
                        key={i}
                        className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                      >
                        {ct.code}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active TA Profile */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-5">
            {/* TA Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                    {activeTA.department}
                  </span>
                  <span className="text-xs text-slate-400">
                    {activeTA.metrics.totalReviews} verified student reviews
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {activeTA.name}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{activeTA.role}</p>
                <p className="text-xs text-slate-600 mt-2 max-w-xl leading-relaxed">
                  {activeTA.bio}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopyShareLink}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedPortfolio ? "Copied!" : "Share Link"}</span>
                </button>

                <button
                  onClick={() =>
                    onOpenReviewModal(
                      activeTA.coursesTaught[0]?.code || "CS 246",
                      activeTA.name
                    )
                  }
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Endorse TA</span>
                </button>
              </div>
            </div>

            {/* Visibility toggle banner if in TA self mode */}
            {viewMode === "ta-self-portal" && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>
                    Your portfolio is currently{" "}
                    <strong>
                      {activeTA.isPublicOptIn ? "Public" : "Private"}
                    </strong>
                  </span>
                </div>
                <button
                  onClick={() => onToggleTAPublic(activeTA.id)}
                  className="px-3 py-1 rounded-lg border border-slate-300 font-medium hover:bg-white text-slate-800"
                >
                  {activeTA.isPublicOptIn ? "Set to Private" : "Make Public"}
                </button>
              </div>
            )}

            {/* Teaching Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500">
                  Helpfulness
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeTA.metrics.helpfulness}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500">
                  Explanation Clarity
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeTA.metrics.clarity}%
                </div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <div className="text-[11px] text-slate-500">
                  Responsiveness
                </div>
                <div className="text-lg font-bold text-slate-900 mt-0.5">
                  {activeTA.metrics.responsiveness}%
                </div>
              </div>
            </div>

            {/* Superpower Badges */}
            <div className="space-y-2">
              <div className="text-xs font-semibold text-slate-700">
                Verified Teaching Strengths:
              </div>
              <div className="flex flex-wrap gap-2">
                {activeTA.superpowers.map((sp, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-slate-100 text-slate-800 px-3 py-1 rounded-lg font-medium"
                  >
                    ★ {sp.label}{" "}
                    <span className="text-slate-400 font-normal">
                      ({sp.count})
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Endorsements */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="text-xs font-semibold text-slate-700">
                Student Endorsements:
              </div>
              <div className="space-y-2.5">
                {activeTA.studentEndorsements
                  .filter((e) => viewMode === "ta-self-portal" || e.isPublic)
                  .map((endorsement) => (
                    <div
                      key={endorsement.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="font-semibold text-slate-800">
                          {endorsement.courseCode} ({endorsement.term})
                        </span>
                        <span>{endorsement.context}</span>
                      </div>
                      <p className="text-slate-700 italic">
                        &ldquo;{endorsement.quote}&rdquo;
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Private Notes (Only in TA Self-View) */}
            {viewMode === "ta-self-portal" && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Private Coaching Feedback (Visible only to you)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Never shown publicly
                  </span>
                </div>
                <div className="space-y-2">
                  {activeTA.privateConstructiveFeedback.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-white border border-slate-200 text-xs space-y-1"
                    >
                      <div className="font-medium text-slate-800">
                        {item.note}
                      </div>
                      <div className="text-slate-500 text-[11px] flex items-center gap-1">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>Tip: {item.actionableTip}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Instructor Teaching Style Matrix */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Instructor Teaching Profiles
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Understand lecture pacing and delivery style before enrolling.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {instructors.map((inst) => (
                <div
                  key={inst.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900">
                        {inst.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {inst.courses.join(", ")} • {inst.pace}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {inst.teachingStyleSummary}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {inst.strengths.map((str, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {str}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
