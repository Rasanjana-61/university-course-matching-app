// Hosted backend URL for Vercel deployment.
export const DEPLOYED_API_URL = "https://abc-self-psi.vercel.app/api";
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || DEPLOYED_API_URL).replace(/\/+$/, "");

export const LAN_API_URL = API_BASE_URL;

export const getApiUrl = (_useLan: boolean = true): string => {
  return API_BASE_URL;
};

export const api = {
  // Health check
  checkHealth: async () => {
    const res = await fetch(`${getApiUrl()}/health`);
    return res.json();
  },

  // Universities
  getUniversities: async (signal?: AbortSignal) => {
    const res = await fetch(`${getApiUrl()}/universities`, { cache: "no-store", signal });
    return res.json();
  },

  getUniversityById: async (id: number | string, signal?: AbortSignal) => {
    const res = await fetch(`${getApiUrl()}/universities/${id}`, { cache: "no-store", signal });
    return res.json();
  },

  createUniversity: async (data: {
    name: string;
    shortName: string;
    location: string;
    district: string;
    description?: string;
    website?: string;
    logoUrl?: string;
    backgroundImageUrl?: string;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/universities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error creating university: " + e.message };
    }
  },

  updateUniversity: async (
    id: number | string,
    data: {
      name: string;
      shortName: string;
      location: string;
      district: string;
      description?: string;
      website?: string;
      logoUrl?: string;
      backgroundImageUrl?: string;
    }
  ) => {
    try {
      const res = await fetch(`${getApiUrl()}/universities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error updating university: " + e.message };
    }
  },

  deleteUniversity: async (id: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/universities/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error deleting university: " + e.message };
    }
  },

  // Courses
  getCourses: async (params?: { stream?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.stream && params.stream !== "All" && params.stream !== "undefined" && params.stream !== "null") {
      query.append("stream", params.stream.trim());
    }
    if (params?.search && params.search.trim() && params.search !== "undefined" && params.search !== "null") {
      query.append("search", params.search.trim());
    }
    const qs = query.toString();
    const url = `${getApiUrl()}/courses${qs ? `?${qs}` : ""}`;
    const res = await fetch(url);
    return res.json();
  },

  getCourseById: async (id: number | string) => {
    const res = await fetch(`${getApiUrl()}/courses/${id}`);
    return res.json();
  },

  getCourseAdmissionRequirements: async (id: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/courses/${id}/admission`);
      return await res.json();
    } catch (e) {
      return { success: false, message: "Error fetching admission requirements" };
    }
  },

  createCourse: async (data: {
    universityId: number | string;
    name: string;
    code: string;
    stream: string;
    degreeType: string;
    durationYears?: number;
    minZScore?: number;
    districtCutoffs?: Record<string, number>;
    description?: string;
    careerPaths?: string[];
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error creating course: " + e.message };
    }
  },

  updateCourse: async (
    id: number | string,
    data: {
      universityId: number | string;
      name: string;
      code: string;
      stream: string;
      degreeType: string;
      durationYears?: number;
      minZScore?: number;
      districtCutoffs?: Record<string, number>;
      description?: string;
      careerPaths?: string[];
    }
  ) => {
    try {
      const res = await fetch(`${getApiUrl()}/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error updating course: " + e.message };
    }
  },

  deleteCourse: async (id: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/courses/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error deleting course: " + e.message };
    }
  },

  // Smart Matching
  matchCourses: async (data: {
    stream: string;
    zScore: number;
    district: string;
    interests?: string[];
    preferredLocations?: string[];
  }) => {
    const res = await fetch(`${getApiUrl()}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Auth APIs
  register: async (data: {
    fullName: string;
    email: string;
    password: string;
    stream?: string;
    district?: string;
    school?: string;
    zScore?: number;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to backend server. Please check your network.",
      };
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to backend server. Please check your network.",
      };
    }
  },

  getAuthProfile: async (token: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/me`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Network error fetching profile" };
    }
  },

  forgotPassword: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  verifyOtp: async (email: string, otp: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  resetPassword: async (data: { email: string; otp: string; newPassword: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return {
        success: false,
        message: "Cannot connect to server. Please try again later.",
      };
    }
  },

  // Student Profiles
  saveProfile: async (profile: {
    fullName: string;
    email: string;
    stream: string;
    zScore: number;
    district: string;
    school?: string;
    interests?: string[];
    preferredLocations?: string[];
    subjects?: { name: string; grade: string }[];
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error saving profile" };
    }
  },

  updateProfile: async (email: string, updates: {
    fullName?: string;
    school?: string;
    district?: string;
    interests?: string[];
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating profile" };
    }
  },

  getProfile: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching profile" };
    }
  },

  toggleSaveCourse: async (email: string, courseId: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/toggle-save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating saved course" };
    }
  },

  getSavedCourses: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}/saved-courses`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching saved courses" };
    }
  },

  deleteAccount: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/students/${encodeURIComponent(email)}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error deleting account" };
    }
  },

  // Scholarships APIs
  getScholarships: async (params?: { category?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (params?.category && params.category !== "All") query.append("category", params.category);
      if (params?.search) query.append("search", params.search);
      const url = `${getApiUrl()}/scholarships${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching scholarships" };
    }
  },

  getScholarshipById: async (id: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/scholarships/${id}`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching scholarship details" };
    }
  },

  createScholarship: async (data: {
    title: string;
    category: string;
    provider: string;
    eligibility: string;
    value: string;
    deadline: string;
    status?: string;
    description?: string;
    benefits?: string;
    requirements?: string;
    applicationInstructions?: string;
    officialSourceUrl?: string;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/scholarships`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error creating scholarship: " + error.message };
    }
  },

  updateScholarship: async (
    id: number | string,
    data: {
      title: string;
      category: string;
      provider: string;
      eligibility: string;
      value: string;
      deadline: string;
      status?: string;
      description?: string;
      benefits?: string;
      requirements?: string;
      applicationInstructions?: string;
      officialSourceUrl?: string;
    }
  ) => {
    try {
      const res = await fetch(`${getApiUrl()}/scholarships/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating scholarship: " + error.message };
    }
  },

  deleteScholarship: async (id: number | string) => {
    try {
      const res = await fetch(`${getApiUrl()}/scholarships/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error deleting scholarship: " + error.message };
    }
  },

  // Admin APIs
  adminRegister: async (data: { fullName: string; email: string; password: string; school?: string; subject?: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Cannot connect to server. Please try again." };
    }
  },

  adminLogin: async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Cannot connect to server. Please try again." };
    }
  },

  getAdminDashboard: async (token: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching dashboard data." };
    }
  },

  getAdminStudents: async (token: string, filters?: { stream?: string; district?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (filters?.stream) query.append("stream", filters.stream);
      if (filters?.district) query.append("district", filters.district);
      if (filters?.search) query.append("search", filters.search);
      const url = `${getApiUrl()}/admin/students${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching students." };
    }
  },

  // Assessment Questions CRUD
  getQuestions: async () => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/questions`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching questions." };
    }
  },

  createQuestion: async (token: string, data: { text: string; category: string; sortOrder?: number }) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error adding question." };
    }
  },

  updateQuestion: async (
    token: string,
    id: number,
    data: { text: string; category: string; sortOrder?: number; isActive?: boolean }
  ) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error updating question." };
    }
  },

  deleteQuestion: async (token: string, id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/admin/questions/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error deleting question." };
    }
  },

  // Inquiries / Messages APIs
  createInquiry: async (data: {
    studentEmail: string;
    studentName?: string;
    category: string;
    subject: string;
    message: string;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Could not submit inquiry. Check network." };
    }
  },

  getMyInquiries: async (email: string) => {
    try {
      const res = await fetch(`${getApiUrl()}/inquiries/my?email=${encodeURIComponent(email)}`);
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching your inquiries." };
    }
  },

  getAdminInquiries: async (token: string, filters?: { status?: string; category?: string; search?: string }) => {
    try {
      const query = new URLSearchParams();
      if (filters?.status) query.append("status", filters.status);
      if (filters?.category) query.append("category", filters.category);
      if (filters?.search) query.append("search", filters.search);
      const url = `${getApiUrl()}/inquiries${query.toString() ? `?${query.toString()}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error fetching inquiries." };
    }
  },

  replyToInquiry: async (token: string, id: number, reply: string, status: string = "Replied") => {
    try {
      const res = await fetch(`${getApiUrl()}/inquiries/${id}/reply`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reply, status }),
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error sending reply." };
    }
  },

  deleteInquiry: async (id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/inquiries/${id}`, {
        method: "DELETE",
      });
      return await res.json();
    } catch (error: any) {
      return { success: false, message: "Error deleting inquiry." };
    }
  },

  // Backward compatibility aliases
  teacherRegister: async (data: any) => api.adminRegister(data),
  teacherLogin: async (creds: any) => api.adminLogin(creds),
  getTeacherDashboard: async (tok: string) => api.getAdminDashboard(tok),
  getTeacherStudents: async (tok: string, filt: any) => api.getAdminStudents(tok, filt),

  // ─── Notifications ────────────────────────────────────────────────────────
  getNotifications: async (stream?: string) => {
    try {
      const query = stream && stream !== "all" ? `?stream=${encodeURIComponent(stream)}` : "";
      const res = await fetch(`${getApiUrl()}/notifications${query}`, { cache: "no-store" });
      return await res.json();
    } catch (e: any) {
      return { success: false, data: [], message: "Unable to load announcements. Please check your connection." };
    }
  },

  getNotificationCount: async () => {
    try {
      const res = await fetch(`${getApiUrl()}/notifications/unread-count`, { cache: "no-store" });
      return await res.json();
    } catch (e: any) {
      return { success: false, count: 0 };
    }
  },

  createNotification: async (data: {
    title: string;
    message: string;
    type?: string;
    targetStream?: string | null;
    isPinned?: boolean;
  }) => {
    try {
      const res = await fetch(`${getApiUrl()}/notifications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error creating notification." };
    }
  },

  updateNotification: async (
    id: number,
    data: { title?: string; message?: string; type?: string; targetStream?: string | null; isPinned?: boolean }
  ) => {
    try {
      const res = await fetch(`${getApiUrl()}/notifications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error updating notification." };
    }
  },

  deleteNotification: async (id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/notifications/${id}`, { method: "DELETE" });
      return await res.json();
    } catch (e: any) {
      return { success: false, message: "Error deleting notification." };
    }
  },

  // ─── Student Personal Notifications (inbox) ───────────────────────────────
  getStudentNotifications: async (email: string) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/student-notifications?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, data: [] };
    }
  },

  getStudentUnreadCount: async (email: string) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/student-notifications/unread-count?email=${encodeURIComponent(email)}`,
        { cache: "no-store" }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false, count: 0 };
    }
  },

  markStudentNotificationRead: async (id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/student-notifications/${id}/read`, {
        method: "PUT",
      });
      return await res.json();
    } catch (e: any) {
      return { success: false };
    }
  },

  markAllStudentNotificationsRead: async (email: string) => {
    try {
      const res = await fetch(
        `${getApiUrl()}/student-notifications/mark-all-read?email=${encodeURIComponent(email)}`,
        { method: "PUT" }
      );
      return await res.json();
    } catch (e: any) {
      return { success: false };
    }
  },
};

