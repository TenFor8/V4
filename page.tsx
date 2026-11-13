"use client";

import React, { useState, useEffect } from "react";
import {
  INITIAL_COURSES,
  INITIAL_DEPARTMENT_ISSUES,
  INITIAL_INSTRUCTORS,
  INITIAL_REVIEWS,
  INITIAL_TAS,
} from "@/data/mockData";
import { Course, DepartmentIssue, Review, TAProfile } from "@/types";
import StudentCourseExplorer from "@/components/StudentCourseExplorer";
import TAAndInstructorHub from "@/components/TAAndInstructorHub";
import SchoolBackendDashboard from "@/components/SchoolBackendDashboard";
import GuidedReviewModal from "@/components/GuidedReviewModal";
import {
  Compass,
  GraduationCap,
  Building2,
  Plus,
  CheckCircle2,
  Sun,
  Moon,
} from "lucide-react";

type ActiveTab = "student-explorer" | "ta-instructor-hub" | "school-backend";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("student-explorer");
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [instructors] = useState(INITIAL_INSTRUCTORS);
  const [tas, setTas] = useState<TAProfile[]>(INITIAL_TAS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [issues, setIssues] = useState<DepartmentIssue[]>(
    INITIAL_DEPARTMENT_ISSUES
  );

  const [selectedCourseId, setSelectedCourseId] = useState<string>("cs246");
  const [selectedTAName, setSelectedTAName] = useState<string | null>(
    "Maya Chen"
  );
  const [highlightedIssueId, setHighlightedIssueId] = useState<string | null>(
    null
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [modalCourseCode, setModalCourseCode] = useState<string>("CS 246");
  const [modalTAName, setModalTAName] = useState<string>("Maya Chen");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("courseglide_theme");
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
        setIsDarkMode(true);
        document.documentElement.classList.add("dark");
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Fallback for SSR / restricted storage
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      try {
        if (next) {
          document.documentElement.classList.add("dark");
          localStorage.setItem("courseglide_theme", "dark");
        } else {
          document.documentElement.classList.remove("dark");
          localStorage.setItem("courseglide_theme", "light");
        }
      } catch {
        // Fallback
      }
      return next;
    });
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenReviewModal = (courseCode?: string, taName?: string) => {
    if (courseCode) setModalCourseCode(courseCode);
    if (taName) setModalTAName(taName);
    setIsReviewModalOpen(true);
  };

  const handleNavigateToTA = (taName: string) => {
    setSelectedTAName(taName);
    setActiveTab("ta-instructor-hub");
  };

  const handleNavigateToBackendIssue = (issueId?: string) => {
    if (issueId) setHighlightedIssueId(issueId);
    setActiveTab("school-backend");
  };

  const handleJumpToCourse = (courseCode: string) => {
    const found = courses.find((c) => c.code === courseCode);
    if (found) {
      setSelectedCourseId(found.id);
      setActiveTab("student-explorer");
    }
  };

  const handleToggleTAPublic = (taId: string) => {
    setTas((prev) =>
      prev.map((ta) =>
        ta.id === taId ? { ...ta, isPublicOptIn: !ta.isPublicOptIn } : ta
      )
    );
    triggerToast("Updated TA portfolio visibility.");
  };

  const handleToggleEndorsementPublic = (
    taId: string,
    endorsementId: string
  ) => {
    setTas((prev) =>
      prev.map((ta) =>
        ta.id === taId
          ? {
              ...ta,
              studentEndorsements: ta.studentEndorsements.map((e) =>
                e.id === endorsementId ? { ...e, isPublic: !e.isPublic } : e
              ),
            }
          : ta
      )
    );
  };

  const handleResolveIssue = (
    issueId: string,
    newStatus: DepartmentIssue["status"],
    resolutionText: string,
    responderRole: string
  ) => {
    const targetIssue = issues.find((i) => i.id === issueId);
    if (!targetIssue) return;

    setIssues((prev) =>
      prev.map((iss) =>
        iss.id === issueId
          ? {
              ...iss,
              status: newStatus,
              officialResolution: resolutionText,
              updatedBy: responderRole,
            }
          : iss
      )
    );

    setCourses((prev) =>
      prev.map((course) => {
        if (course.code !== targetIssue.courseCode) return course;
        const newLog = {
          id: `cl-${Date.now()}`,
          term: "Fall 2026",
          author: responderRole,
          role: "Department Action",
          issueRaised: `${targetIssue.title} (${targetIssue.mentionCount} reviews)`,
          actionTaken: resolutionText,
          impactMetric:
            newStatus === "Addressed in Curriculum"
              ? "Resolved in Curriculum"
              : "In Progress",
        };
        return {
          ...course,
          changelog: [newLog, ...course.changelog],
        };
      })
    );

    setReviews((prev) =>
      prev.map((rev) =>
        rev.linkedIssueId === issueId
          ? {
              ...rev,
              schoolResponse: {
                responder: responderRole,
                role: `${targetIssue.courseCode} Course Team`,
                date: "Recent update",
                message: resolutionText,
                status:
                  newStatus === "Addressed in Curriculum"
                    ? "Addressed"
                    : "In Progress",
              },
            }
          : rev
      )
    );

    triggerToast(
      `Published update to ${targetIssue.courseCode} course page.`
    );
  };

  const handleSubmitReview = (
    newReview: Review,
    newTAEndorsement?: { taName: string; quote: string; context: string },
    newTAPrivateTip?: { taName: string; note: string; actionableTip: string },
    autoCreateBackendIssue?: {
      courseCode: string;
      title: string;
      summary: string;
      quote: string;
    }
  ) => {
    let createdIssueId: string | undefined = undefined;

    if (autoCreateBackendIssue) {
      createdIssueId = `iss-${Date.now()}`;
      const newIssue: DepartmentIssue = {
        id: createdIssueId,
        courseCode: autoCreateBackendIssue.courseCode,
        title: autoCreateBackendIssue.title,
        category: "Assessment Alignment",
        severity: "High",
        mentionCount: 1,
        termsAffected: ["Fall 2026"],
        aiSynthesizedSummary: autoCreateBackendIssue.summary,
        sampleQuotes: [autoCreateBackendIssue.quote],
        recommendedAction:
          "Review assessment rubrics and pacing checkpoints.",
        status: "Needs Action",
      };
      setIssues((prev) => [newIssue, ...prev]);
    }

    const reviewWithLink: Review = {
      ...newReview,
      linkedIssueId: createdIssueId,
    };

    setReviews((prev) => [reviewWithLink, ...prev]);

    if (newTAEndorsement || newTAPrivateTip) {
      setTas((prev) =>
        prev.map((ta) => {
          const matchesEndorsement =
            newTAEndorsement && ta.name === newTAEndorsement.taName;
          const matchesPrivate =
            newTAPrivateTip && ta.name === newTAPrivateTip.taName;

          if (!matchesEndorsement && !matchesPrivate) return ta;

          return {
            ...ta,
            metrics: {
              ...ta.metrics,
              totalReviews: ta.metrics.totalReviews + 1,
            },
            studentEndorsements: matchesEndorsement
              ? [
                  {
                    id: `end-${Date.now()}`,
                    courseCode: newReview.courseCode,
                    term: "Fall 2026",
                    quote: newTAEndorsement!.quote,
                    context: newTAEndorsement!.context,
                    isPublic: true,
                  },
                  ...ta.studentEndorsements,
                ]
              : ta.studentEndorsements,
            privateConstructiveFeedback: matchesPrivate
              ? [
                  {
                    id: `priv-${Date.now()}`,
                    courseCode: newReview.courseCode,
                    term: "Fall 2026",
                    note: newTAPrivateTip!.note,
                    actionableTip: newTAPrivateTip!.actionableTip,
                  },
                  ...ta.privateConstructiveFeedback,
                ]
              : ta.privateConstructiveFeedback,
          };
        })
      );
    }

    const matchedCourse = courses.find((c) => c.code === newReview.courseCode);
    if (matchedCourse) {
      setSelectedCourseId(matchedCourse.id);
    }

    triggerToast(
      `Review published (${newReview.substanceScore}/100 substance score).`
    );
  };

  const pendingIssuesCount = issues.filter(
    (i) => i.status === "Needs Action"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Clean, Minimalist Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="brand-logo-badge dark-mode-skip w-8 h-8 rounded-lg bg-slate-900 text-amber-400 font-black text-sm flex items-center justify-center tracking-tight">
              CG
            </span>
            <div>
              <span className="font-bold text-base tracking-tight text-slate-900">
                Course<span className="text-amber-500">Glide</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-slate-400 font-normal">
                UW Course &amp; TA Reviews
              </span>
            </div>
          </div>

          {/* Clean Segmented Navigation */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            <button
              onClick={() => setActiveTab("student-explorer")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "student-explorer"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-slate-500" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => setActiveTab("ta-instructor-hub")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "ta-instructor-hub"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
              <span>TAs &amp; Instructors</span>
            </button>

            <button
              onClick={() => setActiveTab("school-backend")}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === "school-backend"
                  ? "bg-white text-slate-900 shadow-xs font-semibold"
                  : "hover:text-slate-900"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>School Dashboard</span>
              {pendingIssuesCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-bold">
                  {pendingIssuesCount}
                </span>
              )}
            </button>
          </nav>

          {/* Header Actions (Theme Toggle & Primary Action) */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center shrink-0"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            <button
              onClick={() => handleOpenReviewModal("CS 246")}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>Write Review</span>
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="dark-mode-skip fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-medium border border-slate-800 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === "student-explorer" && (
          <StudentCourseExplorer
            courses={courses}
            instructors={instructors}
            tas={tas}
            reviews={reviews}
            selectedCourseId={selectedCourseId}
            onSelectCourse={setSelectedCourseId}
            onOpenReviewModal={(code) => handleOpenReviewModal(code)}
            onNavigateToTA={handleNavigateToTA}
            onNavigateToBackendIssue={handleNavigateToBackendIssue}
          />
        )}

        {activeTab === "ta-instructor-hub" && (
          <TAAndInstructorHub
            tas={tas}
            instructors={instructors}
            selectedTAName={selectedTAName}
            onSelectTAName={setSelectedTAName}
            onToggleTAPublic={handleToggleTAPublic}
            onToggleEndorsementPublic={handleToggleEndorsementPublic}
            onOpenReviewModal={handleOpenReviewModal}
          />
        )}

        {activeTab === "school-backend" && (
          <SchoolBackendDashboard
            issues={issues}
            courses={courses}
            highlightedIssueId={highlightedIssueId}
            onResolveIssue={handleResolveIssue}
            onJumpToCourse={handleJumpToCourse}
          />
        )}
      </main>
    </div>
  );
}
