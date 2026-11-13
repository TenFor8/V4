"use client";

import React, { useState } from "react";
import { Course, DepartmentIssue } from "@/types";
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Send,
  MessageSquareQuote,
} from "lucide-react";

interface SchoolBackendDashboardProps {
  issues: DepartmentIssue[];
  courses: Course[];
  highlightedIssueId: string | null;
  onResolveIssue: (
    issueId: string,
    newStatus: DepartmentIssue["status"],
    resolutionText: string,
    responderRole: string
  ) => void;
  onJumpToCourse: (courseCode: string) => void;
}

export default function SchoolBackendDashboard({
  issues,
  courses,
  highlightedIssueId,
  onResolveIssue,
  onJumpToCourse,
}: SchoolBackendDashboardProps) {
  const [selectedCourseFilter, setSelectedCourseFilter] =
    useState<string>("All");
  const [selectedStatusFilter, setSelectedStatusFilter] =
    useState<string>("All");
  const [editingIssueId, setEditingIssueId] = useState<string | null>(
    highlightedIssueId || "iss-5"
  );
  const [resolutionDraft, setResolutionDraft] = useState<string>(
    "Published item-level R plotting rubrics alongside each assignment spec and dedicated 15 minutes of weekly TA tutorials to live RStudio walkthroughs."
  );
  const [responderRole, setResponderRole] = useState<string>(
    "Curriculum Committee"
  );
  const [justPublishedId, setJustPublishedId] = useState<string | null>(null);

  const filteredIssues = issues.filter((iss) => {
    if (
      selectedCourseFilter !== "All" &&
      iss.courseCode !== selectedCourseFilter
    )
      return false;
    if (selectedStatusFilter !== "All" && iss.status !== selectedStatusFilter)
      return false;
    return true;
  });

  const addressedCount = issues.filter(
    (i) => i.status === "Addressed in Curriculum"
  ).length;
  const needsActionCount = issues.filter(
    (i) => i.status === "Needs Action"
  ).length;

  const handleOpenEditor = (issue: DepartmentIssue) => {
    setEditingIssueId(issue.id);
    setResolutionDraft(
      issue.officialResolution ||
        `Implemented for Upcoming Term: ${issue.recommendedAction}`
    );
  };

  const handlePublishResolution = (
    issueId: string,
    status: DepartmentIssue["status"]
  ) => {
    if (!resolutionDraft.trim()) return;
    onResolveIssue(issueId, status, resolutionDraft.trim(), responderRole);
    setJustPublishedId(issueId);
    setTimeout(() => setJustPublishedId(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Clean Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Curriculum Action Dashboard
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              School Backend
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated student review patterns converted into actionable curriculum tickets.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700">
            <strong>{needsActionCount}</strong> awaiting action
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
            <strong>{addressedCount}</strong> resolved
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Course:</span>
          {["All", ...courses.map((c) => c.code)].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedCourseFilter(code)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedCourseFilter === code
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {code}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-400 font-medium mr-1">Status:</span>
          {(
            [
              "All",
              "Needs Action",
              "In Progress",
              "Addressed in Curriculum",
            ] as const
          ).map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                selectedStatusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-3.5">
        {filteredIssues.map((issue) => {
          const isEditing = editingIssueId === issue.id;
          const isJustPublished = justPublishedId === issue.id;

          return (
            <div
              key={issue.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4"
            >
              {/* Issue Top Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onJumpToCourse(issue.courseCode)}
                    className="font-bold text-slate-900 hover:underline flex items-center gap-1"
                  >
                    <span>{issue.courseCode}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                  <span>•</span>
                  <span className="text-slate-500">{issue.category}</span>
                  <span>•</span>
                  <span className="text-slate-400">
                    {issue.mentionCount} reviews ({issue.termsAffected.join(", ")})
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                    issue.status === "Addressed in Curriculum"
                      ? "bg-emerald-50 text-emerald-800"
                      : issue.status === "In Progress"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {issue.status}
                </span>
              </div>

              {/* Title & Synthesis */}
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {issue.title}
                </h2>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {issue.aiSynthesizedSummary}
                </p>
              </div>

              {/* Recommended Action & Sample Evidence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-800 block">
                    Recommended Faculty Action:
                  </span>
                  <p className="text-slate-600">{issue.recommendedAction}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="font-semibold text-slate-800 block">
                    Student Quote:
                  </span>
                  <p className="text-slate-600 italic">
                    &ldquo;{issue.sampleQuotes[0]}&rdquo;
                  </p>
                </div>
              </div>

              {/* Published Resolution Note if exists */}
              {issue.officialResolution && !isEditing && (
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 text-xs flex items-center justify-between gap-3">
                  <div className="text-emerald-900">
                    <span className="font-semibold">
                      Published to Course Changelog ({issue.updatedBy || "Staff"}):{" "}
                    </span>
                    {issue.officialResolution}
                  </div>
                  <button
                    onClick={() => handleOpenEditor(issue)}
                    className="text-[11px] font-semibold text-emerald-800 underline shrink-0"
                  >
                    Edit
                  </button>
                </div>
              )}

              {isJustPublished && (
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
                  ✓ Resolution published to {issue.courseCode} changelog!
                </div>
              )}

              {/* Action Trigger / Publisher Form */}
              {!isEditing && !issue.officialResolution && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => handleOpenEditor(issue)}
                    className="text-xs font-semibold text-slate-800 hover:text-slate-900 underline"
                  >
                    Respond &amp; Update Status →
                  </button>
                </div>
              )}

              {isEditing && (
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="text-xs font-bold text-slate-800">
                    Publish Update to {issue.courseCode} Course Page:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Responder Role
                      </label>
                      <input
                        type="text"
                        value={responderRole}
                        onChange={(e) => setResponderRole(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] text-slate-500 mb-1">
                        Curriculum Action Summary
                      </label>
                      <input
                        type="text"
                        value={resolutionDraft}
                        onChange={(e) => setResolutionDraft(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 bg-slate-50"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 text-xs pt-1">
                    <button
                      onClick={() => setEditingIssueId(null)}
                      className="px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handlePublishResolution(issue.id, "In Progress")
                      }
                      className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Mark &ldquo;In Progress&rdquo;
                    </button>
                    <button
                      onClick={() =>
                        handlePublishResolution(
                          issue.id,
                          "Addressed in Curriculum"
                        )
                      }
                      className="px-3.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-semibold"
                    >
                      Publish Resolution
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
