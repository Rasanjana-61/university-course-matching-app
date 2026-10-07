import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  RefreshControl,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Brand } from "../constants/theme";
import { useApp } from "../context/AppContext";
import { api } from "../services/api";

type AdminTab = "universities" | "courses" | "scholarships" | "questions" | "inquiries" | "students" | "overview" | "announcements";

const sriLankanDistricts = [
  "Colombo", "Gampaha", "Kalutara", "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota", "Jaffna", "Kilinochchi", "Mannar",
  "Vavuniya", "Mullaitivu", "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam", "Anuradhapura", "Polonnaruwa", "Badulla",
  "Monaragala", "Ratnapura", "Kegalle"
];

const streamsList = [
  "Physical Science",
  "Biological Science",
  "Commerce",
  "Arts",
  "Technology"
];

const degreeTypesList = [
  "B.Sc. (Hons)",
  "B.Sc.",
  "B.A. (Hons)",
  "B.Com",
  "B.Tech",
  "MBBS",
  "LLB",
  "BBA",
  "B.Eng"
];

const scholarshipCategoriesList = [
  "University",
  "Merit",
  "Need-based",
  "Corporate"
];

export const AdminDashboardScreen: React.FC = () => {
  const { adminData, adminToken, adminLogout } = useApp();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AdminTab>("universities");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- Universities state ---
  const [universities, setUniversities] = useState<any[]>([]);
  const [universitiesLoading, setUniversitiesLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniModalVisible, setUniModalVisible] = useState(false);
  const [editingUni, setEditingUni] = useState<any | null>(null);
  const [uniName, setUniName] = useState("");
  const [uniShortName, setUniShortName] = useState("");
  const [uniLocation, setUniLocation] = useState("");
  const [uniDistrict, setUniDistrict] = useState("Colombo");
  const [uniWebsite, setUniWebsite] = useState("");
  const [uniLogoUrl, setUniLogoUrl] = useState("");
  const [uniDescription, setUniDescription] = useState("");
  const [savingUni, setSavingUni] = useState(false);

  // --- Courses state ---
  const [courses, setCourses] = useState<any[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseStreamFilter, setCourseStreamFilter] = useState("");
  const [courseModalVisible, setCourseModalVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [courseUniId, setCourseUniId] = useState<string>("");
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [courseStream, setCourseStream] = useState("Physical Science");
  const [courseDegreeType, setCourseDegreeType] = useState("B.Sc. (Hons)");
  const [courseDurationYears, setCourseDurationYears] = useState("4");
  const [courseMinZScore, setCourseMinZScore] = useState("1.5000");
  const [courseDescription, setCourseDescription] = useState("");
  const [courseCareerPaths, setCourseCareerPaths] = useState("");
  const [savingCourse, setSavingCourse] = useState(false);

  // --- Scholarships state ---
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [scholarshipsLoading, setScholarshipsLoading] = useState(false);
  const [scholarshipSearch, setScholarshipSearch] = useState("");
  const [scholarshipCategoryFilter, setScholarshipCategoryFilter] = useState("");
  const [scholarshipModalVisible, setScholarshipModalVisible] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<any | null>(null);
  const [schTitle, setSchTitle] = useState("");
  const [schCategory, setSchCategory] = useState("University");
  const [schProvider, setSchProvider] = useState("");
  const [schEligibility, setSchEligibility] = useState("");
  const [schValue, setSchValue] = useState("");
  const [schDeadline, setSchDeadline] = useState("");
  const [schStatus, setSchStatus] = useState("Open");
  const [schDescription, setSchDescription] = useState("");
  const [schBenefits, setSchBenefits] = useState("");
  const [schRequirements, setSchRequirements] = useState("");
  const [schApplicationInstructions, setSchApplicationInstructions] = useState("");
  const [schOfficialSourceUrl, setSchOfficialSourceUrl] = useState("");
  const [savingScholarship, setSavingScholarship] = useState(false);

  // --- Questions state ---
  const [questions, setQuestions] = useState<any[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Technology");
  const [sortOrder, setSortOrder] = useState("1");
  const [savingQuestion, setSavingQuestion] = useState(false);

  // --- Inquiries state ---
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(false);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("");
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // --- Students state ---
  const [students, setStudents] = useState<any[]>([]);
  const [searchStudent, setSearchStudent] = useState("");
  const [filterStream, setFilterStream] = useState("");

  // --- Overview state ---
  const [dashData, setDashData] = useState<any>(null);

  // --- Announcements (Notifications) state ---
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any | null>(null);
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annType, setAnnType] = useState("info");
  const [annTargetStream, setAnnTargetStream] = useState("");
  const [annIsPinned, setAnnIsPinned] = useState(false);
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementListError, setAnnouncementListError] = useState("");
  const [announcementNotice, setAnnouncementNotice] = useState("");
  const [announcementToDelete, setAnnouncementToDelete] = useState<any | null>(null);

  const categories = ["Technology", "Business", "Creative", "Social"];
  const studentStreamFilters = ["", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"];

  // --- Loaders ---
  const loadUniversities = useCallback(async () => {
    setUniversitiesLoading(true);
    try {
      const res = await api.getUniversities();
      if (res && res.success) {
        setUniversities(res.data || []);
      }
    } catch (e) {
      console.log("Error loading universities:", e);
    } finally {
      setUniversitiesLoading(false);
    }
  }, []);

  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const res = await api.getCourses({
        stream: courseStreamFilter || undefined,
        search: courseSearch || undefined,
      });
      if (res && res.success) {
        setCourses(res.data || []);
      }
    } catch (e) {
      console.log("Error loading courses:", e);
    } finally {
      setCoursesLoading(false);
    }
  }, [courseStreamFilter, courseSearch]);

  const loadScholarships = useCallback(async () => {
    setScholarshipsLoading(true);
    try {
      const res = await api.getScholarships({
        category: scholarshipCategoryFilter || undefined,
        search: scholarshipSearch || undefined,
      });
      if (res && res.data) {
        setScholarships(res.data || []);
      }
    } catch (e) {
      console.log("Error loading scholarships:", e);
    } finally {
      setScholarshipsLoading(false);
    }
  }, [scholarshipCategoryFilter, scholarshipSearch]);

  const loadQuestions = useCallback(async () => {
    setQuestionsLoading(true);
    try {
      const res = await api.getQuestions();
      if (res && res.success) setQuestions(res.data || []);
    } catch (e) {
      console.log("Error loading questions:", e);
    } finally {
      setQuestionsLoading(false);
    }
  }, []);

  const loadInquiries = useCallback(async () => {
    if (!adminToken) return;
    setInquiriesLoading(true);
    try {
      const res = await api.getAdminInquiries(adminToken, {
        status: inquiryStatusFilter || undefined,
        search: inquirySearch || undefined,
      });
      if (res && res.success) setInquiries(res.data || []);
    } catch (e) {
      console.log("Error loading inquiries:", e);
    } finally {
      setInquiriesLoading(false);
    }
  }, [adminToken, inquiryStatusFilter, inquirySearch]);

  const loadOverview = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await api.getAdminDashboard(adminToken);
      if (res && res.success) setDashData(res.data);
    } catch (e) {
      console.log("Error loading dashboard:", e);
    }
  }, [adminToken]);

  const loadStudents = useCallback(async () => {
    if (!adminToken) return;
    try {
      const res = await api.getAdminStudents(adminToken, {
        stream: filterStream || undefined,
        search: searchStudent || undefined,
      });
      if (res && res.success) setStudents(res.data || []);
    } catch (e) {
      console.log("Error loading students:", e);
    }
  }, [adminToken, filterStream, searchStudent]);

  const loadAnnouncements = useCallback(async () => {
    setAnnouncementsLoading(true);
    setAnnouncementListError("");
    try {
      const res = await api.getNotifications();
      if (res?.success) setAnnouncements(res.data || []);
      else setAnnouncementListError(res?.message || "Unable to load announcements. Please try again.");
    } catch (e) {
      setAnnouncementListError("Unable to load announcements. Please check your connection.");
      console.log("Error loading announcements:", e);
    } finally {
      setAnnouncementsLoading(false);
    }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      loadUniversities(),
      loadCourses(),
      loadScholarships(),
      loadQuestions(),
      loadInquiries(),
      loadOverview(),
      loadStudents(),
      loadAnnouncements(),
    ]);
    setLoading(false);
  }, [loadUniversities, loadCourses, loadScholarships, loadQuestions, loadInquiries, loadOverview, loadStudents, loadAnnouncements]);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (activeTab === "universities") loadUniversities();
    if (activeTab === "courses") loadCourses();
    if (activeTab === "scholarships") loadScholarships();
    if (activeTab === "students") loadStudents();
    if (activeTab === "inquiries") loadInquiries();
    if (activeTab === "announcements") loadAnnouncements();
  }, [activeTab, courseStreamFilter, courseSearch, scholarshipCategoryFilter, scholarshipSearch, filterStream, searchStudent, inquiryStatusFilter, inquirySearch]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  // --- Universities CRUD Handlers ---
  const openCreateUniModal = () => {
    setEditingUni(null);
    setUniName("");
    setUniShortName("");
    setUniLocation("");
    setUniDistrict("Colombo");
    setUniWebsite("");
    setUniLogoUrl("");
    setUniDescription("");
    setUniModalVisible(true);
  };

  const openEditUniModal = (uni: any) => {
    setEditingUni(uni);
    setUniName(uni.name || "");
    setUniShortName(uni.short_name || "");
    setUniLocation(uni.location || "");
    setUniDistrict(uni.district || "Colombo");
    setUniWebsite(uni.website || "");
    setUniLogoUrl(uni.logo_url || "");
    setUniDescription(uni.description || "");
    setUniModalVisible(true);
  };

  const handleSaveUniversity = async () => {
    if (!uniName.trim()) {
      Alert.alert("Required", "Please enter the university name.");
      return;
    }
    if (!uniShortName.trim()) {
      Alert.alert("Required", "Please enter the short code (e.g. UOM).");
      return;
    }
    if (!uniLocation.trim() || !uniDistrict.trim()) {
      Alert.alert("Required", "Please provide location and district.");
      return;
    }

    setSavingUni(true);
    try {
      const payload = {
        name: uniName.trim(),
        shortName: uniShortName.trim().toUpperCase(),
        location: uniLocation.trim(),
        district: uniDistrict.trim(),
        website: uniWebsite.trim() || undefined,
        logoUrl: uniLogoUrl.trim() || undefined,
        description: uniDescription.trim() || undefined,
      };

      if (editingUni) {
        const res = await api.updateUniversity(editingUni.id, payload);
        if (res && res.success) {
          Alert.alert("Success", "University details updated successfully!");
          setUniModalVisible(false);
          loadUniversities();
        } else {
          Alert.alert("Error", res?.message || "Failed to update university.");
        }
      } else {
        const res = await api.createUniversity(payload);
        if (res && res.success) {
          Alert.alert("Success", "New university registered successfully!");
          setUniModalVisible(false);
          loadUniversities();
        } else {
          Alert.alert("Error", res?.message || "Failed to create university.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error occurred.");
    } finally {
      setSavingUni(false);
    }
  };

  const handleDeleteUniversity = (id: number, name: string) => {
    Alert.alert(
      "Delete University",
      `Are you sure you want to delete "${name}"?\n\nWARNING: All courses linked to this university will also be removed!`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete University",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteUniversity(id);
              if (res && res.success) {
                Alert.alert("Deleted", "University removed successfully.");
                loadUniversities();
                loadCourses();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete university.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Courses CRUD Handlers ---
  const openCreateCourseModal = () => {
    setEditingCourse(null);
    setCourseUniId(universities.length > 0 ? String(universities[0].id) : "");
    setCourseName("");
    setCourseCode("");
    setCourseStream("Physical Science");
    setCourseDegreeType("B.Sc. (Hons)");
    setCourseDurationYears("4");
    setCourseMinZScore("1.5000");
    setCourseDescription("");
    setCourseCareerPaths("");
    setCourseModalVisible(true);
  };

  const openEditCourseModal = (c: any) => {
    setEditingCourse(c);
    setCourseUniId(String(c.university_id));
    setCourseName(c.name || "");
    setCourseCode(c.code || "");
    setCourseStream(c.stream || "Physical Science");
    setCourseDegreeType(c.degree_type || "B.Sc. (Hons)");
    setCourseDurationYears(String(c.duration_years || 4));
    setCourseMinZScore(String(c.min_z_score || "0.0000"));
    setCourseDescription(c.description || "");
    setCourseCareerPaths(Array.isArray(c.career_paths) ? c.career_paths.join(", ") : "");
    setCourseModalVisible(true);
  };

  const handleSaveCourse = async () => {
    if (!courseUniId) {
      Alert.alert("Required", "Please select a university.");
      return;
    }
    if (!courseName.trim()) {
      Alert.alert("Required", "Please enter the course name.");
      return;
    }
    if (!courseCode.trim()) {
      Alert.alert("Required", "Please enter a course code (e.g. CS01).");
      return;
    }
    if (!courseStream.trim()) {
      Alert.alert("Required", "Please select an A/L stream.");
      return;
    }

    setSavingCourse(true);
    try {
      const careerPathsArr = courseCareerPaths
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        universityId: parseInt(String(courseUniId)),
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        stream: courseStream.trim(),
        degreeType: courseDegreeType.trim(),
        durationYears: parseInt(courseDurationYears) || 4,
        minZScore: parseFloat(courseMinZScore) || 0.0,
        description: courseDescription.trim(),
        careerPaths: careerPathsArr,
      };

      if (editingCourse) {
        const res = await api.updateCourse(editingCourse.id, payload);
        if (res && res.success) {
          Alert.alert("Success", "Course updated successfully!");
          setCourseModalVisible(false);
          loadCourses();
        } else {
          Alert.alert("Error", res?.message || "Failed to update course.");
        }
      } else {
        const res = await api.createCourse(payload);
        if (res && res.success) {
          Alert.alert("Success", "New course added successfully!");
          setCourseModalVisible(false);
          loadCourses();
        } else {
          Alert.alert("Error", res?.message || "Failed to create course.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error occurred.");
    } finally {
      setSavingCourse(false);
    }
  };

  const handleDeleteCourse = (id: number, name: string) => {
    Alert.alert(
      "Delete Course",
      `Are you sure you want to delete course "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete Course",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteCourse(id);
              if (res && res.success) {
                Alert.alert("Deleted", "Course removed successfully.");
                loadCourses();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete course.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Scholarships CRUD Handlers ---
  const openCreateScholarshipModal = () => {
    setEditingScholarship(null);
    setSchTitle("");
    setSchCategory("University");
    setSchProvider("");
    setSchEligibility("");
    setSchValue("");
    setSchDeadline("");
    setSchStatus("Open");
    setSchDescription("");
    setSchBenefits("");
    setSchRequirements("");
    setSchApplicationInstructions("");
    setSchOfficialSourceUrl("");
    setScholarshipModalVisible(true);
  };

  const openEditScholarshipModal = (s: any) => {
    setEditingScholarship(s);
    setSchTitle(s.title || "");
    setSchCategory(s.category || "University");
    setSchProvider(s.provider || "");
    setSchEligibility(s.eligibility || "");
    setSchValue(s.value || "");
    setSchDeadline(s.deadline || "");
    setSchStatus(s.status || "Open");
    setSchDescription(s.description || "");
    setSchBenefits(s.benefits || "");
    setSchRequirements(s.requirements || "");
    setSchApplicationInstructions(s.application_instructions || "");
    setSchOfficialSourceUrl(s.official_source_url || "");
    setScholarshipModalVisible(true);
  };

  const handleSaveScholarship = async () => {
    if (!schTitle.trim()) {
      Alert.alert("Required", "Please enter scholarship title.");
      return;
    }
    if (!schProvider.trim()) {
      Alert.alert("Required", "Please enter scholarship provider.");
      return;
    }
    if (!schEligibility.trim()) {
      Alert.alert("Required", "Please enter eligibility criteria.");
      return;
    }
    if (!schValue.trim()) {
      Alert.alert("Required", "Please enter financial value/coverage.");
      return;
    }
    if (!schDeadline.trim()) {
      Alert.alert("Required", "Please enter application deadline.");
      return;
    }

    setSavingScholarship(true);
    try {
      const payload = {
        title: schTitle.trim(),
        category: schCategory,
        provider: schProvider.trim(),
        eligibility: schEligibility.trim(),
        value: schValue.trim(),
        deadline: schDeadline.trim(),
        status: schStatus,
        description: schDescription.trim(),
        benefits: schBenefits.trim(),
        requirements: schRequirements.trim(),
        applicationInstructions: schApplicationInstructions.trim(),
        officialSourceUrl: schOfficialSourceUrl.trim(),
      };

      if (editingScholarship) {
        const res = await api.updateScholarship(editingScholarship.id, payload);
        if (res && res.success) {
          Alert.alert("Success", "Scholarship updated successfully!");
          setScholarshipModalVisible(false);
          loadScholarships();
        } else {
          Alert.alert("Error", res?.message || "Failed to update scholarship.");
        }
      } else {
        const res = await api.createScholarship(payload);
        if (res && res.success) {
          Alert.alert("Success", "New scholarship published successfully!");
          setScholarshipModalVisible(false);
          loadScholarships();
        } else {
          Alert.alert("Error", res?.message || "Failed to create scholarship.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error occurred.");
    } finally {
      setSavingScholarship(false);
    }
  };

  const handleDeleteScholarship = (id: number, title: string) => {
    Alert.alert(
      "Delete Scholarship",
      `Are you sure you want to delete scholarship "${title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await api.deleteScholarship(id);
              if (res && res.success) {
                Alert.alert("Deleted", "Scholarship removed successfully.");
                loadScholarships();
              } else {
                Alert.alert("Error", res?.message || "Failed to delete scholarship.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Network request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Questions Handlers ---
  const openCreateModal = () => {
    setEditingQuestion(null);
    setQuestionText("");
    setQuestionCategory("Technology");
    setSortOrder(String(questions.length + 1));
    setModalVisible(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestion(q);
    setQuestionText(q.text);
    setQuestionCategory(q.category);
    setSortOrder(String(q.sort_order || 1));
    setModalVisible(true);
  };

  const handleSaveQuestion = async () => {
    if (!questionText.trim()) {
      Alert.alert("Required", "Please enter the question text.");
      return;
    }
    if (!adminToken) {
      Alert.alert("Unauthorized", "Admin token not found. Please log in again.");
      return;
    }

    setSavingQuestion(true);
    try {
      if (editingQuestion) {
        const res = await api.updateQuestion(adminToken, editingQuestion.id, {
          text: questionText.trim(),
          category: questionCategory,
          sortOrder: parseInt(sortOrder) || 1,
        });
        if (res.success) {
          Alert.alert("Success", "Question updated successfully!");
          setModalVisible(false);
          loadQuestions();
        } else {
          Alert.alert("Error", res.message || "Failed to update question.");
        }
      } else {
        const res = await api.createQuestion(adminToken, {
          text: questionText.trim(),
          category: questionCategory,
          sortOrder: parseInt(sortOrder) || questions.length + 1,
        });
        if (res.success) {
          Alert.alert("Success", "New question added to assessment!");
          setModalVisible(false);
          loadQuestions();
        } else {
          Alert.alert("Error", res.message || "Failed to create question.");
        }
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network request failed.");
    } finally {
      setSavingQuestion(false);
    }
  };

  const handleDeleteQuestion = (id: number, text: string) => {
    Alert.alert(
      "Delete Question",
      `Are you sure you want to delete this question?\n\n"${text.slice(0, 50)}..."`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!adminToken) return;
            try {
              const res = await api.deleteQuestion(adminToken, id);
              if (res.success) {
                Alert.alert("Deleted", "Question was removed successfully.");
                loadQuestions();
              } else {
                Alert.alert("Error", res.message || "Could not delete question.");
              }
            } catch (e: any) {
              Alert.alert("Error", e.message || "Delete request failed.");
            }
          },
        },
      ]
    );
  };

  // --- Inquiries Handlers ---
  const openReplyModal = (inq: any) => {
    setSelectedInquiry(inq);
    setReplyText(inq.admin_reply || "");
    setReplyModalVisible(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      Alert.alert("Required", "Please write a response before sending.");
      return;
    }
    if (!adminToken || !selectedInquiry) return;

    setSendingReply(true);
    try {
      const res = await api.replyToInquiry(adminToken, selectedInquiry.id, replyText.trim(), "Replied");
      if (res && res.success) {
        Alert.alert("Reply Sent", "Your response has been sent to the student!");
        setReplyModalVisible(false);
        loadInquiries();
      } else {
        Alert.alert("Error", res?.message || "Failed to send response.");
      }
    } catch (e: any) {
      Alert.alert("Error", e.message || "Network error.");
    } finally {
      setSendingReply(false);
    }
  };

  const handleCloseInquiry = (id: number) => {
    Alert.alert("Close Inquiry", "Mark this student inquiry as Closed/Resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Mark Closed",
        onPress: async () => {
          if (!adminToken) return;
          try {
            await api.replyToInquiry(adminToken, id, selectedInquiry?.admin_reply || "Inquiry resolved.", "Closed");
            loadInquiries();
          } catch (e) {
            console.log(e);
          }
        },
      },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out from the Admin Panel?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign Out", style: "destructive", onPress: () => adminLogout() },
    ]);
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Technology":
        return "#3B82F6";
      case "Business":
        return "#10B981";
      case "Creative":
        return "#8B5CF6";
      case "Social":
        return "#F59E0B";
      default:
        return Brand.primary;
    }
  };

  const getStreamColor = (st: string) => {
    if (!st) return Brand.primary;
    if (st.includes("Physical")) return "#2563EB";
    if (st.includes("Bio")) return "#059669";
    if (st.includes("Commerce")) return "#D97706";
    if (st.includes("Art")) return "#7C3AED";
    if (st.includes("Tech")) return "#DC2626";
    return Brand.primary;
  };

  const getScholarshipCatColor = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case "university":
        return "#1D4ED8";
      case "merit":
        return "#059669";
      case "need-based":
        return "#D97706";
      default:
        return "#7C3AED";
    }
  };

  const getInquiryStatusBadge = (status: string) => {
    switch (status) {
      case "Replied":
        return { bg: "#ECFDF5", text: "#059669", icon: "checkmark-circle", label: "Replied" };
      case "Closed":
        return { bg: "#F1F5F9", text: "#64748B", icon: "archive-outline", label: "Closed" };
      default:
        return { bg: "#FFFBEB", text: "#D97706", icon: "time-outline", label: "Pending" };
    }
  };

  const getZScoreColor = (z: number) => {
    if (z >= 2.0) return "#10B981";
    if (z >= 1.7) return "#3B82F6";
    if (z >= 1.4) return "#F59E0B";
    return "#EF4444";
  };

  // --- Announcements (Notifications) CRUD Handlers ---
  const openCreateAnnouncementModal = () => {
    setAnnouncementError("");
    setAnnouncementNotice("");
    setEditingAnnouncement(null);
    setAnnTitle("");
    setAnnMessage("");
    setAnnType("info");
    setAnnTargetStream("");
    setAnnIsPinned(false);
    setAnnouncementModalVisible(true);
  };

  const openEditAnnouncementModal = (ann: any) => {
    setAnnouncementError("");
    setAnnouncementNotice("");
    setEditingAnnouncement(ann);
    setAnnTitle(ann.title || "");
    setAnnMessage(ann.message || "");
    setAnnType(ann.type || "info");
    setAnnTargetStream(ann.target_stream || "");
    setAnnIsPinned(ann.is_pinned || false);
    setAnnouncementModalVisible(true);
  };

  const handleSaveAnnouncement = async () => {
    if (savingAnnouncement) return;
    setAnnouncementError("");
    if (!annTitle.trim() || !annMessage.trim()) {
      setAnnouncementError("Title and Message are required.");
      return;
    }
    setSavingAnnouncement(true);
    try {
      const payload = {
        title: annTitle.trim(),
        message: annMessage.trim(),
        type: annType,
        targetStream: annTargetStream || null,
        isPinned: annIsPinned,
      };
      let res;
      if (editingAnnouncement) {
        res = await api.updateNotification(editingAnnouncement.id, payload);
      } else {
        res = await api.createNotification(payload);
      }
      if (res?.success) {
        setAnnouncementModalVisible(false);
        setAnnouncementNotice(editingAnnouncement ? "Announcement updated!" : "Announcement posted!");
        await loadAnnouncements();
      } else {
        setAnnouncementError(res?.message || "Failed to save announcement.");
      }
    } catch {
      setAnnouncementError("Unable to save announcement. Please check your connection and try again.");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = (ann: any) => {
    setAnnouncementError("");
    setAnnouncementNotice("");
    setAnnouncementToDelete(ann);
  };

  const confirmDeleteAnnouncement = async () => {
    if (!announcementToDelete || savingAnnouncement) return;
    setSavingAnnouncement(true);
    setAnnouncementError("");
    try {
      const res = await api.deleteNotification(announcementToDelete.id);
      if (res?.success) {
        setAnnouncementToDelete(null);
        setAnnouncementNotice("Announcement deleted.");
        await loadAnnouncements();
      } else {
        setAnnouncementError(res?.message || "Failed to delete announcement.");
      }
    } catch {
      setAnnouncementError("Unable to delete announcement. Please try again.");
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const pendingInquiriesCount = inquiries.filter((i) => i.status === "Pending").length;

  const filteredUniversities = universities.filter((u) => {
    if (!uniSearch.trim()) return true;
    const q = uniSearch.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.short_name?.toLowerCase().includes(q) ||
      u.location?.toLowerCase().includes(q) ||
      u.district?.toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>ADMIN CONTROL</Text>
          </View>
          <Text style={styles.headerTitle}>{adminData?.fullName || "Administrator"}</Text>
          <Text style={styles.headerSubtitle}>{adminData?.email || "Platform Control"}</Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Horizontal Scrollable Tabs */}
      <View style={styles.tabBarWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabBarScroll}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === "universities" && styles.tabItemActive]}
            onPress={() => setActiveTab("universities")}
          >
            <Ionicons
              name="school-outline"
              size={15}
              color={activeTab === "universities" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "universities" && styles.tabItemTextActive]}>
              Universities ({universities.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "courses" && styles.tabItemActive]}
            onPress={() => setActiveTab("courses")}
          >
            <Ionicons
              name="book-outline"
              size={15}
              color={activeTab === "courses" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "courses" && styles.tabItemTextActive]}>
              Courses ({courses.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "scholarships" && styles.tabItemActive]}
            onPress={() => setActiveTab("scholarships")}
          >
            <Ionicons
              name="ribbon-outline"
              size={15}
              color={activeTab === "scholarships" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "scholarships" && styles.tabItemTextActive]}>
              Scholarships ({scholarships.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "questions" && styles.tabItemActive]}
            onPress={() => setActiveTab("questions")}
          >
            <Ionicons
              name="help-circle-outline"
              size={15}
              color={activeTab === "questions" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "questions" && styles.tabItemTextActive]}>
              Questions ({questions.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "inquiries" && styles.tabItemActive]}
            onPress={() => setActiveTab("inquiries")}
          >
            <Ionicons
              name="chatbubbles-outline"
              size={15}
              color={activeTab === "inquiries" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "inquiries" && styles.tabItemTextActive]}>
              Inquiries {pendingInquiriesCount > 0 ? `(${pendingInquiriesCount})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "students" && styles.tabItemActive]}
            onPress={() => setActiveTab("students")}
          >
            <Ionicons
              name="people-outline"
              size={15}
              color={activeTab === "students" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "students" && styles.tabItemTextActive]}>
              Students ({students.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "overview" && styles.tabItemActive]}
            onPress={() => setActiveTab("overview")}
          >
            <Ionicons
              name="bar-chart-outline"
              size={15}
              color={activeTab === "overview" ? "#FFFFFF" : Brand.textMuted}
            />
            <Text style={[styles.tabItemText, activeTab === "overview" && styles.tabItemTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === "announcements" && styles.tabItemActive]}
            onPress={() => setActiveTab("announcements")}
          >
            <View style={{ position: "relative" }}>
              <Ionicons
                name="notifications-outline"
                size={15}
                color={activeTab === "announcements" ? "#FFFFFF" : Brand.textMuted}
              />
              {announcements.length > 0 && (
                <View style={{ position: "absolute", top: -4, right: -4, backgroundColor: "#EF4444", borderRadius: 5, width: 8, height: 8 }} />
              )}
            </View>
            <Text style={[styles.tabItemText, activeTab === "announcements" && styles.tabItemTextActive]}>
              Alerts ({announcements.length})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content Area */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={Brand.primary} />
          <Text style={styles.loadingText}>Loading Admin Data...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.primary} />
          }
        >
          {/* ═══════════ TAB 1: UNIVERSITIES CRUD ═══════════ */}
          {activeTab === "universities" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Universities Management</Text>
                  <Text style={styles.bannerSub}>
                    Manage all Sri Lankan state universities and institutes.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateUniModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add University</Text>
                </TouchableOpacity>
              </View>

              {/* Search Box */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search universities by name, short code, or district..."
                  placeholderTextColor={Brand.textMuted}
                  value={uniSearch}
                  onChangeText={setUniSearch}
                />
                {uniSearch ? (
                  <TouchableOpacity onPress={() => setUniSearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {universitiesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : filteredUniversities.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="school-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Universities Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add University' button above to create one.</Text>
                </View>
              ) : (
                filteredUniversities.map((uni) => (
                  <View key={uni.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.uniCodeBadge}>
                        <Text style={styles.uniCodeText}>{uni.short_name}</Text>
                      </View>
                      <View style={styles.locationPill}>
                        <Ionicons name="location-outline" size={12} color="#0369A1" style={{ marginRight: 4 }} />
                        <Text style={styles.locationPillText}>{uni.district}</Text>
                      </View>

                      <View style={styles.cardActionGroup}>
                        <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditUniModal(uni)}>
                          <Ionicons name="pencil" size={16} color={Brand.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.iconActionBtn, styles.deleteBtn]}
                          onPress={() => handleDeleteUniversity(uni.id, uni.name)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <Text style={styles.uniCardTitle}>{uni.name}</Text>
                    <Text style={styles.uniCardLocation}>
                      <Ionicons name="navigate-outline" size={12} color={Brand.textMuted} /> {uni.location}
                    </Text>

                    <View style={styles.uniCardMetaRow}>
                      <View style={styles.coursesCountBadge}>
                        <Ionicons name="layers-outline" size={13} color="#059669" />
                        <Text style={styles.coursesCountText}>
                          {uni.courses_count !== undefined ? `${uni.courses_count} Courses` : "Active"}
                        </Text>
                      </View>

                      {uni.website ? (
                        <View style={styles.websiteTag}>
                          <Ionicons name="globe-outline" size={12} color="#6366F1" />
                          <Text style={styles.websiteTagText} numberOfLines={1}>
                            {uni.website.replace("https://", "").replace("http://", "")}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {uni.description ? (
                      <Text style={styles.uniCardDesc} numberOfLines={2}>
                        {uni.description}
                      </Text>
                    ) : null}
                  </View>
                ))
              )}
            </View>
          )}

          {/* ═══════════ TAB 2: COURSES CRUD ═══════════ */}
          {activeTab === "courses" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Courses Management</Text>
                  <Text style={styles.bannerSub}>
                    Manage degree programs, minimum Z-scores and intake criteria.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateCourseModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add Course</Text>
                </TouchableOpacity>
              </View>

              {/* Course Search */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search courses by title, code, or university..."
                  placeholderTextColor={Brand.textMuted}
                  value={courseSearch}
                  onChangeText={setCourseSearch}
                />
                {courseSearch ? (
                  <TouchableOpacity onPress={() => setCourseSearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Stream Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamFilterScroll}>
                {["", ...streamsList].map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.streamPill, courseStreamFilter === st && styles.streamPillActive]}
                    onPress={() => setCourseStreamFilter(st)}
                  >
                    <Text style={[styles.streamPillText, courseStreamFilter === st && styles.streamPillTextActive]}>
                      {st || "All Streams"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {coursesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : courses.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="book-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Courses Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add Course' button above to create a course.</Text>
                </View>
              ) : (
                courses.map((course) => {
                  const sColor = getStreamColor(course.stream);
                  return (
                    <View key={course.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.courseCodeBadge}>
                          <Text style={styles.courseCodeText}>{course.code}</Text>
                        </View>
                        <View style={[styles.streamBadge, { backgroundColor: `${sColor}15` }]}>
                          <View style={[styles.catDot, { backgroundColor: sColor }]} />
                          <Text style={[styles.streamBadgeText, { color: sColor }]}>
                            {course.stream}
                          </Text>
                        </View>

                        <View style={styles.cardActionGroup}>
                          <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditCourseModal(course)}>
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconActionBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteCourse(course.id, course.name)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.courseName}>{course.name}</Text>
                      <Text style={styles.courseUniName}>
                        <Ionicons name="business-outline" size={13} color={Brand.primary} />{" "}
                        {course.university_name || `University #${course.university_id}`}
                      </Text>

                      <View style={styles.courseDetailsRow}>
                        <View style={styles.minZBadge}>
                          <Ionicons name="trending-up" size={12} color="#059669" />
                          <Text style={styles.minZText}>
                            Min Z: {course.min_z_score !== undefined ? parseFloat(course.min_z_score).toFixed(4) : "0.0000"}
                          </Text>
                        </View>

                        <View style={styles.durationBadge}>
                          <Ionicons name="time-outline" size={12} color="#64748B" />
                          <Text style={styles.durationText}>{course.duration_years || 4} Years</Text>
                        </View>

                        <View style={styles.degreeBadge}>
                          <Text style={styles.degreeText}>{course.degree_type}</Text>
                        </View>
                      </View>

                      {course.career_paths && course.career_paths.length > 0 ? (
                        <View style={styles.careerTagsWrap}>
                          {course.career_paths.slice(0, 3).map((cp: string, idx: number) => (
                            <View key={idx} style={styles.careerTag}>
                              <Text style={styles.careerTagText}>#{cp}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ TAB 3: SCHOLARSHIPS CRUD ═══════════ */}
          {activeTab === "scholarships" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Scholarships Management</Text>
                  <Text style={styles.bannerSub}>
                    Manage grants, merit awards, and university scholarships.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateScholarshipModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add Scholarship</Text>
                </TouchableOpacity>
              </View>

              {/* Scholarship Search */}
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search scholarships by title, provider, eligibility..."
                  placeholderTextColor={Brand.textMuted}
                  value={scholarshipSearch}
                  onChangeText={setScholarshipSearch}
                />
                {scholarshipSearch ? (
                  <TouchableOpacity onPress={() => setScholarshipSearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Category Filter Pills */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamFilterScroll}>
                {["", ...scholarshipCategoriesList].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[styles.streamPill, scholarshipCategoryFilter === cat && styles.streamPillActive]}
                    onPress={() => setScholarshipCategoryFilter(cat)}
                  >
                    <Text style={[styles.streamPillText, scholarshipCategoryFilter === cat && styles.streamPillTextActive]}>
                      {cat || "All Categories"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {scholarshipsLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : scholarships.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="ribbon-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Scholarships Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add Scholarship' button above to post an award.</Text>
                </View>
              ) : (
                scholarships.map((sch) => {
                  const catColor = getScholarshipCatColor(sch.category);
                  return (
                    <View key={sch.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                          <View style={[styles.catDot, { backgroundColor: catColor }]} />
                          <Text style={[styles.categoryText, { color: catColor }]}>
                            {sch.category}
                          </Text>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: sch.status === "Closed" ? "#F1F5F9" : "#ECFDF5", marginLeft: 8 }]}>
                          <Text style={[styles.statusBadgeText, { color: sch.status === "Closed" ? "#64748B" : "#059669" }]}>
                            {sch.status || "Open"}
                          </Text>
                        </View>

                        <View style={styles.cardActionGroup}>
                          <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditScholarshipModal(sch)}>
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconActionBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteScholarship(sch.id, sch.title)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      <Text style={styles.courseName}>{sch.title}</Text>
                      <Text style={styles.uniCardLocation}>
                        <Ionicons name="business-outline" size={12} color={Brand.textMuted} /> Provided by: {sch.provider}
                      </Text>

                      <View style={styles.courseDetailsRow}>
                        <View style={styles.minZBadge}>
                          <Ionicons name="cash-outline" size={12} color="#059669" />
                          <Text style={styles.minZText}>{sch.value}</Text>
                        </View>

                        <View style={styles.durationBadge}>
                          <Ionicons name="calendar-outline" size={12} color="#64748B" />
                          <Text style={styles.durationText}>Deadline: {sch.deadline}</Text>
                        </View>
                      </View>

                      <Text style={[styles.uniCardDesc, { marginTop: 4 }]} numberOfLines={2}>
                        Eligibility: {sch.eligibility}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ TAB 4: QUESTIONS CRUD ═══════════ */}
          {activeTab === "questions" && (
            <View style={styles.tabContent}>
              <View style={styles.actionBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bannerHeading}>Aptitude Questions CRUD</Text>
                  <Text style={styles.bannerSub}>
                    Manage all questions used by the AI Career Assessment.
                  </Text>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={openCreateModal}>
                  <Ionicons name="add-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.addBtnText}>Add Question</Text>
                </TouchableOpacity>
              </View>

              {questionsLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : questions.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="help-buoy-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Questions Found</Text>
                  <Text style={styles.emptySub}>Click the 'Add Question' button above to seed.</Text>
                </View>
              ) : (
                questions.map((q, idx) => {
                  const catColor = getCategoryColor(q.category);
                  return (
                    <View key={q.id} style={styles.card}>
                      <View style={styles.cardTopRow}>
                        <View style={styles.qNumberPill}>
                          <Text style={styles.qNumberText}>#{q.sort_order || idx + 1}</Text>
                        </View>
                        <View style={[styles.categoryBadge, { backgroundColor: `${catColor}15` }]}>
                          <View style={[styles.catDot, { backgroundColor: catColor }]} />
                          <Text style={[styles.categoryText, { color: catColor }]}>
                            {q.category}
                          </Text>
                        </View>

                        <View style={styles.cardActionGroup}>
                          <TouchableOpacity style={styles.iconActionBtn} onPress={() => openEditModal(q)}>
                            <Ionicons name="pencil" size={16} color={Brand.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.iconActionBtn, styles.deleteBtn]}
                            onPress={() => handleDeleteQuestion(q.id, q.text)}
                          >
                            <Ionicons name="trash-outline" size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Text style={styles.qText}>{q.text}</Text>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ TAB 5: INQUIRIES & SUPPORT ═══════════ */}
          {activeTab === "inquiries" && (
            <View style={styles.tabContent}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search inquiries by student or keyword..."
                  placeholderTextColor={Brand.textMuted}
                  value={inquirySearch}
                  onChangeText={setInquirySearch}
                />
                {inquirySearch ? (
                  <TouchableOpacity onPress={() => setInquirySearch("")}>
                    <Ionicons name="close-circle" size={18} color={Brand.textMuted} />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Status Filter Row */}
              <View style={styles.filterPillsRow}>
                {["", "Pending", "Replied", "Closed"].map((st) => {
                  const selected = inquiryStatusFilter === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[styles.filterPill, selected && styles.filterPillActive]}
                      onPress={() => setInquiryStatusFilter(st)}
                    >
                      <Text style={[styles.filterPillText, selected && styles.filterPillTextActive]}>
                        {st || "All Inquiries"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionHeader}>
                Student Inquiries & Requests ({inquiries.length})
              </Text>

              {inquiriesLoading ? (
                <ActivityIndicator color={Brand.primary} style={{ marginTop: 24 }} />
              ) : inquiries.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="chatbubbles-outline" size={48} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Inquiries Found</Text>
                  <Text style={styles.emptySub}>All student messages have been answered or resolved.</Text>
                </View>
              ) : (
                inquiries.map((inq) => {
                  const badge = getInquiryStatusBadge(inq.status);
                  return (
                    <View key={inq.id} style={styles.inquiryCard}>
                      <View style={styles.inquiryCardTop}>
                        <View style={styles.studentBadgeWrap}>
                          <Text style={styles.studentNameTag}>{inq.student_name || "Student"}</Text>
                          <Text style={styles.studentEmailTag}>{inq.student_email}</Text>
                        </View>

                        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                          <Ionicons name={badge.icon as any} size={12} color={badge.text} style={{ marginRight: 4 }} />
                          <Text style={[styles.statusBadgeText, { color: badge.text }]}>
                            {badge.label}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.inquirySubject}>{inq.subject}</Text>
                      <Text style={styles.inquiryMessage}>{inq.message}</Text>

                      {inq.admin_reply ? (
                        <View style={styles.adminReplySnippet}>
                          <Ionicons name="checkmark-done" size={14} color="#059669" />
                          <Text style={styles.adminReplyText} numberOfLines={3}>
                            <Text style={{ fontWeight: "700" }}>Your Reply: </Text>
                            {inq.admin_reply}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.inquiryActionRow}>
                        <Text style={styles.inquiryDate}>
                          {inq.created_at ? new Date(inq.created_at).toLocaleDateString() : ""}
                        </Text>
                        <TouchableOpacity
                          style={styles.replyActionBtn}
                          onPress={() => openReplyModal(inq)}
                        >
                          <Ionicons
                            name={inq.admin_reply ? "pencil-outline" : "paper-plane-outline"}
                            size={14}
                            color="#FFFFFF"
                            style={{ marginRight: 6 }}
                          />
                          <Text style={styles.replyActionBtnText}>
                            {inq.admin_reply ? "Edit Reply" : "Reply to Student"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {/* ═══════════ TAB 6: STUDENTS MONITORING ═══════════ */}
          {activeTab === "students" && (
            <View style={styles.tabContent}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={Brand.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search students by name or email..."
                  placeholderTextColor={Brand.textMuted}
                  value={searchStudent}
                  onChangeText={setSearchStudent}
                />
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.streamFilterScroll}>
                {studentStreamFilters.map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.streamPill, filterStream === s && styles.streamPillActive]}
                    onPress={() => setFilterStream(s)}
                  >
                    <Text style={[styles.streamPillText, filterStream === s && styles.streamPillTextActive]}>
                      {s || "All Streams"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={styles.sectionHeader}>Registered Students ({students.length})</Text>

              {students.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Ionicons name="school-outline" size={44} color={Brand.textMuted} />
                  <Text style={styles.emptyTitle}>No Students Found</Text>
                </View>
              ) : (
                students.map((st) => (
                  <View key={st.id} style={styles.card}>
                    <View style={styles.studentCardHeader}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{(st.fullName || "S").charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.studentName}>{st.fullName}</Text>
                        <Text style={styles.studentEmail}>{st.email}</Text>
                      </View>
                      <View style={[styles.zScoreBadge, { backgroundColor: `${getZScoreColor(st.zScore)}15` }]}>
                        <Text style={[styles.zScoreText, { color: getZScoreColor(st.zScore) }]}>
                          Z: {st.zScore ? st.zScore.toFixed(4) : "N/A"}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.studentMetaRow}>
                      <View style={styles.metaItem}>
                        <Ionicons name="book-outline" size={13} color={Brand.textMuted} />
                        <Text style={styles.metaText}>{st.stream || "General"}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="location-outline" size={13} color={Brand.textMuted} />
                        <Text style={styles.metaText}>{st.district || "Sri Lanka"}</Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {/* ═══════════ TAB 7: OVERVIEW & ANALYTICS ═══════════ */}
          {activeTab === "overview" && dashData && (
            <View style={styles.tabContent}>
              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { borderLeftColor: Brand.primary }]}>
                  <Text style={styles.statLabel}>Total Students</Text>
                  <Text style={styles.statNum}>{dashData.summary?.totalStudents || 0}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#10B981" }]}>
                  <Text style={styles.statLabel}>Avg Z-Score</Text>
                  <Text style={[styles.statNum, { color: "#10B981" }]}>
                    {dashData.summary?.averageZScore?.toFixed(3) || "0.000"}
                  </Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#8B5CF6" }]}>
                  <Text style={styles.statLabel}>Govt Courses</Text>
                  <Text style={styles.statNum}>{courses.length || dashData.summary?.totalCourses || 0}</Text>
                </View>
                <View style={[styles.statBox, { borderLeftColor: "#F59E0B" }]}>
                  <Text style={styles.statLabel}>Scholarships</Text>
                  <Text style={[styles.statNum, { color: "#F59E0B" }]}>
                    {scholarships.length || 4}
                  </Text>
                </View>
              </View>

              <View style={styles.card}>
                <Text style={styles.cardTitle}>Students by A/L Stream</Text>
                {dashData.streamDistribution?.map((item: any) => (
                  <View key={item.stream} style={styles.distributionRow}>
                    <Text style={styles.distLabel}>{item.stream}</Text>
                    <View style={styles.distBarWrap}>
                      <View
                        style={[
                          styles.distBarFill,
                          {
                            width: `${Math.min(
                              100,
                              (item.count / (dashData.summary?.totalStudents || 1)) * 100
                            )}%`,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.distCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {/* ═══════════ TAB 8: ANNOUNCEMENTS / NOTIFICATIONS ═══════════ */}
      {activeTab === "announcements" && !loading && (
        <ScrollView
          style={styles.content}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Brand.primary} />}
        >
          <View style={styles.tabContent}>
            {/* Action Banner */}
            <View style={styles.actionBanner}>
              <View style={{ flex: 1 }}>
                <Text style={styles.bannerHeading}>Announcements</Text>
                <Text style={styles.bannerSub}>Post notifications visible to all students.</Text>
              </View>
              <TouchableOpacity style={styles.addBtn} onPress={openCreateAnnouncementModal}>
                <Ionicons name="add" size={18} color="#FFFFFF" />
                <Text style={styles.addBtnText}>Post</Text>
              </TouchableOpacity>
            </View>

            {!!announcementNotice && (
              <Text accessibilityLiveRegion="polite" style={styles.announcementNotice}>{announcementNotice}</Text>
            )}
            {announcementsLoading ? (
              <ActivityIndicator color={Brand.primary} style={{ marginTop: 40 }} />
            ) : announcementListError ? (
              <View style={styles.emptyCard}>
                <Text accessibilityRole="alert" style={styles.announcementError}>{announcementListError}</Text>
                <TouchableOpacity style={styles.addBtn} onPress={loadAnnouncements}>
                  <Text style={styles.addBtnText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : announcements.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Ionicons name="notifications-off-outline" size={48} color={Brand.textMuted} />
                <Text style={{ color: Brand.textMuted, marginTop: 12, fontSize: 14 }}>
                  No announcements yet. Post one!
                </Text>
              </View>
            ) : (
              announcements.map((ann: any) => {
                const typeColors: Record<string, { bg: string; border: string; badgeColor: string }> = {
                  info:        { bg: "#EFF6FF", border: "#BFDBFE", badgeColor: "#2563EB" },
                  warning:     { bg: "#FFFBEB", border: "#FDE68A", badgeColor: "#D97706" },
                  success:     { bg: "#F0FDF4", border: "#BBF7D0", badgeColor: "#16A34A" },
                  deadline:    { bg: "#FFF1F2", border: "#FECDD3", badgeColor: "#E11D48" },
                  scholarship: { bg: "#FAF5FF", border: "#DDD6FE", badgeColor: "#7C3AED" },
                };
                const tc = typeColors[ann.type] || typeColors.info;
                return (
                  <View
                    key={ann.id}
                    style={[
                      styles.card,
                      { backgroundColor: tc.bg, borderColor: tc.border, borderWidth: 1, marginBottom: 12 },
                    ]}
                  >
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", flex: 1 }}>
                        <View style={{ backgroundColor: tc.badgeColor, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                          <Text style={{ color: "#FFFFFF", fontSize: 10, fontWeight: "700", textTransform: "uppercase" }}>
                            {ann.type}
                          </Text>
                        </View>
                        {ann.is_pinned && (
                          <View style={{ backgroundColor: "#FEE2E2", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 3 }}>
                            <Ionicons name="pin" size={10} color="#DC2626" />
                            <Text style={{ color: "#DC2626", fontSize: 10, fontWeight: "600" }}>Pinned</Text>
                          </View>
                        )}
                        {ann.target_stream ? (
                          <View style={{ backgroundColor: "rgba(0,0,0,0.07)", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 8 }}>
                            <Text style={{ fontSize: 10, fontWeight: "500", color: "#374151" }}>{ann.target_stream}</Text>
                          </View>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        <TouchableOpacity accessibilityLabel="Edit announcement" style={[styles.iconActionBtn, { backgroundColor: '#EFF6FF' }]} onPress={() => openEditAnnouncementModal(ann)}>
                          <Ionicons name="pencil" size={14} color={Brand.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity accessibilityLabel="Delete announcement" style={[styles.iconActionBtn, styles.deleteBtn]} onPress={() => handleDeleteAnnouncement(ann)}>
                          <Ionicons name="trash" size={14} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={{ fontSize: 14, fontWeight: "700", color: Brand.text, marginBottom: 4 }}>{ann.title}</Text>
                    <Text style={{ fontSize: 13, color: Brand.textSecondary, lineHeight: 18 }}>{ann.message}</Text>
                    <Text style={{ fontSize: 11, color: Brand.textMuted, marginTop: 8 }}>
                      {new Date(ann.created_at).toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" })}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      {/* ═══════════ ANNOUNCEMENTS MODAL ═══════════ */}
      <Modal
        visible={announcementModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => { if (!savingAnnouncement) setAnnouncementModalVisible(false); }}
      >
        <KeyboardAvoidingView
          style={[styles.modalOverlay, styles.announcementOverlay]}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          enabled={Platform.OS !== "web"}
        >
          <View style={[styles.modalContent, styles.announcementContent, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>Announcements</Text>
                <Text style={styles.modalTitle}>
                  {editingAnnouncement ? "Edit Announcement" : "Post Announcement"}
                </Text>
              </View>
              <TouchableOpacity accessibilityLabel="Close announcement" disabled={savingAnnouncement} onPress={() => setAnnouncementModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            {!!announcementError && (
              <Text accessibilityRole="alert" style={styles.announcementError}>{announcementError}</Text>
            )}
            <ScrollView style={styles.announcementForm} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalLabel}>Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. UGC Applications Now Open"
                placeholderTextColor={Brand.textMuted}
                value={annTitle}
                onChangeText={setAnnTitle}
              />

              <Text style={styles.modalLabel}>Message *</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 80 }]}
                placeholder="Full announcement text for students..."
                placeholderTextColor={Brand.textMuted}
                multiline
                value={annMessage}
                onChangeText={setAnnMessage}
              />

              <Text style={styles.modalLabel}>Type</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {(["info", "warning", "success", "deadline", "scholarship"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 7,
                      borderRadius: 20,
                      backgroundColor: annType === t ? Brand.primary : "#F1F5F9",
                      borderWidth: 1,
                      borderColor: annType === t ? Brand.primary : Brand.cardBorder,
                    }}
                    onPress={() => setAnnType(t)}
                  >
                    <Text style={{ fontSize: 13, fontWeight: "600", color: annType === t ? "#FFFFFF" : Brand.textSecondary }}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.modalLabel}>Target Stream (optional — leave blank for all)</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                {["", "Physical Science", "Biological Science", "Commerce", "Arts", "Technology"].map((s) => (
                  <TouchableOpacity
                    key={s || "all"}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 16,
                      backgroundColor: annTargetStream === s ? "#0D9488" : "#F1F5F9",
                      borderWidth: 1,
                      borderColor: annTargetStream === s ? "#0D9488" : Brand.cardBorder,
                    }}
                    onPress={() => setAnnTargetStream(s)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: "600", color: annTargetStream === s ? "#FFFFFF" : Brand.textSecondary }}>
                      {s || "All Students"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 20 }}
                onPress={() => setAnnIsPinned(!annIsPinned)}
              >
                <View style={{
                  width: 22, height: 22, borderRadius: 6,
                  borderWidth: 2, borderColor: annIsPinned ? Brand.primary : Brand.cardBorder,
                  backgroundColor: annIsPinned ? Brand.primary : "transparent",
                  justifyContent: "center", alignItems: "center",
                }}>
                  {annIsPinned && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                </View>
                <Text style={{ fontSize: 14, color: Brand.text, fontWeight: "500" }}>
                  📌 Pin this announcement (shows at top)
                </Text>
              </TouchableOpacity>

            </ScrollView>
            <View style={[styles.modalBtnRow, styles.announcementActions]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setAnnouncementModalVisible(false)}
                disabled={savingAnnouncement}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, savingAnnouncement && { opacity: 0.6 }]}
                onPress={handleSaveAnnouncement}
                disabled={savingAnnouncement}
              >
                {savingAnnouncement ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalSaveText}>
                    {editingAnnouncement ? "Update" : "Post Announcement"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal visible={!!announcementToDelete} transparent animationType="fade" onRequestClose={() => { if (!savingAnnouncement) setAnnouncementToDelete(null); }}>
        <View style={[styles.modalOverlay, styles.announcementOverlay]}>
          <View style={[styles.modalContent, styles.announcementDeleteContent]}>
            <Text style={styles.modalTitle}>Delete Announcement</Text>
            <Text style={styles.modalLabel}>{`Delete "${announcementToDelete?.title}"? Students will no longer see this.`}</Text>
            {!!announcementError && <Text accessibilityRole="alert" style={styles.announcementError}>{announcementError}</Text>}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} disabled={savingAnnouncement} onPress={() => setAnnouncementToDelete(null)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalSaveBtn, { backgroundColor: "#DC2626" }]} disabled={savingAnnouncement} onPress={confirmDeleteAnnouncement}>
                {savingAnnouncement ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.modalSaveText}>Delete</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 1: CREATE / EDIT UNIVERSITY ═══════════ */}
      <Modal visible={uniModalVisible} transparent animationType="slide" onRequestClose={() => setUniModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>University Directory</Text>
                <Text style={styles.modalTitle}>
                  {editingUni ? "Edit University" : "Add New University"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setUniModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>University Full Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. University of Moratuwa"
                placeholderTextColor={Brand.textMuted}
                value={uniName}
                onChangeText={setUniName}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Short Code *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. UOM"
                    placeholderTextColor={Brand.textMuted}
                    autoCapitalize="characters"
                    value={uniShortName}
                    onChangeText={setUniShortName}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Location / City *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Moratuwa"
                    placeholderTextColor={Brand.textMuted}
                    value={uniLocation}
                    onChangeText={setUniLocation}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>District *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {sriLankanDistricts.map((dst) => {
                  const isSel = uniDistrict === dst;
                  return (
                    <TouchableOpacity
                      key={dst}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setUniDistrict(dst)}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {dst}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Official Website URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://uom.lk"
                placeholderTextColor={Brand.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                value={uniWebsite}
                onChangeText={setUniWebsite}
              />

              <Text style={styles.modalLabel}>Logo / Image URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://..."
                placeholderTextColor={Brand.textMuted}
                autoCapitalize="none"
                value={uniLogoUrl}
                onChangeText={setUniLogoUrl}
              />

              <Text style={styles.modalLabel}>Overview / Description</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 70 }]}
                multiline
                placeholder="Brief information about this university's faculties and campus..."
                placeholderTextColor={Brand.textMuted}
                value={uniDescription}
                onChangeText={setUniDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setUniModalVisible(false)}
                  disabled={savingUni}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingUni && { opacity: 0.6 }]}
                  onPress={handleSaveUniversity}
                  disabled={savingUni}
                >
                  {savingUni ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingUni ? "Update University" : "Create University"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 2: CREATE / EDIT COURSE ═══════════ */}
      <Modal visible={courseModalVisible} transparent animationType="slide" onRequestClose={() => setCourseModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>Courses Directory</Text>
                <Text style={styles.modalTitle}>
                  {editingCourse ? "Edit Course" : "Add New Course"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setCourseModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Select University *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {universities.map((uni) => {
                  const isSel = String(courseUniId) === String(uni.id);
                  return (
                    <TouchableOpacity
                      key={uni.id}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setCourseUniId(String(uni.id))}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {uni.short_name} ({uni.name?.slice(0, 14)}...)
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Course Name *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Computer Science & Engineering"
                placeholderTextColor={Brand.textMuted}
                value={courseName}
                onChangeText={setCourseName}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Course Code *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. CS01"
                    placeholderTextColor={Brand.textMuted}
                    autoCapitalize="characters"
                    value={courseCode}
                    onChangeText={setCourseCode}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Duration (Years)</Text>
                  <TextInput
                    style={styles.modalInput}
                    keyboardType="numeric"
                    placeholder="4"
                    placeholderTextColor={Brand.textMuted}
                    value={courseDurationYears}
                    onChangeText={setCourseDurationYears}
                  />
                </View>
              </View>

              <Text style={styles.modalLabel}>A/L Stream *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {streamsList.map((st) => {
                  const isSel = courseStream === st;
                  const sColor = getStreamColor(st);
                  return (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.chipItem,
                        isSel && { backgroundColor: `${sColor}15`, borderColor: sColor },
                      ]}
                      onPress={() => setCourseStream(st)}
                    >
                      <Text style={[styles.chipItemText, isSel && { color: sColor, fontWeight: "700" }]}>
                        {st}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Degree Type *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {degreeTypesList.map((dt) => {
                  const isSel = courseDegreeType === dt;
                  return (
                    <TouchableOpacity
                      key={dt}
                      style={[styles.chipItem, isSel && styles.chipItemActive]}
                      onPress={() => setCourseDegreeType(dt)}
                    >
                      <Text style={[styles.chipItemText, isSel && styles.chipItemTextActive]}>
                        {dt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Minimum Cutoff Z-Score</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="e.g. 1.8500"
                placeholderTextColor={Brand.textMuted}
                value={courseMinZScore}
                onChangeText={setCourseMinZScore}
              />

              <Text style={styles.modalLabel}>Career Paths (comma separated)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Software Engineer, Data Scientist, Systems Architect"
                placeholderTextColor={Brand.textMuted}
                value={courseCareerPaths}
                onChangeText={setCourseCareerPaths}
              />

              <Text style={styles.modalLabel}>Course Description</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 70 }]}
                multiline
                placeholder="Key learning outcomes, faculty details, career opportunities..."
                placeholderTextColor={Brand.textMuted}
                value={courseDescription}
                onChangeText={setCourseDescription}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setCourseModalVisible(false)}
                  disabled={savingCourse}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingCourse && { opacity: 0.6 }]}
                  onPress={handleSaveCourse}
                  disabled={savingCourse}
                >
                  {savingCourse ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingCourse ? "Update Course" : "Create Course"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 3: CREATE / EDIT SCHOLARSHIP ═══════════ */}
      <Modal visible={scholarshipModalVisible} transparent animationType="slide" onRequestClose={() => setScholarshipModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "90%" }]}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalCategoryText}>Scholarship Management</Text>
                <Text style={styles.modalTitle}>
                  {editingScholarship ? "Edit Scholarship" : "Add New Scholarship"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setScholarshipModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Scholarship Title *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Mahapola Higher Education Scholarship"
                placeholderTextColor={Brand.textMuted}
                value={schTitle}
                onChangeText={setSchTitle}
              />

              <Text style={styles.modalLabel}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
                {scholarshipCategoriesList.map((cat) => {
                  const isSel = schCategory === cat;
                  const cColor = getScholarshipCatColor(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.chipItem,
                        isSel && { backgroundColor: `${cColor}15`, borderColor: cColor },
                      ]}
                      onPress={() => setSchCategory(cat)}
                    >
                      <Text style={[styles.chipItemText, isSel && { color: cColor, fontWeight: "700" }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <Text style={styles.modalLabel}>Awarding Organization / Provider *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Mahapola Trust Fund / Ministry of Higher Education"
                placeholderTextColor={Brand.textMuted}
                value={schProvider}
                onChangeText={setSchProvider}
              />

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Value / Amount *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. Rs. 5,000 / month"
                    placeholderTextColor={Brand.textMuted}
                    value={schValue}
                    onChangeText={setSchValue}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Deadline *</Text>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="e.g. 2026-11-30"
                    placeholderTextColor={Brand.textMuted}
                    value={schDeadline}
                    onChangeText={setSchDeadline}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalLabel}>Status</Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                    {["Open", "Closed"].map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.filterPill,
                          schStatus === st && { backgroundColor: st === "Open" ? "#059669" : "#64748B", borderColor: st === "Open" ? "#059669" : "#64748B" },
                        ]}
                        onPress={() => setSchStatus(st)}
                      >
                        <Text style={[styles.filterPillText, schStatus === st && { color: "#FFFFFF" }]}>
                          {st}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <Text style={styles.modalLabel}>Eligibility Criteria *</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 65 }]}
                multiline
                placeholder="e.g. Enrolled in a Sri Lankan state university, parent income criteria..."
                placeholderTextColor={Brand.textMuted}
                value={schEligibility}
                onChangeText={setSchEligibility}
              />

              <Text style={styles.modalLabel}>Benefits Summary</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Monthly stipend, book allowance, laptop subsidy"
                placeholderTextColor={Brand.textMuted}
                value={schBenefits}
                onChangeText={setSchBenefits}
              />

              <Text style={styles.modalLabel}>Requirements & Required Documents</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 65 }]}
                multiline
                placeholder="e.g. Certified copies of A/L results sheet, GS certificate..."
                placeholderTextColor={Brand.textMuted}
                value={schRequirements}
                onChangeText={setSchRequirements}
              />

              <Text style={styles.modalLabel}>How to Apply / Instructions</Text>
              <TextInput
                style={[styles.modalTextInput, { minHeight: 65 }]}
                multiline
                placeholder="e.g. Download application form from official website, submit to welfare division..."
                placeholderTextColor={Brand.textMuted}
                value={schApplicationInstructions}
                onChangeText={setSchApplicationInstructions}
              />

              <Text style={styles.modalLabel}>Official Source / Application URL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="https://mohe.gov.lk/scholarships"
                placeholderTextColor={Brand.textMuted}
                autoCapitalize="none"
                keyboardType="url"
                value={schOfficialSourceUrl}
                onChangeText={setSchOfficialSourceUrl}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setScholarshipModalVisible(false)}
                  disabled={savingScholarship}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingScholarship && { opacity: 0.6 }]}
                  onPress={handleSaveScholarship}
                  disabled={savingScholarship}
                >
                  {savingScholarship ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingScholarship ? "Update Scholarship" : "Publish Scholarship"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 4: CREATE / EDIT QUESTION ═══════════ */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingQuestion ? "Edit Question" : "Add New Aptitude Question"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Brand.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Question Text *</Text>
              <TextInput
                style={styles.modalTextInput}
                multiline
                numberOfLines={3}
                placeholder="e.g. I enjoy designing systems and troubleshooting bugs..."
                placeholderTextColor={Brand.textMuted}
                value={questionText}
                onChangeText={setQuestionText}
              />

              <Text style={styles.modalLabel}>Category / Trait *</Text>
              <View style={styles.catPickerGrid}>
                {categories.map((cat) => {
                  const isSelected = questionCategory === cat;
                  const catColor = getCategoryColor(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.catOptionBtn,
                        isSelected && { borderColor: catColor, backgroundColor: `${catColor}15` },
                      ]}
                      onPress={() => setQuestionCategory(cat)}
                    >
                      <View style={[styles.catDot, { backgroundColor: catColor }]} />
                      <Text style={[styles.catOptionText, isSelected && { color: catColor, fontWeight: "700" }]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.modalLabel}>Order Position</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={sortOrder}
                onChangeText={setSortOrder}
              />

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setModalVisible(false)}
                  disabled={savingQuestion}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalSaveBtn, savingQuestion && { opacity: 0.6 }]}
                  onPress={handleSaveQuestion}
                  disabled={savingQuestion}
                >
                  {savingQuestion ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSaveText}>
                      {editingQuestion ? "Save Changes" : "Create Question"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ═══════════ MODAL 5: REPLY TO INQUIRY ═══════════ */}
      <Modal visible={replyModalVisible} transparent animationType="slide" onRequestClose={() => setReplyModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "85%" }]}>
            {selectedInquiry && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalCategoryText}>Responding to {selectedInquiry.student_name}</Text>
                    <Text style={styles.modalTitle}>{selectedInquiry.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setReplyModalVisible(false)}>
                    <Ionicons name="close" size={24} color={Brand.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.modalLabel}>Student Question:</Text>
                  <View style={styles.studentQuestionQuote}>
                    <Text style={styles.quoteText}>{selectedInquiry.message}</Text>
                  </View>

                  <Text style={styles.modalLabel}>Official Advisor Response *</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 110 }]}
                    multiline
                    placeholder="Type official guidance, UGC entrance guidelines or solution..."
                    placeholderTextColor={Brand.textMuted}
                    value={replyText}
                    onChangeText={setReplyText}
                  />

                  <View style={styles.modalBtnRow}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => handleCloseInquiry(selectedInquiry.id)}
                    >
                      <Text style={[styles.modalCancelText, { color: "#64748B" }]}>Close Ticket</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.modalSaveBtn, sendingReply && { opacity: 0.6 }]}
                      onPress={handleSendReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={styles.modalSaveText}>Send Response</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: { flex: 1 },
  adminBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  adminBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: Brand.text },
  headerSubtitle: { fontSize: 12, color: Brand.textMuted },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },
  logoutBtnText: { fontSize: 13, fontWeight: "600", color: "#EF4444", marginLeft: 4 },
  tabBarWrapper: {
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  tabBarScroll: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tabItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  tabItemActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  tabItemText: { fontSize: 12, fontWeight: "600", color: Brand.textSecondary, marginLeft: 6 },
  tabItemTextActive: { color: "#FFFFFF", fontWeight: "700" },
  centerLoading: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 12, color: Brand.textMuted, fontSize: 14 },
  content: { flex: 1 },
  tabContent: { padding: 16 },
  actionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  bannerHeading: { fontSize: 16, fontWeight: "700", color: Brand.text },
  bannerSub: { fontSize: 12, color: Brand.textMuted, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 14, color: Brand.text, marginLeft: 8 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  cardActionGroup: { flexDirection: "row", marginLeft: "auto", gap: 8 },
  iconActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: { backgroundColor: "#FEE2E2" },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 10,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: Brand.text, marginTop: 10 },
  emptySub: { fontSize: 13, color: Brand.textMuted, marginTop: 4, textAlign: "center" },

  // University card styles
  uniCodeBadge: {
    backgroundColor: "#EEF2FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  uniCodeText: { fontSize: 12, fontWeight: "800", color: "#4338CA" },
  locationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  locationPillText: { fontSize: 11, fontWeight: "700", color: "#0369A1" },
  uniCardTitle: { fontSize: 16, fontWeight: "700", color: Brand.text, marginBottom: 4 },
  uniCardLocation: { fontSize: 12, color: Brand.textMuted, marginBottom: 8 },
  uniCardMetaRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  coursesCountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  coursesCountText: { fontSize: 11, fontWeight: "700", color: "#059669", marginLeft: 4 },
  websiteTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F3FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  websiteTagText: { fontSize: 11, fontWeight: "600", color: "#6366F1", marginLeft: 4 },
  uniCardDesc: { fontSize: 12, color: Brand.textSecondary, lineHeight: 17 },

  // Course card styles
  courseCodeBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  courseCodeText: { fontSize: 12, fontWeight: "800", color: Brand.textSecondary },
  streamBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  streamBadgeText: { fontSize: 11, fontWeight: "700" },
  courseName: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 4 },
  courseUniName: { fontSize: 12, fontWeight: "600", color: Brand.primary, marginBottom: 8 },
  courseDetailsRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  minZBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  minZText: { fontSize: 11, fontWeight: "700", color: "#059669", marginLeft: 4 },
  durationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  durationText: { fontSize: 11, fontWeight: "600", color: "#64748B", marginLeft: 4 },
  degreeBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  degreeText: { fontSize: 11, fontWeight: "700", color: Brand.primary },
  careerTagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  careerTag: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  careerTagText: { fontSize: 11, color: Brand.textMuted },

  // Question card styles
  qNumberPill: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  qNumberText: { fontSize: 12, fontWeight: "700", color: Brand.textSecondary },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  catDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  categoryText: { fontSize: 12, fontWeight: "700" },
  qText: { fontSize: 14, lineHeight: 20, color: Brand.text, fontWeight: "500" },

  // Inquiry card styles
  inquiryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  inquiryCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  studentBadgeWrap: { flex: 1 },
  studentNameTag: { fontSize: 14, fontWeight: "700", color: Brand.text },
  studentEmailTag: { fontSize: 11, color: Brand.textMuted },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },
  inquirySubject: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 6 },
  inquiryMessage: { fontSize: 13, color: Brand.textSecondary, lineHeight: 19, marginBottom: 10 },
  adminReplySnippet: {
    flexDirection: "row",
    backgroundColor: "#ECFDF5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "flex-start",
  },
  adminReplyText: { flex: 1, fontSize: 12, color: "#065F46", marginLeft: 6, lineHeight: 16 },
  inquiryActionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  inquiryDate: { fontSize: 12, color: Brand.textMuted },
  replyActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Brand.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  replyActionBtnText: { color: "#FFFFFF", fontSize: 12, fontWeight: "700" },

  // Filter pills
  filterPillsRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterPillActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  filterPillText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  filterPillTextActive: { color: "#FFFFFF", fontWeight: "700" },
  streamFilterScroll: { flexDirection: "row", marginBottom: 14 },
  streamPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  streamPillActive: { backgroundColor: Brand.primary, borderColor: Brand.primary },
  streamPillText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  streamPillTextActive: { color: "#FFFFFF", fontWeight: "700" },
  sectionHeader: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 10 },

  // Student styles
  studentCardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Brand.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 16, fontWeight: "700", color: Brand.primary },
  studentName: { fontSize: 14, fontWeight: "700", color: Brand.text },
  studentEmail: { fontSize: 12, color: Brand.textMuted, marginTop: 1 },
  zScoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  zScoreText: { fontSize: 12, fontWeight: "700" },
  studentMetaRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaItem: { flexDirection: "row", alignItems: "center" },
  metaText: { fontSize: 12, color: Brand.textSecondary, marginLeft: 4 },

  // Stats styles
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 16 },
  statBox: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statLabel: { fontSize: 12, color: Brand.textMuted, fontWeight: "600" },
  statNum: { fontSize: 22, fontWeight: "800", color: Brand.text, marginTop: 4 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: Brand.text, marginBottom: 12 },
  distributionRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  distLabel: { width: 120, fontSize: 12, color: Brand.textSecondary, fontWeight: "500" },
  distBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    overflow: "hidden",
    marginHorizontal: 8,
  },
  distBarFill: { height: "100%", backgroundColor: Brand.primary, borderRadius: 4 },
  distCount: { width: 30, fontSize: 12, fontWeight: "700", color: Brand.text, textAlign: "right" },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  announcementOverlay: {
    alignItems: "center",
    ...(Platform.OS === "web" ? { justifyContent: "center", padding: 16 } : {}),
  },
  announcementContent: {
    width: "100%",
    maxWidth: 680,
    height: "85%",
    maxHeight: "85%",
    ...(Platform.OS === "web" ? { borderRadius: 24 } : {}),
  },
  announcementForm: { flex: 1, minHeight: 0 },
  announcementActions: { marginTop: 16, marginBottom: 0, flexShrink: 0 },
  announcementDeleteContent: { width: "100%", maxWidth: 480, borderRadius: 24 },
  announcementError: { color: "#B91C1C", backgroundColor: "#FEF2F2", padding: 12, borderRadius: 8, marginBottom: 12 },
  announcementNotice: { color: "#166534", backgroundColor: "#F0FDF4", padding: 12, borderRadius: 8, marginBottom: 12 },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalCategoryText: { fontSize: 12, color: Brand.primary, fontWeight: "700", marginBottom: 2 },
  modalTitle: { fontSize: 17, fontWeight: "700", color: Brand.text },
  modalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Brand.textSecondary,
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    fontSize: 14,
    color: Brand.text,
  },
  modalTextInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: Brand.text,
    minHeight: 80,
    textAlignVertical: "top",
  },
  studentQuestionQuote: {
    backgroundColor: "#F8FAFC",
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Brand.primary,
  },
  quoteText: { fontSize: 13, color: Brand.text, lineHeight: 18 },
  catPickerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catOptionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
  },
  catOptionText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  chipItem: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginRight: 8,
  },
  chipItemActive: {
    backgroundColor: Brand.primary,
    borderColor: Brand.primary,
  },
  chipItemText: { fontSize: 12, color: Brand.textSecondary, fontWeight: "600" },
  chipItemTextActive: { color: "#FFFFFF", fontWeight: "700" },
  modalBtnRow: { flexDirection: "row", gap: 12, marginTop: 24, marginBottom: 20 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
  },
  modalCancelText: { fontSize: 14, fontWeight: "600", color: Brand.textSecondary },
  modalSaveBtn: {
    flex: 1.5,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Brand.primary,
    alignItems: "center",
  },
  modalSaveText: { fontSize: 14, fontWeight: "700", color: "#FFFFFF" },
});
