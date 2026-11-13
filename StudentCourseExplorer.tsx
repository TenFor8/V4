"use client";

import React, { useState, useMemo } from "react";
import {
  Course,
  Instructor,
  LearningStyleTag,
  Review,
  ReviewComponentTag,
  TAProfile,
} from "@/types";
import { LEARNING_STYLE_OPTIONS } from "@/data/mockData";
import {
  Search,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  BookOpen,
  Users,
  MessageSquare,
  ThumbsUp,
  ArrowUpRight,
  GraduationCap,
  Building2,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

interface StudentCourseExplorerProps {
  courses: Course[];
  instructors: Instructor[];
  tas: TAProfile[];
  reviews: Review[];
  selectedCourseId: string;
  onSelectCourse: (id: string) => void;
  onOpenReviewModal: (courseCode: string) => void;
  onNavigateToTA: (taName: string) => void;
  onNavigateToBackendIssue: (issueId?: string) => void;
}

type CourseSubTab = "reviews" | "changelog" | "instructors-tas" | "overview";

export default function StudentCourseExplorer({
  courses,
  instructors,
  tas,
  reviews,
  selectedCourseId,
  onSelectCourse,
  onOpenReviewModal,
  onNavigateToTA,
  onNavigateToBackendIssue,
}: StudentCourseExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<LearningStyleTag[]>([
    "hands-on",
  ]);
  const [showStyleFilter, setShowStyleFilter] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<CourseSubTab>("reviews");
  const [hideLowSubstance, setHideLowSubstance] = useState<boolean>(true);
  const [selectedComponent, setSelectedComponent] = useState<
    ReviewComponentTag | "All"
  >("All");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const toggleStyle = (style: LearningStyleTag) => {
    setSelectedStyles((prev) =>
      prev.includes(style) ? prev.filter((s) => s !== style) : [...prev, style]
    );
  };

  const calculateStyleMatch = (itemStyles: LearningStyleTag[]) => {
    if (selectedStyles.length === 0) return 85;
    const overlap = itemStyles.filter((s) => selectedStyles.includes(s)).length;
    const ratio = overlap / Math.min(selectedStyles.length, 3);
    return Math.min(99, Math.round(60 + ratio * 38));
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (c) =>
        c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  const activeCourse =
    courses.find((c) => c.id === selectedCourseId) || courses[0];

  const courseInstructors = instructors.filter((inst) =>
    inst.courses.includes(activeCourse.code)
  );
  const courseTAs = tas.filter((ta) =>
    ta.coursesTaught.some((ct) => ct.code === activeCourse.code)
  );

  const courseReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (r.courseCode !== activeCourse.code) return false;
      if (hideLowSubstance && r.substanceScore < 55) return false;
      if (
        selectedComponent !== "All" &&
        !r.componentTags.includes(selectedComponent)
      )
        return false;
      return true;
    });
  }, [reviews, activeCourse.code, hideLowSubstance, selectedComponent]);

  const hiddenLowSubstanceCount = useMemo(() => {
    return reviews.filter(
      (r) => r.courseCode === activeCourse.code && r.substanceScore < 55
    ).length;
  }, [reviews, activeCourse.code]);

  const courseFitScore = calculateStyleMatch(activeCourse.styleTags);

  return (
    <div className="space-y-6">
      {/* 1. Clean, Minimal Starting Point: Search & Course Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code or topic (e.g. CS 246, Algorithms, Concurrency)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:bg-white focus:border-slate-400 transition-all placeholder:text-slate-400"
            />
          </div>

          <button
            onClick={() => setShowStyleFilter(!showStyleFilter)}
            className={`text-xs font-medium px-3.5 py-2.5 rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
              selectedStyles.length > 0
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Learning Style Preferences ({selectedStyles.length})</span>
          </button>
        </div>

        {/* Quick Course Selector Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium mr-1">
            Popular:
          </span>
          {courses.map((course) => {
            const isSelected = course.id === activeCourse.id;
            return (
              <button
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{course.code}</span>
                <span
                  className={`ml-1.5 text-[11px] font-normal ${
                    isSelected ? "text-slate-300" : "text-slate-400"
                  }`}
                >
                  {course.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Learning Style Filter */}
        {showStyleFilter && (
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="text-xs text-slate-500 font-medium">
              Select what works for you to personalize course compatibility scores:
            </div>
            <div className="flex flex-wrap gap-2">
              {LEARNING_STYLE_OPTIONS.map((option) => {
                const active = selectedStyles.includes(option.id);
                return (
                  <button
                    key={option.id}
                    onClick={() => toggleStyle(option.id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                      active
                        ? "bg-amber-50 border-amber-300 text-amber-950 font-semibold"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {active ? "✓ " : "+ "}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. Course Header & Clean Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Course Intro */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-800">
                  {activeCourse.department}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Prerequisites: {activeCourse.prereqs}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeCourse.code}: {activeCourse.name}
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
                {activeCourse.description}
              </p>
            </div>

            <button
              onClick={() => onOpenReviewModal(activeCourse.code)}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0 shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
              <span>Review {activeCourse.code}</span>
            </button>
          </div>

          {/* Unified Clean Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-5 border-t border-slate-100 text-center sm:text-left">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                Intellectual Value
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCourse.intellectualValue}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                Structure &amp; Clarity
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCourse.structureClarity}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                Assessment Fairness
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCourse.assessmentFairness}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-500 font-medium">
                TA Support
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {activeCourse.taSupportScore}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium">
                Weekly Hours
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                ~{activeCourse.weeklyHours}h
              </div>
            </div>
          </div>
        </div>

        {/* Clean Sub-navigation Tabs */}
        <div className="px-6 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab("reviews")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "reviews"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Student Reviews ({courseReviews.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("changelog")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "changelog"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>School Changelog ({activeCourse.changelog.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("instructors-tas")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "instructors-tas"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Instructors &amp; TAs</span>
          </button>

          <button
            onClick={() => setActiveSubTab("overview")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === "overview"
                ? "border-slate-900 text-slate-900"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Guide</span>
          </button>
        </div>

        {/* 3. Tab Content */}
        <div className="p-6">
          {/* TAB A: REVIEWS */}
          {activeSubTab === "reviews" && (
            <div className="space-y-4">
              {/* Filter controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-slate-400 font-medium mr-1">
                    Topic:
                  </span>
                  {(
                    [
                      "All",
                      "Lectures",
                      "Assignments/Labs",
                      "Midterm/Final",
                      "TA & Tutorials",
                      "Course Infrastructure",
                    ] as const
                  ).map((comp) => (
                    <button
                      key={comp}
                      onClick={() => setSelectedComponent(comp)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        selectedComponent === comp
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {comp}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setHideLowSubstance(!hideLowSubstance)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1"
                >
                  {hideLowSubstance ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Filtered out {hiddenLowSubstanceCount} unhelpful rants</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                      <span>Showing all reviews</span>
                    </>
                  )}
                </button>
              </div>

              {/* Review Cards */}
              <div className="space-y-4">
                {courseReviews.map((review) => {
                  const voted = helpfulVotes[review.id] || false;
                  const isLowSubstance = review.substanceScore < 55;

                  return (
                    <div
                      key={review.id}
                      className={`p-5 rounded-xl border transition-all ${
                        isLowSubstance
                          ? "bg-rose-50/30 border-rose-200 border-dashed"
                          : "bg-white border-slate-200/90 shadow-2xs"
                      }`}
                    >
                      {/* Review Meta Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span
                            className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                              review.overallExperience === "Positive"
                                ? "bg-emerald-50 text-emerald-700"
                                : review.overallExperience ===
                                  "Mixed / Constructive"
                                ? "bg-amber-50 text-amber-800"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {review.overallExperience}
                          </span>
                          <span>•</span>
                          <span>{review.term}</span>
                          <span>•</span>
                          <span>{review.instructorName}</span>
                          {review.checkpointType && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400">
                                {review.checkpointType}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="font-medium text-slate-700">
                            Substance score: {review.substanceScore}/100
                          </span>
                        </div>
                      </div>

                      {/* Side-by-Side Review Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                        <div className="space-y-1.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-slate-500" />
                            <span>Advice for Future Students</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {review.studentAdvice}
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-500" />
                            <span>Constructive Note for Course Staff</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed">
                            {review.schoolFeedback}
                          </p>
                        </div>
                      </div>

                      {/* TA Note if present */}
                      {review.taFeedback && (
                        <div className="mt-3.5 p-3 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between gap-2">
                          <div className="text-slate-700">
                            <span className="font-semibold text-slate-900">
                              TA Feedback ({review.taName}):{" "}
                            </span>
                            {review.taFeedback}
                          </div>
                          {review.taName && (
                            <button
                              onClick={() => onNavigateToTA(review.taName!)}
                              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 underline shrink-0"
                            >
                              TA Profile →
                            </button>
                          )}
                        </div>
                      )}

                      {/* School Response if present */}
                      {review.schoolResponse && (
                        <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1">
                          <div className="flex items-center justify-between text-emerald-900 font-semibold">
                            <span>
                              School Action: {review.schoolResponse.status} (
                              {review.schoolResponse.responder})
                            </span>
                            <span className="text-[11px] font-normal text-emerald-700">
                              {review.schoolResponse.date}
                            </span>
                          </div>
                          <p className="text-emerald-800">
                            {review.schoolResponse.message}
                          </p>
                        </div>
                      )}

                      {/* Card Footer: Tags & Helpful Button */}
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                        <div className="flex flex-wrap gap-1.5">
                          {review.componentTags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setHelpfulVotes((prev) => ({
                              ...prev,
                              [review.id]: !prev[review.id],
                            }))
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                            voted
                              ? "bg-slate-900 text-white border-slate-900"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>
                            Helpful ({review.helpfulCount + (voted ? 1 : 0)})
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB B: CHANGELOG */}
          {activeSubTab === "changelog" && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Direct updates made by faculty and course coordinators in response to student reviews:
              </div>

              <div className="space-y-3">
                {activeCourse.changelog.map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                          {log.term}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {log.author}
                        </span>
                        <span className="text-xs text-slate-400">
                          ({log.role})
                        </span>
                      </div>
                      {log.impactMetric && (
                        <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          {log.impactMetric}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="font-semibold text-slate-700 block mb-0.5">
                          Student Issue Raised:
                        </span>
                        <p className="text-slate-600">{log.issueRaised}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                        <span className="font-semibold text-emerald-900 block mb-0.5">
                          Action Implemented by School:
                        </span>
                        <p className="text-emerald-800">{log.actionTaken}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB C: INSTRUCTORS & TAS */}
          {activeSubTab === "instructors-tas" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instructors */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Instructors
                </h3>
                {courseInstructors.map((inst) => (
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
                          {inst.deliveryMode} • {inst.pace}
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

              {/* TAs */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Teaching Assistants
                </h3>
                {courseTAs.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900">
                          {ta.name}
                        </div>
                        <div className="text-xs text-slate-500">{ta.role}</div>
                      </div>
                      <button
                        onClick={() => onNavigateToTA(ta.name)}
                        className="text-xs font-semibold text-slate-700 hover:text-slate-900 underline flex items-center gap-0.5"
                      >
                        Profile <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {ta.bio}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {ta.superpowers.slice(0, 2).map((sp, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-amber-50 text-amber-900 border border-amber-200/60 px-2 py-0.5 rounded font-medium"
                        >
                          ★ {sp.label}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB D: COURSE GUIDE (WHO THRIVES VS WATCH OUTS) */}
          {activeSubTab === "overview" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Who Thrives in {activeCourse.code}
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 mt-2">
                  {activeCourse.bestFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Things to Watch Out For
                </h3>
                <ul className="space-y-2 text-xs text-slate-600 mt-2">
                  {activeCourse.watchOutFor.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
