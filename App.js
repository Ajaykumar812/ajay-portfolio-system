import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Share,
  StatusBar,
  SafeAreaView,
  Dimensions,
  Animated,
  Modal,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const { width } = Dimensions.get('window');

// ─── Modern Cyber & Glass Color System ──────────────────────────────────────
const COLORS = {
  bg: '#040711',
  card: '#0D1424',
  cardBorder: 'rgba(0, 240, 255, 0.22)',
  cardBorderGlow: 'rgba(112, 0, 255, 0.35)',
  glass: 'rgba(255, 255, 255, 0.04)',
  nav: '#080E1C',
  cyan: '#00F0FF',
  purple: '#7000FF',
  pink: '#FF007A',
  green: '#00FF9D',
  amber: '#FFB800',
  white: '#FFFFFF',
  white80: 'rgba(255, 255, 255, 0.88)',
  white60: 'rgba(255, 255, 255, 0.62)',
  white30: 'rgba(255, 255, 255, 0.32)',
  white10: 'rgba(255, 255, 255, 0.08)',
  error: '#FF4757',
  errorBg: 'rgba(255, 71, 87, 0.15)',
  success: '#2ED573',
  successBg: 'rgba(46, 213, 115, 0.18)'
};

const BASE_URL = "https://ajaykumardotandaimldeveloper.runasp.net";
const BACKEND_API_URL = "http://10.0.2.2:5000"; // Android Emulator to localhost API
const ADMIN_PASSCODE = "1234";

// ─── Initial Dataset ────────────────────────────────────────────────────────
const INITIAL_DATA = {
  Profile: {
    Name: "Ajay Kumar",
    Title: "Full Stack Developer & AI Specialist",
    SubTitle: "Architecting Web Apps, AI Models & Mobile Interfaces",
    Description: "I am a passionate Full Stack Developer and AI/ML enthusiast. I build scalable backend services, modern web & mobile user interfaces, and deploy custom machine learning automation pipelines.",
    Email: "ajaykumar737905@gmail.com",
    Phone: "+91 7318104815",
    Address: "Gurugram, Haryana, India",
    LinkedIn: "https://linkedin.com/in/ajaykumar",
    GitHub: "https://github.com/ajaykumar",
    Status: "Open for Opportunities",
    ExperienceYears: "2+"
  },
  VisitorStats: {
    totalViews: 384,
    todayViews: 28,
    activeChats: 2,
    downloads: 14,
    chartData: [45, 60, 52, 75, 90, 82, 110],
    chartLabels: ["M", "T", "W", "T", "F", "S", "S"]
  },
  Skills: [
    { name: "ASP.NET Core / C# / Entity Framework", percentage: 95, category: "Backend", level: "Master" },
    { name: "SQL Server & Query Optimization", percentage: 90, category: "Database", level: "Master" },
    { name: "React Web & React Native Mobile", percentage: 88, category: "Frontend", level: "Expert" },
    { name: "Python / TensorFlow / AI Models", percentage: 82, category: "AI / ML", level: "Expert" },
    { name: "HTML5 / Vanilla CSS / UI Design", percentage: 92, category: "Frontend", level: "Master" },
    { name: "Git / GitHub / CI/CD Pipelines", percentage: 86, category: "Tools", level: "Advanced" }
  ],
  Projects: [
    {
      id: 1,
      title: "Portfolio Management System",
      category: "Full Stack",
      description: "A complete professional portfolio dashboard featuring active visitor tracking, resume download analytics, direct email notifications, and an administrative manager console.",
      tags: [".NET 9", "C#", "SQL Server", "React Native", "ChartJS"],
      liveLink: BASE_URL,
      githubLink: "https://github.com/ajaykumar",
      featured: true
    },
    {
      id: 2,
      title: "AutoTube Video Generator",
      category: "AI / ML",
      description: "An automated content generation system utilizing voice synthesis and custom video rendering modules to produce and schedule daily YouTube contents dynamically.",
      tags: ["Python", "FFmpeg", "YouTube API", "OAUTH2", "TTS"],
      liveLink: "#",
      githubLink: "https://github.com/ajaykumar",
      featured: true
    },
    {
      id: 3,
      title: "Academic Resource Study Portal",
      category: "Web App",
      description: "Academic resources portal for AKTU students featuring subject catalogs, syllabus downloads, notes directory, and online payment integrations.",
      tags: ["ASP.NET MVC", "C#", "Razor Views", "Bootstrap", "RazorPay"],
      liveLink: "#",
      githubLink: "https://github.com/ajaykumar",
      featured: false
    }
  ],
  Experience: [
    {
      company: "Freelance Software Developer",
      role: "Full Stack Engineer & AI Integrator",
      duration: "Jan 2023 - Present",
      period: "2 Years +",
      desc: "Designed and implemented robust MVC web architectures, integrated automated email notification systems, and deployed custom machine learning algorithms for automation pipelines."
    }
  ],
  Education: [
    {
      institute: "AKTU Affiliated College",
      degree: "Bachelor of Technology (CSE)",
      year: "2020 - 2024",
      score: "82% Aggregate"
    }
  ],
  Services: [
    {
      id: 1,
      icon: "🌐",
      title: "Full-Stack Web Development",
      description: "Custom enterprise web applications built with ASP.NET Core, React, and SQL Server. Scalable backend REST APIs with modern reactive user interfaces.",
      features: ["ASP.NET Core / C# APIs", "React & Vanilla CSS UI", "SQL Server Optimization", "Authentication & Security"],
      timeline: "1-3 Weeks"
    },
    {
      id: 2,
      icon: "📱",
      title: "Mobile App Development",
      description: "Cross-platform iOS & Android mobile applications built using React Native and Expo with smooth micro-animations and offline storage.",
      features: ["React Native / Expo", "Custom Glass UI", "AsyncStorage & Offline Mode", "Native Android Build (APK)"],
      timeline: "2-4 Weeks"
    },
    {
      id: 3,
      icon: "🤖",
      title: "AI / ML Integration & Automation",
      description: "Custom Python automation scripts, video generators, voice synthesis, fine-tuned ML models, and smart API backend connections.",
      features: ["Python & TensorFlow", "TTS & FFmpeg Processing", "Automated Video Pipeline", "RESTful AI API Integration"],
      timeline: "1-2 Weeks"
    },
    {
      id: 4,
      icon: "⚡",
      title: "Database Architecture & Optimization",
      description: "High-performance database modeling, stored procedure optimization, indexing strategies, and EF Core query tuning for high load applications.",
      features: ["SQL Server & Indexing", "Entity Framework Core", "Data Migration Scripts", "Performance Profiling"],
      timeline: "3-7 Days"
    }
  ],
  Blogs: [
    {
      id: 1,
      title: "Getting Started with ASP.NET Core & SQL Server",
      excerpt: "Learn how to establish database connections and implement the Repository Pattern for clean web development architectures.",
      content: "ASP.NET Core combined with SQL Server provides one of the most reliable and high-performance stacks for enterprise web applications. In this article, we explore how to set up Entity Framework Core, configure connection strings securely, and utilize the Repository Pattern for dependency injection and testability.",
      date: "July 19, 2026",
      readTime: "4 min read",
      author: "Ajay Kumar",
      tags: [".NET", "SQL Server", "Architecture"]
    },
    {
      id: 2,
      title: "Integrating Machine Learning Models in Mobile Apps",
      excerpt: "A developer guide to using Python APIs to invoke machine learning inference engines inside mobile client applications.",
      content: "Mobile hardware has evolved significantly, but running heavy ML inference locally can consume device battery and memory. Connecting React Native apps to a lightweight Flask/FastAPI backend hosting TensorFlow or PyTorch models provides an efficient, scalable solution.",
      date: "July 15, 2026",
      readTime: "6 min read",
      author: "Ajay Kumar",
      tags: ["Python", "AI / ML", "React Native"]
    },
    {
      id: 3,
      title: "Building High Performance Mobile Interfaces with Expo",
      excerpt: "Tips and tricks for smooth animations, custom tab bars, dark mode glassmorphism, and responsive layouts in React Native.",
      content: "Creating a standout mobile experience requires attention to visual design, smooth animations, and fast render cycles. Using LinearGradient, Animated API, and clean flexbox layouts allows developers to build futuristic cyber-glass interfaces that wow users.",
      date: "July 10, 2026",
      readTime: "5 min read",
      author: "Ajay Kumar",
      tags: ["React Native", "Expo", "UI Design"]
    }
  ],
  Messages: [
    { id: 1, name: "Aman Gupta", email: "aman@tcs.com", subject: "Full Stack Opportunity", message: "Hi Ajay, we loved your portfolio app! Are you open to a full stack developer role in Gurugram?", createdDate: "Jul 24, 2026", isRead: false },
    { id: 2, name: "Tech Recruiter", email: "recruiter@hiring.com", subject: "Interview Schedule", message: "Great work with your AI video generator project. Let's schedule a call.", createdDate: "Jul 22, 2026", isRead: true }
  ],
  Bookings: [
    { id: 1, name: "Rohit Sen", email: "rohit@infosys.com", date: "2026-07-28", time: "02:00 PM - 02:30 PM", notes: "Technical interview discussion" }
  ]
};

// ─── Shared Context ──────────────────────────────────────────────────────────
const PortfolioContext = createContext(null);
const Tab = createBottomTabNavigator();

export default function App() {
  const [portfolioData, setPortfolioData] = useState(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [activeProjectModal, setActiveProjectModal] = useState(null);
  const [activeBlogModal, setActiveBlogModal] = useState(null);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);
  const [prefillContactSubject, setPrefillContactSubject] = useState('');

  // Splash Animation
  const logoScale = useState(new Animated.Value(0.2))[0];
  const splashOpacity = useState(new Animated.Value(1))[0];

  useEffect(() => {
    loadData();
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 12, friction: 3, useNativeDriver: true }),
      Animated.delay(1500),
      Animated.timing(splashOpacity, { toValue: 0, duration: 500, useNativeDriver: true })
    ]).start(() => {
      setShowSplash(false);
    });
  }, []);

  const loadData = async () => {
    try {
      const stored = await AsyncStorage.getItem('app_portfolio_data_v2');
      if (stored) {
        setPortfolioData(JSON.parse(stored));
      }
    } catch {
      console.log("AsyncStorage read fallback");
    } finally {
      setLoading(false);
    }
  };

  const saveData = async (updated) => {
    try {
      await AsyncStorage.setItem('app_portfolio_data_v2', JSON.stringify(updated));
      setPortfolioData(updated);
    } catch {
      console.log("AsyncStorage write error");
    }
  };

  const updateProfile = (updatedProfile) => {
    const updated = { ...portfolioData, Profile: { ...portfolioData.Profile, ...updatedProfile } };
    saveData(updated);
  };

  const addSkill = (name, percentage, category) => {
    const updated = {
      ...portfolioData,
      Skills: [...portfolioData.Skills, { name, percentage, category, level: percentage > 90 ? "Master" : "Expert" }]
    };
    saveData(updated);
  };

  const deleteSkill = (index) => {
    const updatedSkills = portfolioData.Skills.filter((_, i) => i !== index);
    saveData({ ...portfolioData, Skills: updatedSkills });
  };

  const addProject = (proj) => {
    const updated = {
      ...portfolioData,
      Projects: [proj, ...portfolioData.Projects]
    };
    saveData(updated);
  };

  const deleteProject = (id) => {
    const updatedProjects = portfolioData.Projects.filter(p => p.id !== id);
    saveData({ ...portfolioData, Projects: updatedProjects });
  };

  // ─── FIXED MESSAGE SEND FUNCTION ─────────────────────────────────────────
  const sendMessageHandler = async ({ name, email, subject, message }) => {
    const newMsg = {
      id: Date.now(),
      name,
      email,
      subject: subject || "Direct Contact Message",
      message,
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      isRead: false
    };

    // 1. Immediately update Local State & Storage
    const updated = {
      ...portfolioData,
      Messages: [newMsg, ...portfolioData.Messages]
    };
    await saveData(updated);

    // 2. Try sending HTTP POST to backend API (if active)
    try {
      await fetch(`${BACKEND_API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMsg)
      });
    } catch (e) {
      console.log("Backend API offline, saved locally to Inbox");
    }

    // 3. Trigger Native Mail App composer as fallback
    try {
      const emailUrl = `mailto:${portfolioData.Profile.Email}?subject=${encodeURIComponent(subject || "Inquiry from App")}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
      const canOpen = await Linking.canOpenURL(emailUrl);
      if (canOpen) {
        await Linking.openURL(emailUrl);
      }
    } catch (err) {
      console.log("Native mail app launcher skipped");
    }

    return true;
  };

  const markMessageRead = (id) => {
    const updatedMsgs = portfolioData.Messages.map(m => m.id === id ? { ...m, isRead: true } : m);
    saveData({ ...portfolioData, Messages: updatedMsgs });
  };

  const deleteMessage = (id) => {
    const updatedMsgs = portfolioData.Messages.filter(m => m.id !== id);
    saveData({ ...portfolioData, Messages: updatedMsgs });
  };

  const addBooking = (booking) => {
    const newBooking = { id: Date.now(), ...booking };
    const updated = {
      ...portfolioData,
      Bookings: [newBooking, ...portfolioData.Bookings]
    };
    saveData(updated);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🔥 Check out ${portfolioData.Profile.Name}'s Official Mobile App & Developer Portfolio! ${BASE_URL}`
      });
    } catch (e) {
      console.log(e.message);
    }
  };

  const contextValue = {
    portfolioData,
    loading,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    activeProjectModal,
    setActiveProjectModal,
    activeBlogModal,
    setActiveBlogModal,
    isMenuDrawerOpen,
    setIsMenuDrawerOpen,
    prefillContactSubject,
    setPrefillContactSubject,
    updateProfile,
    addSkill,
    deleteSkill,
    addProject,
    deleteProject,
    sendMessageHandler,
    markMessageRead,
    deleteMessage,
    addBooking,
    handleShare
  };

  if (showSplash) {
    return (
      <Animated.View style={[styles.splashScreen, { opacity: splashOpacity }]}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <LinearGradient colors={[COLORS.bg, '#0B1222', COLORS.bg]} style={StyleSheet.absoluteFill} />
        <Animated.View style={{ transform: [{ scale: logoScale }], alignItems: 'center' }}>
          <LinearGradient colors={[COLORS.cyan, COLORS.purple, COLORS.pink]} style={styles.splashGlowLogo}>
            <Text style={styles.splashLogoText}>AK</Text>
          </LinearGradient>
          <Text style={styles.splashName}>{portfolioData.Profile.Name}</Text>
          <Text style={styles.splashTitle}>Mobile App & Developer Suite</Text>

          <View style={styles.splashPillsRow}>
            {["React Native", ".NET", "AI/ML", "SQL"].map((tag, idx) => (
              <View key={idx} style={styles.splashPill}>
                <Text style={styles.splashPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
        <ActivityIndicator size="small" color={COLORS.cyan} style={styles.splashSpinner} />
      </Animated.View>
    );
  }

  return (
    <PortfolioContext.Provider value={contextValue}>
      <SafeAreaView style={styles.appContainer}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />
        <NavigationContainer theme={{
          dark: true,
          colors: {
            background: COLORS.bg,
            card: COLORS.nav,
            text: COLORS.white,
            border: 'rgba(255,255,255,0.06)',
            primary: COLORS.cyan,
            notification: COLORS.purple
          }
        }}>
          <Tab.Navigator
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
              headerShown: true,
              header: () => <HeaderBar />
            }}
          >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Skills" component={SkillsScreen} />
            <Tab.Screen name="Projects" component={ProjectsScreen} />
            <Tab.Screen name="Services" component={ServicesScreen} />
            <Tab.Screen name="Blogs" component={BlogsScreen} />
            <Tab.Screen name="Analytics" component={AnalyticsScreen} />
            <Tab.Screen name="Contact" component={ContactScreen} />
            <Tab.Screen name="Admin" component={AdminScreen} />
          </Tab.Navigator>

          {/* Global Quick All-Menus Drawer Modal */}
          <MenuDrawerModal />
        </NavigationContainer>

        {/* Global Project Detail Bottom Sheet Modal */}
        {activeProjectModal && <ProjectDetailModal />}

        {/* Global Blog Article Detail Modal */}
        {activeBlogModal && <BlogDetailModal />}
      </SafeAreaView>
    </PortfolioContext.Provider>
  );
}

// ─── Header Bar Component ───────────────────────────────────────────────────
function HeaderBar() {
  const { portfolioData, handleShare, setIsMenuDrawerOpen } = useContext(PortfolioContext);

  return (
    <View style={styles.topHeader}>
      <View style={styles.headerProfileRow}>
        <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.headerAvatar}>
          <Text style={styles.headerAvatarText}>AK</Text>
        </LinearGradient>
        <View style={styles.headerTextGroup}>
          <View style={styles.headerNameBadgeRow}>
            <Text style={styles.headerName}>{portfolioData.Profile.Name}</Text>
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedIcon}>✓</Text>
            </View>
          </View>
          <Text style={styles.headerRole}>{portfolioData.Profile.Title}</Text>
        </View>
      </View>

      <View style={styles.headerActionsGroup}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={handleShare} activeOpacity={0.7}>
          <Text style={styles.iconSymbol}>🔗</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => Linking.openURL(BASE_URL)} activeOpacity={0.7}>
          <Text style={styles.iconSymbol}>🌐</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerThreeDotBtn} onPress={() => setIsMenuDrawerOpen(true)} activeOpacity={0.7}>
          <Text style={styles.threeDotIconSymbol}>⋮</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Custom Floating Navigation Bar ─────────────────────────────────────────
function CustomTabBar({ state, descriptors, navigation }) {
  const { portfolioData } = useContext(PortfolioContext);
  const unreadMessages = portfolioData.Messages.filter(m => !m.isRead).length;

  const icons = {
    Home: '🏠',
    Skills: '⚡',
    Projects: '🚀',
    Services: '🛠️',
    Blogs: '📖',
    Analytics: '📊',
    Contact: '📬',
    Admin: '🔐'
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabGlassBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, alignItems: 'center' }}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate({ name: route.name, merge: true });
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={[styles.tabButton, isFocused && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                {isFocused && (
                  <LinearGradient
                    colors={['rgba(0, 240, 255, 0.25)', 'rgba(112, 0, 255, 0.15)']}
                    style={StyleSheet.absoluteFill}
                    borderRadius={14}
                  />
                )}
                <View style={styles.tabIconWrapper}>
                  <Text style={[styles.tabIconText, isFocused && styles.tabIconActiveText]}>
                    {icons[route.name]}
                  </Text>
                  {route.name === 'Analytics' && unreadMessages > 0 && (
                    <View style={styles.tabBadge}>
                      <Text style={styles.tabBadgeText}>{unreadMessages}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.tabLabelText, isFocused && styles.tabLabelActiveText]}>
                  {route.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

// ─── 1. Home Screen ───
function HomeScreen({ navigation }) {
  const { portfolioData, setActiveProjectModal } = useContext(PortfolioContext);
  const { Profile, VisitorStats, Experience, Education } = portfolioData;

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      {/* Hero Card */}
      <View style={styles.heroGlassCard}>
        <LinearGradient
          colors={['rgba(0, 240, 255, 0.15)', 'rgba(112, 0, 255, 0.08)', 'rgba(255, 0, 122, 0.03)']}
          style={StyleSheet.absoluteFill}
          borderRadius={24}
        />
        <View style={styles.heroTopRow}>
          <View style={styles.availabilityChip}>
            <View style={styles.greenPulseDot} />
            <Text style={styles.availabilityText}>{Profile.Status}</Text>
          </View>
          <Text style={styles.expBadge}>{Profile.ExperienceYears} Experience</Text>
        </View>

        <Text style={styles.heroGreeting}>Hello World, I'm</Text>
        <Text style={styles.heroMainName}>{Profile.Name}</Text>
        <Text style={styles.heroSubHeading}>{Profile.SubTitle}</Text>
        <Text style={styles.heroDescription}>{Profile.Description}</Text>

        <View style={styles.heroQuickActionsRow}>
          <TouchableOpacity
            style={styles.heroPrimaryBtn}
            onPress={() => navigation.navigate('Projects')}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.btnGradient}>
              <Text style={styles.heroPrimaryBtnText}>Explore Projects 🚀</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.heroSecondaryBtn}
            onPress={() => navigation.navigate('Contact')}
            activeOpacity={0.8}
          >
            <Text style={styles.heroSecondaryBtnText}>Hire Me ✉️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Metrics Row */}
      <Text style={styles.sectionHeading}>📊 Live Activity Overview</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{VisitorStats.totalViews}</Text>
          <Text style={styles.metricLabel}>Total Views</Text>
          <Text style={styles.metricTrend}>↑ +18% this week</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{portfolioData.Projects.length}</Text>
          <Text style={styles.metricLabel}>Active Projects</Text>
          <Text style={styles.metricTrend}>Live & Verified</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{portfolioData.Skills.length}</Text>
          <Text style={styles.metricLabel}>Core Skills</Text>
          <Text style={styles.metricTrend}>Mastered</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricNumber}>{VisitorStats.downloads}</Text>
          <Text style={styles.metricLabel}>Downloads</Text>
          <Text style={styles.metricTrend}>Resumes & Docs</Text>
        </View>
      </View>

      {/* Featured Projects Carousel */}
      <View style={styles.sectionHeaderBetween}>
        <Text style={styles.sectionHeading}>🌟 Featured Work</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
          <Text style={styles.seeAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
        {portfolioData.Projects.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.featuredCard}
            onPress={() => setActiveProjectModal(item)}
            activeOpacity={0.85}
          >
            <LinearGradient colors={['#141D33', '#0C1222']} style={styles.featuredCardInner}>
              <View style={styles.featuredTagRow}>
                <Text style={styles.featuredCategory}>{item.category}</Text>
                <Text style={styles.featuredTapHint}>Tap for Details ℹ️</Text>
              </View>
              <Text style={styles.featuredTitle}>{item.title}</Text>
              <Text style={styles.featuredDesc} numberOfLines={2}>{item.description}</Text>

              <View style={styles.pillsWrap}>
                {item.tags.slice(0, 3).map((tag, idx) => (
                  <View key={idx} style={styles.techPill}>
                    <Text style={styles.techPillText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Professional Experience */}
      <Text style={styles.sectionHeading}>💼 Work Experience</Text>
      {Experience.map((exp, idx) => (
        <View key={idx} style={styles.timelineCard}>
          <View style={styles.timelineAccentLine} />
          <View style={styles.timelineContent}>
            <View style={styles.timelineTopRow}>
              <Text style={styles.timelineRole}>{exp.role}</Text>
              <Text style={styles.timelinePeriod}>{exp.period}</Text>
            </View>
            <Text style={styles.timelineCompany}>{exp.company}</Text>
            <Text style={styles.timelineDesc}>{exp.desc}</Text>
          </View>
        </View>
      ))}

      {/* Education */}
      <Text style={styles.sectionHeading}>🎓 Education</Text>
      {Education.map((edu, idx) => (
        <View key={idx} style={styles.eduCard}>
          <Text style={styles.eduDegree}>{edu.degree}</Text>
          <Text style={styles.eduInstitute}>{edu.institute} • {edu.year}</Text>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>Aggregate: {edu.score}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── 2. Skills Screen ───
function SkillsScreen() {
  const { portfolioData } = useContext(PortfolioContext);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Backend', 'Frontend', 'Database', 'AI / ML', 'Tools'];

  const filteredSkills = portfolioData.Skills.filter(skill => {
    const matchesCategory = selectedCategory === 'All' || skill.category === selectedCategory;
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>⚡ Technical Skills & Proficiencies</Text>
        <Text style={styles.pageSubTitle}>Interactive breakdown of architectural & framework expertise</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBarBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search skill (e.g. C#, React, Python)..."
          placeholderTextColor={COLORS.white60}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {categories.map((cat, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.categoryChip, selectedCategory === cat && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.categoryChipText, selectedCategory === cat && styles.categoryChipActiveText]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Skill List Cards */}
      {filteredSkills.map((skill, idx) => (
        <View key={idx} style={styles.skillCard}>
          <View style={styles.skillCardTop}>
            <View style={styles.skillNameGroup}>
              <Text style={styles.skillNameText}>{skill.name}</Text>
              <Text style={styles.skillCategoryBadge}>{skill.category}</Text>
            </View>
            <View style={styles.skillLevelBadge}>
              <Text style={styles.skillLevelText}>{skill.percentage}%</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.skillTrack}>
            <LinearGradient
              colors={[COLORS.cyan, COLORS.purple, COLORS.pink]}
              style={[styles.skillFill, { width: `${skill.percentage}%` }]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />
          </View>
        </View>
      ))}

      {filteredSkills.length === 0 && (
        <View style={styles.emptyStateBox}>
          <Text style={styles.emptyStateText}>No matching skills found for "{searchQuery}"</Text>
        </View>
      )}
    </ScrollView>
  );
}

// ─── 3. Projects Screen ───
function ProjectsScreen() {
  const { portfolioData, setActiveProjectModal } = useContext(PortfolioContext);
  const [selectedTag, setSelectedTag] = useState('All');

  const filterTags = ['All', 'Full Stack', 'AI / ML', 'Web App'];

  const filteredProjects = portfolioData.Projects.filter(p => {
    return selectedTag === 'All' || p.category === selectedTag;
  });

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>🚀 Portfolio Projects</Text>
        <Text style={styles.pageSubTitle}>Tap any project card for complete architecture details & live links</Text>
      </View>

      {/* Tag Filters */}
      <View style={styles.filterRow}>
        {filterTags.map((tag, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.tagBtn, selectedTag === tag && styles.tagBtnActive]}
            onPress={() => setSelectedTag(tag)}
          >
            <Text style={[styles.tagBtnText, selectedTag === tag && styles.tagBtnActiveText]}>{tag}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Project Cards */}
      {filteredProjects.map((proj) => (
        <TouchableOpacity
          key={proj.id}
          style={styles.projectMainCard}
          onPress={() => setActiveProjectModal(proj)}
          activeOpacity={0.85}
        >
          <View style={styles.projectCardHeader}>
            <View>
              <Text style={styles.projectCardCategory}>{proj.category}</Text>
              <Text style={styles.projectCardTitle}>{proj.title}</Text>
            </View>
            <View style={styles.detailsBadge}>
              <Text style={styles.detailsBadgeText}>View ➔</Text>
            </View>
          </View>

          <Text style={styles.projectCardDesc}>{proj.description}</Text>

          <View style={styles.pillsWrap}>
            {proj.tags.map((tag, i) => (
              <View key={i} style={styles.techPill}>
                <Text style={styles.techPillText}>{tag}</Text>
              </View>
            ))}
          </View>

          <View style={styles.projectCardFooter}>
            <TouchableOpacity
              style={styles.projectActionBtnPrimary}
              onPress={() => Linking.openURL(proj.liveLink !== '#' ? proj.liveLink : BASE_URL)}
            >
              <Text style={styles.actionBtnTextPrimary}>🌐 Live View</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.projectActionBtnSecondary}
              onPress={() => Linking.openURL(proj.githubLink)}
            >
              <Text style={styles.actionBtnTextSecondary}>📁 Code Repo</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── 4. Analytics & Inbox Screen ───
function AnalyticsScreen() {
  const { portfolioData, markMessageRead, deleteMessage } = useContext(PortfolioContext);
  const { VisitorStats, Messages, Bookings } = portfolioData;

  const maxVal = Math.max(...VisitorStats.chartData);

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>📊 Analytics & Enquiry Console</Text>
        <Text style={styles.pageSubTitle}>Real-time visitor trends, enquiries, and interview bookings</Text>
      </View>

      {/* Visual Chart Card */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>📈 Weekly Visitor Volume</Text>
        <View style={styles.chartBarRow}>
          {VisitorStats.chartData.map((val, idx) => {
            const barHeight = (val / maxVal) * 110;
            return (
              <View key={idx} style={styles.barCol}>
                <Text style={styles.barVal}>{val}</Text>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={[COLORS.cyan, COLORS.purple]}
                    style={[styles.barFill, { height: barHeight }]}
                  />
                </View>
                <Text style={styles.barLabel}>{VisitorStats.chartLabels[idx]}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Client Messages Inbox */}
      <View style={styles.sectionHeaderBetween}>
        <Text style={styles.sectionHeading}>📫 Enquiries Inbox ({Messages.length})</Text>
      </View>

      {Messages.map((msg) => (
        <View key={msg.id} style={[styles.msgCard, !msg.isRead && styles.msgCardUnread]}>
          <View style={styles.msgTopRow}>
            <View style={styles.msgSenderGroup}>
              <Text style={styles.msgSenderName}>{msg.name}</Text>
              <Text style={styles.msgSenderEmail}>{msg.email}</Text>
            </View>
            <Text style={styles.msgDate}>{msg.createdDate}</Text>
          </View>
          <Text style={styles.msgSubject}>Subject: {msg.subject}</Text>
          <Text style={styles.msgContent}>{msg.message}</Text>

          <View style={styles.msgActionsRow}>
            {!msg.isRead && (
              <TouchableOpacity style={styles.markReadBtn} onPress={() => markMessageRead(msg.id)}>
                <Text style={styles.markReadText}>Mark Read ✓</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.deleteMsgBtn} onPress={() => deleteMessage(msg.id)}>
              <Text style={styles.deleteMsgText}>Delete 🗑️</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      {/* Scheduled Calls */}
      <Text style={styles.sectionHeading}>📅 Booked Interviews</Text>
      {Bookings.map((b) => (
        <View key={b.id} style={styles.bookingCard}>
          <Text style={styles.bookingName}>{b.name} ({b.email})</Text>
          <Text style={styles.bookingSlot}>⏰ {b.date} at {b.time}</Text>
          <Text style={styles.bookingNotes}>Note: {b.notes}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── 5. FIXED Contact Screen ───
function ContactScreen() {
  const { portfolioData, sendMessageHandler, addBooking } = useContext(PortfolioContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [validationError, setValidationError] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Booking state
  const [bookName, setBookName] = useState('');
  const [bookEmail, setBookEmail] = useState('');
  const [bookDate, setBookDate] = useState('2026-07-28');
  const [bookTime, setBookTime] = useState('03:00 PM');
  const [bookSuccess, setBookSuccess] = useState(false);

  const handleSubmit = async () => {
    setValidationError('');
    setSentSuccess(false);

    if (!name.trim()) {
      setValidationError('Please enter your full name');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('Please enter a valid email address');
      return;
    }
    if (!message.trim()) {
      setValidationError('Please enter a message before sending');
      return;
    }

    setIsSending(true);

    try {
      await sendMessageHandler({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim() || "Direct App Enquiry",
        message: message.trim()
      });

      setSentSuccess(true);
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    } catch (e) {
      setValidationError('Error processing message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleBookingSubmit = () => {
    if (!bookName.trim() || !bookEmail.trim()) return;
    addBooking({ name: bookName, email: bookEmail, date: bookDate, time: bookTime, notes: "Discussion Call" });
    setBookSuccess(true);
    setBookName('');
    setBookEmail('');
    setTimeout(() => setBookSuccess(false), 4000);
  };

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>📬 Get In Touch</Text>
        <Text style={styles.pageSubTitle}>Send a direct message or schedule a 1-on-1 technical discussion</Text>
      </View>

      {/* Quick Direct Buttons */}
      <View style={styles.contactRowBox}>
        <TouchableOpacity
          style={styles.contactBoxCard}
          onPress={() => Linking.openURL(`mailto:${portfolioData.Profile.Email}`)}
        >
          <Text style={styles.contactBoxIcon}>📧</Text>
          <Text style={styles.contactBoxTitle}>Email Me</Text>
          <Text style={styles.contactBoxSub}>{portfolioData.Profile.Email}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactBoxCard}
          onPress={() => Linking.openURL(`tel:${portfolioData.Profile.Phone}`)}
        >
          <Text style={styles.contactBoxIcon}>📞</Text>
          <Text style={styles.contactBoxTitle}>Call Direct</Text>
          <Text style={styles.contactBoxSub}>{portfolioData.Profile.Phone}</Text>
        </TouchableOpacity>
      </View>

      {/* Message Form */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>✉️ Send Direct Message</Text>

        <TextInput
          style={styles.formInput}
          placeholder="Your Full Name *"
          placeholderTextColor={COLORS.white60}
          value={name}
          onChangeText={(txt) => { setName(txt); setValidationError(''); }}
        />
        <TextInput
          style={styles.formInput}
          placeholder="Your Email Address *"
          placeholderTextColor={COLORS.white60}
          value={email}
          onChangeText={(txt) => { setEmail(txt); setValidationError(''); }}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.formInput}
          placeholder="Subject"
          placeholderTextColor={COLORS.white60}
          value={subject}
          onChangeText={setSubject}
        />
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Write your message here..."
          placeholderTextColor={COLORS.white60}
          value={message}
          onChangeText={(txt) => { setMessage(txt); setValidationError(''); }}
          multiline
          numberOfLines={4}
        />

        {/* Validation Error Banner */}
        {validationError ? (
          <View style={styles.errorBoxAlert}>
            <Text style={styles.errorBoxText}>⚠️ {validationError}</Text>
          </View>
        ) : null}

        {/* Success Banner */}
        {sentSuccess ? (
          <View style={styles.successBoxAlert}>
            <Text style={styles.successBoxText}>✓ Message sent! It is saved to your Inbox.</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={isSending}
          activeOpacity={0.8}
        >
          <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.btnGradient}>
            {isSending ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>Send Message Now 🚀</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* Schedule Call */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>📅 Schedule a Tech Discussion</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Your Name *"
          placeholderTextColor={COLORS.white60}
          value={bookName}
          onChangeText={setBookName}
        />
        <TextInput
          style={styles.formInput}
          placeholder="Your Email *"
          placeholderTextColor={COLORS.white60}
          value={bookEmail}
          onChangeText={setBookEmail}
        />

        <TouchableOpacity style={styles.submitBtn} onPress={handleBookingSubmit} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Confirm Slot (Jul 28, 3:00 PM)</Text>
        </TouchableOpacity>

        {bookSuccess && (
          <View style={styles.successBoxAlert}>
            <Text style={styles.successBoxText}>✓ Discussion slot reserved!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── 6. Admin Screen ───
function AdminScreen() {
  const { portfolioData, isAdminLoggedIn, setIsAdminLoggedIn, addSkill, deleteSkill, addProject, deleteProject } = useContext(PortfolioContext);
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Skill Add State
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillPercent, setNewSkillPercent] = useState('90');
  const [newSkillCategory, setNewSkillCategory] = useState('Backend');

  // Project Add State
  const [projTitle, setProjTitle] = useState('');
  const [projCategory, setProjCategory] = useState('Full Stack');
  const [projDesc, setProjDesc] = useState('');

  const handleLogin = () => {
    if (passcode === ADMIN_PASSCODE) {
      setIsAdminLoggedIn(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid passcode! Use 1234');
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName) return;
    addSkill(newSkillName, parseInt(newSkillPercent) || 80, newSkillCategory);
    setNewSkillName('');
  };

  const handleAddProject = () => {
    if (!projTitle || !projDesc) return;
    addProject({
      id: Date.now(),
      title: projTitle,
      category: projCategory,
      description: projDesc,
      tags: [projCategory, "React Native", ".NET"],
      liveLink: BASE_URL,
      githubLink: "https://github.com/ajaykumar"
    });
    setProjTitle('');
    setProjDesc('');
  };

  if (!isAdminLoggedIn) {
    return (
      <View style={styles.adminLoginContainer}>
        <View style={styles.loginGlassCard}>
          <Text style={styles.loginTitle}>🔐 Admin Console</Text>
          <Text style={styles.loginSub}>Enter passcode to unlock CRUD controls</Text>

          <TextInput
            style={styles.passInput}
            placeholder="Enter Passcode (1234)"
            placeholderTextColor={COLORS.white60}
            secureTextEntry
            keyboardType="number-pad"
            value={passcode}
            onChangeText={setPasscode}
          />

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
            <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.btnGradient}>
              <Text style={styles.loginBtnText}>Unlock Admin Console ➔</Text>
            </LinearGradient>
          </TouchableOpacity>

          {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.adminHeaderRow}>
        <View>
          <Text style={styles.pageTitle}>⚡ Admin Dashboard</Text>
          <Text style={styles.pageSubTitle}>Manage skills, projects, & live app configuration</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={() => setIsAdminLoggedIn(false)}>
          <Text style={styles.logoutText}>Lock 🔒</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Skill */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>➕ Add New Skill</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Skill Name (e.g. Docker, GraphQL)"
          placeholderTextColor={COLORS.white60}
          value={newSkillName}
          onChangeText={setNewSkillName}
        />
        <TextInput
          style={styles.formInput}
          placeholder="Percentage (0 - 100)"
          placeholderTextColor={COLORS.white60}
          keyboardType="number-pad"
          value={newSkillPercent}
          onChangeText={setNewSkillPercent}
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddSkill}>
          <Text style={styles.submitBtnText}>Add Skill to App</Text>
        </TouchableOpacity>
      </View>

      {/* Add New Project */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>➕ Add New Project</Text>
        <TextInput
          style={styles.formInput}
          placeholder="Project Title"
          placeholderTextColor={COLORS.white60}
          value={projTitle}
          onChangeText={setProjTitle}
        />
        <TextInput
          style={[styles.formInput, styles.textArea]}
          placeholder="Project Summary Description..."
          placeholderTextColor={COLORS.white60}
          value={projDesc}
          onChangeText={setProjDesc}
          multiline
        />
        <TouchableOpacity style={styles.submitBtn} onPress={handleAddProject}>
          <Text style={styles.submitBtnText}>Publish Project</Text>
        </TouchableOpacity>
      </View>

      {/* Manage Existing Skills */}
      <Text style={styles.sectionHeading}>🛠️ Manage Skills ({portfolioData.Skills.length})</Text>
      {portfolioData.Skills.map((s, idx) => (
        <View key={idx} style={styles.adminItemRow}>
          <Text style={styles.adminItemText}>{s.name} ({s.percentage}%)</Text>
          <TouchableOpacity onPress={() => deleteSkill(idx)}>
            <Text style={styles.deleteText}>Delete 🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Manage Projects */}
      <Text style={styles.sectionHeading}>🛠️ Manage Projects ({portfolioData.Projects.length})</Text>
      {portfolioData.Projects.map((p) => (
        <View key={p.id} style={styles.adminItemRow}>
          <Text style={styles.adminItemText}>{p.title}</Text>
          <TouchableOpacity onPress={() => deleteProject(p.id)}>
            <Text style={styles.deleteText}>Delete 🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── 4. Services Screen ───
function ServicesScreen({ navigation }) {
  const { portfolioData, setPrefillContactSubject } = useContext(PortfolioContext);
  const services = portfolioData.Services || [];

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>🛠️ Solutions & Services</Text>
        <Text style={styles.pageSubTitle}>Professional enterprise development, AI automation & software architecture</Text>
      </View>

      {services.map((svc) => (
        <View key={svc.id} style={styles.serviceCard}>
          <LinearGradient colors={['rgba(0, 240, 255, 0.08)', 'rgba(112, 0, 255, 0.03)']} style={StyleSheet.absoluteFill} borderRadius={20} />
          <View style={styles.serviceHeaderRow}>
            <View style={styles.serviceIconBadge}>
              <Text style={styles.serviceIconText}>{svc.icon}</Text>
            </View>
            <View style={styles.serviceTitleGroup}>
              <Text style={styles.serviceTitle}>{svc.title}</Text>
              <Text style={styles.serviceTimeline}>Est: {svc.timeline}</Text>
            </View>
          </View>

          <Text style={styles.serviceDesc}>{svc.description}</Text>

          <Text style={styles.serviceFeaturesLabel}>Key Capabilities:</Text>
          <View style={styles.serviceFeaturesGrid}>
            {svc.features.map((feat, idx) => (
              <View key={idx} style={styles.serviceFeatureItem}>
                <Text style={styles.checkIcon}>✓</Text>
                <Text style={styles.featureText}>{feat}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.serviceInquireBtn}
            onPress={() => {
              if (setPrefillContactSubject) setPrefillContactSubject(`Inquiry regarding ${svc.title}`);
              navigation.navigate('Contact');
            }}
            activeOpacity={0.8}
          >
            <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.btnGradient}>
              <Text style={styles.serviceInquireBtnText}>Inquire for Project ➔</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── 5. Blogs Screen ───
function BlogsScreen() {
  const { portfolioData, setActiveBlogModal } = useContext(PortfolioContext);
  const blogs = portfolioData.Blogs || [];

  return (
    <ScrollView style={styles.screenScroll} contentContainerStyle={styles.scrollPadding}>
      <View style={styles.pageTitleHeader}>
        <Text style={styles.pageTitle}>📖 Engineering & AI Articles</Text>
        <Text style={styles.pageSubTitle}>In-depth technical guides, architecture notes & AI tutorials</Text>
      </View>

      {blogs.map((b) => (
        <TouchableOpacity
          key={b.id}
          style={styles.blogCard}
          onPress={() => setActiveBlogModal(b)}
          activeOpacity={0.85}
        >
          <View style={styles.blogMetaRow}>
            <Text style={styles.blogDate}>{b.date}</Text>
            <Text style={styles.blogReadTime}>⏱️ {b.readTime}</Text>
          </View>

          <Text style={styles.blogTitle}>{b.title}</Text>
          <Text style={styles.blogExcerpt}>{b.excerpt}</Text>

          <View style={styles.blogTagsRow}>
            {(b.tags || ['.NET', 'AI']).map((t, idx) => (
              <View key={idx} style={styles.blogTagChip}>
                <Text style={styles.blogTagText}>#{t}</Text>
              </View>
            ))}
            <Text style={styles.readMoreText}>Read Article ➔</Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ─── Global Quick All-Menus Drawer Modal ───
function MenuDrawerModal() {
  const navigation = useNavigation();
  const { isMenuDrawerOpen, setIsMenuDrawerOpen, handleShare } = useContext(PortfolioContext);
  if (!isMenuDrawerOpen) return null;

  const menuItems = [
    { name: 'Home', icon: '🏠', label: 'Dashboard & Profile', desc: 'Hero introduction & experience highlights' },
    { name: 'Skills', icon: '⚡', label: 'Technical Stack', desc: 'Frameworks, DB, AI/ML & languages' },
    { name: 'Projects', icon: '🚀', label: 'Portfolio Works', desc: 'Live apps, code repos & architecture' },
    { name: 'Services', icon: '🛠️', label: 'Solutions & Services', desc: 'Enterprise dev & consultation' },
    { name: 'Blogs', icon: '📖', label: 'Articles & Tutorials', desc: 'Technical posts & ML guides' },
    { name: 'Analytics', icon: '📊', label: 'Visitor & Inbox Console', desc: 'Live traffic, messages & bookings' },
    { name: 'Contact', icon: '📬', label: 'Get In Touch', desc: 'Direct message & schedule interview' },
    { name: 'Admin', icon: '🔐', label: 'Admin Dashboard', desc: 'Content manager & project editor' }
  ];

  return (
    <Modal animationType="fade" transparent visible={true} onRequestClose={() => setIsMenuDrawerOpen(false)}>
      <View style={styles.drawerOverlay}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsMenuDrawerOpen(false)} />

        <View style={styles.drawerSheet}>
          <LinearGradient colors={['#0D1424', '#080E1C']} style={StyleSheet.absoluteFill} borderRadius={24} />

          <View style={styles.drawerHeader}>
            <View style={styles.drawerHeaderTitleGroup}>
              <Text style={styles.drawerTitle}>⚡ App Navigation & Menu</Text>
              <Text style={styles.drawerSubTitle}>Explore all sections and developer modules</Text>
            </View>
            <TouchableOpacity onPress={() => setIsMenuDrawerOpen(false)} style={styles.drawerCloseBtn}>
              <Text style={styles.drawerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.drawerMenuList}>
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.drawerItemCard}
                onPress={() => {
                  setIsMenuDrawerOpen(false);
                  navigation.navigate(item.name);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.drawerItemIconBox}>
                  <Text style={styles.drawerItemIcon}>{item.icon}</Text>
                </View>
                <View style={styles.drawerItemTextGroup}>
                  <Text style={styles.drawerItemLabel}>{item.label}</Text>
                  <Text style={styles.drawerItemDesc}>{item.desc}</Text>
                </View>
                <Text style={styles.drawerArrow}>➔</Text>
              </TouchableOpacity>
            ))}

            <View style={styles.drawerDivider} />

            <TouchableOpacity style={styles.drawerActionRow} onPress={() => { setIsMenuDrawerOpen(false); handleShare(); }}>
              <Text style={styles.drawerActionIcon}>🔗</Text>
              <Text style={styles.drawerActionText}>Share App Link</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.drawerActionRow} onPress={() => { setIsMenuDrawerOpen(false); Linking.openURL(BASE_URL); }}>
              <Text style={styles.drawerActionIcon}>🌐</Text>
              <Text style={styles.drawerActionText}>Open Web Portfolio in Browser</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Global Blog Detail Modal ───
function BlogDetailModal() {
  const { activeBlogModal, setActiveBlogModal } = useContext(PortfolioContext);
  if (!activeBlogModal) return null;

  return (
    <Modal animationType="slide" transparent visible={true} onRequestClose={() => setActiveBlogModal(null)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: '85%' }]}>
          <View style={styles.modalDragHandle} />

          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalCategory}>📖 Developer Article</Text>
            <TouchableOpacity onPress={() => setActiveBlogModal(null)}>
              <Text style={styles.modalCloseBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ marginTop: 10 }}>
            <Text style={styles.modalTitle}>{activeBlogModal.title}</Text>
            <Text style={styles.blogDate}>Published by {activeBlogModal.author || 'Ajay Kumar'} • {activeBlogModal.date}</Text>

            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 14 }} />

            <Text style={styles.modalDesc}>{activeBlogModal.content || activeBlogModal.excerpt}</Text>

            <View style={[styles.pillsWrap, { marginTop: 20 }]}>
              {(activeBlogModal.tags || []).map((t, idx) => (
                <View key={idx} style={styles.techPillLarge}>
                  <Text style={styles.techPillLargeText}>#{t}</Text>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalSecondaryBtn, { marginTop: 24, marginBottom: 10 }]}
              onPress={() => setActiveBlogModal(null)}
            >
              <Text style={styles.modalSecondaryBtnText}>Close Article ✕</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Global Project Detail Modal ──────────────────────────────────────────────
function ProjectDetailModal() {
  const { activeProjectModal, setActiveProjectModal } = useContext(PortfolioContext);
  if (!activeProjectModal) return null;

  return (
    <Modal animationType="slide" transparent visible={true} onRequestClose={() => setActiveProjectModal(null)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalDragHandle} />

          <View style={styles.modalHeaderRow}>
            <Text style={styles.modalCategory}>{activeProjectModal.category}</Text>
            <TouchableOpacity onPress={() => setActiveProjectModal(null)}>
              <Text style={styles.modalCloseBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalTitle}>{activeProjectModal.title}</Text>
          <Text style={styles.modalDesc}>{activeProjectModal.description}</Text>

          <Text style={styles.modalSectionLabel}>Technologies & Architecture:</Text>
          <View style={styles.pillsWrap}>
            {activeProjectModal.tags.map((t, idx) => (
              <View key={idx} style={styles.techPillLarge}>
                <Text style={styles.techPillLargeText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={styles.modalPrimaryBtn}
              onPress={() => {
                Linking.openURL(activeProjectModal.liveLink !== '#' ? activeProjectModal.liveLink : BASE_URL);
                setActiveProjectModal(null);
              }}
            >
              <LinearGradient colors={[COLORS.cyan, COLORS.purple]} style={styles.btnGradient}>
                <Text style={styles.modalPrimaryBtnText}>Launch Live App 🌐</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalSecondaryBtn}
              onPress={() => {
                Linking.openURL(activeProjectModal.githubLink);
                setActiveProjectModal(null);
              }}
            >
              <Text style={styles.modalSecondaryBtnText}>View Source Code 📁</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── ENHANCED STYLESHEET ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  splashScreen: {
    flex: 1,
    backgroundColor: COLORS.bg,
    justifyContent: 'center',
    alignItems: 'center'
  },
  splashGlowLogo: {
    width: 96,
    height: 96,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  splashLogoText: {
    color: COLORS.white,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 2
  },
  splashName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5
  },
  splashTitle: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 6
  },
  splashPillsRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 8
  },
  splashPill: {
    backgroundColor: COLORS.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  splashPillText: {
    color: COLORS.white80,
    fontSize: 12,
    fontWeight: '600'
  },
  splashSpinner: {
    position: 'absolute',
    bottom: 50
  },

  appContainer: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  topHeader: {
    height: 64,
    backgroundColor: COLORS.nav,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)'
  },
  headerProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerAvatarText: {
    color: COLORS.white,
    fontWeight: '900',
    fontSize: 16
  },
  headerTextGroup: {},
  headerNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  headerName: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 16
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center'
  },
  verifiedIcon: {
    color: COLORS.bg,
    fontSize: 10,
    fontWeight: '900'
  },
  headerRole: {
    color: COLORS.white60,
    fontSize: 12
  },
  headerActionsGroup: {
    flexDirection: 'row',
    gap: 10
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: COLORS.white10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  iconSymbol: {
    fontSize: 16
  },
  headerThreeDotBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cyan
  },
  threeDotIconSymbol: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.cyan,
    marginTop: -2
  },

  tabContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12
  },
  tabGlassBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 14, 28, 0.96)',
    borderRadius: 22,
    padding: 6,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    justifyContent: 'space-around',
    elevation: 12,
    shadowColor: COLORS.cyan,
    shadowOpacity: 0.2,
    shadowRadius: 12
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 14
  },
  tabButtonActive: {},
  tabIconWrapper: {
    position: 'relative'
  },
  tabIconText: {
    fontSize: 18,
    opacity: 0.5
  },
  tabIconActiveText: {
    opacity: 1
  },
  tabLabelText: {
    color: COLORS.white60,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
  },
  tabLabelActiveText: {
    color: COLORS.cyan,
    fontWeight: '800'
  },
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.pink,
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '900'
  },

  screenScroll: {
    flex: 1,
    backgroundColor: COLORS.bg
  },
  scrollPadding: {
    padding: 16,
    paddingBottom: 90
  },

  heroGlassCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14
  },
  availabilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 213, 115, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 6
  },
  greenPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.success
  },
  availabilityText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '700'
  },
  expBadge: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700'
  },
  heroGreeting: {
    color: COLORS.white60,
    fontSize: 14,
    fontWeight: '500'
  },
  heroMainName: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 2
  },
  heroSubHeading: {
    color: COLORS.cyan,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4
  },
  heroDescription: {
    color: COLORS.white80,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10
  },
  heroQuickActionsRow: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12
  },
  heroPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden'
  },
  btnGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  heroPrimaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800'
  },
  heroSecondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  heroSecondaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700'
  },

  sectionHeading: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '800',
    marginVertical: 14
  },
  sectionHeaderBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6
  },
  seeAllText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '700'
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10
  },
  metricCard: {
    width: (width - 42) / 2,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  metricNumber: {
    color: COLORS.cyan,
    fontSize: 24,
    fontWeight: '900'
  },
  metricLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2
  },
  metricTrend: {
    color: COLORS.white60,
    fontSize: 11,
    marginTop: 4
  },

  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
    marginBottom: 10
  },
  featuredCard: {
    width: width * 0.72,
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  featuredCardInner: {
    padding: 16
  },
  featuredTagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  featuredCategory: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: '800'
  },
  featuredTapHint: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '600'
  },
  featuredTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800'
  },
  featuredDesc: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 4,
    lineHeight: 16
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10
  },
  techPill: {
    backgroundColor: COLORS.white10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  techPillText: {
    color: COLORS.white80,
    fontSize: 10,
    fontWeight: '600'
  },

  timelineCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  timelineAccentLine: {
    width: 4,
    backgroundColor: COLORS.cyan,
    borderRadius: 2,
    marginRight: 12
  },
  timelineContent: {
    flex: 1
  },
  timelineTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timelineRole: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14
  },
  timelinePeriod: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700'
  },
  timelineCompany: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2
  },
  timelineDesc: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 6,
    lineHeight: 16
  },

  eduCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  eduDegree: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800'
  },
  eduInstitute: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 4
  },
  scoreBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  scoreText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700'
  },

  pageTitleHeader: {
    marginBottom: 16
  },
  pageTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900'
  },
  pageSubTitle: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 4
  },

  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: COLORS.white,
    fontSize: 13
  },
  clearIcon: {
    color: COLORS.white60,
    fontSize: 14
  },

  categoryScroll: {
    marginBottom: 14
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  categoryChipActive: {
    backgroundColor: COLORS.cyan,
    borderColor: COLORS.cyan
  },
  categoryChipText: {
    color: COLORS.white60,
    fontSize: 12,
    fontWeight: '700'
  },
  categoryChipActiveText: {
    color: COLORS.bg,
    fontWeight: '900'
  },

  skillCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  skillCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  skillNameGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  skillNameText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14
  },
  skillCategoryBadge: {
    color: COLORS.purple,
    fontSize: 10,
    fontWeight: '700',
    backgroundColor: 'rgba(112, 0, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  skillLevelBadge: {},
  skillLevelText: {
    color: COLORS.cyan,
    fontWeight: '900',
    fontSize: 14
  },
  skillTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden'
  },
  skillFill: {
    height: '100%',
    borderRadius: 4
  },

  emptyStateBox: {
    alignItems: 'center',
    padding: 30
  },
  emptyStateText: {
    color: COLORS.white60,
    fontSize: 13
  },

  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14
  },
  tagBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  tagBtnActive: {
    backgroundColor: COLORS.purple,
    borderColor: COLORS.purple
  },
  tagBtnText: {
    color: COLORS.white60,
    fontSize: 12,
    fontWeight: '700'
  },
  tagBtnActiveText: {
    color: COLORS.white
  },

  projectMainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  projectCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  projectCardCategory: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800'
  },
  projectCardTitle: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '900',
    marginTop: 2
  },
  detailsBadge: {
    backgroundColor: COLORS.white10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  detailsBadgeText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '800'
  },
  projectCardDesc: {
    color: COLORS.white80,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8
  },
  projectCardFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14
  },
  projectActionBtnPrimary: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.cyan,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionBtnTextPrimary: {
    color: COLORS.bg,
    fontWeight: '800',
    fontSize: 12
  },
  projectActionBtnSecondary: {
    flex: 1,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.white10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionBtnTextSecondary: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 12
  },

  chartCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  chartTitle: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 16
  },
  chartBarRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140
  },
  barCol: {
    alignItems: 'center',
    width: 24
  },
  barVal: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4
  },
  barTrack: {
    width: 14,
    height: 110,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  barFill: {
    width: '100%',
    borderRadius: 7
  },
  barLabel: {
    color: COLORS.white60,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6
  },

  msgCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  msgCardUnread: {
    borderColor: COLORS.cyan,
    backgroundColor: '#121C30'
  },
  msgTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  msgSenderGroup: {},
  msgSenderName: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14
  },
  msgSenderEmail: {
    color: COLORS.white60,
    fontSize: 11
  },
  msgDate: {
    color: COLORS.cyan,
    fontSize: 10,
    fontWeight: '700'
  },
  msgSubject: {
    color: COLORS.purple,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6
  },
  msgContent: {
    color: COLORS.white80,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4
  },
  msgActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 10
  },
  markReadBtn: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  markReadText: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700'
  },
  deleteMsgBtn: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8
  },
  deleteMsgText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '700'
  },

  bookingCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8
  },
  bookingName: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800'
  },
  bookingSlot: {
    color: COLORS.cyan,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  },
  bookingNotes: {
    color: COLORS.white60,
    fontSize: 11,
    marginTop: 2
  },

  contactRowBox: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14
  },
  contactBoxCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  contactBoxIcon: {
    fontSize: 22,
    marginBottom: 6
  },
  contactBoxTitle: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13
  },
  contactBoxSub: {
    color: COLORS.white60,
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center'
  },

  formCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  formTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14
  },
  formInput: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    color: COLORS.white,
    fontSize: 13,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.15)'
  },
  textArea: {
    height: 96,
    paddingTop: 12,
    textAlignVertical: 'top'
  },
  errorBoxAlert: {
    backgroundColor: COLORS.errorBg,
    padding: 10,
    borderRadius: 10,
    marginBottom: 10
  },
  errorBoxText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center'
  },
  successBoxAlert: {
    backgroundColor: COLORS.successBg,
    padding: 12,
    borderRadius: 10,
    marginBottom: 10
  },
  successBoxText: {
    color: COLORS.success,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center'
  },

  submitBtn: {
    height: 46,
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: COLORS.purple,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14
  },
  bookBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13
  },

  adminLoginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.bg
  },
  loginGlassCard: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center'
  },
  loginTitle: {
    color: COLORS.white,
    fontSize: 22,
    fontWeight: '900'
  },
  loginSub: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 4,
    marginBottom: 20
  },
  passInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    height: 48,
    textAlign: 'center',
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cyan
  },
  loginBtn: {
    width: '100%',
    height: 46,
    borderRadius: 14,
    overflow: 'hidden'
  },
  loginBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 14
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 12,
    fontWeight: '700'
  },

  adminHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  logoutBtn: {
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10
  },
  logoutText: {
    color: COLORS.error,
    fontWeight: '800',
    fontSize: 12
  },
  adminItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8
  },
  adminItemText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700'
  },
  deleteText: {
    color: COLORS.error,
    fontSize: 12,
    fontWeight: '700'
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'flex-end'
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderColor: COLORS.cardBorder
  },
  modalDragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalCategory: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '900'
  },
  modalCloseBtn: {
    color: COLORS.white60,
    fontSize: 18,
    fontWeight: '800'
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6
  },
  modalDesc: {
    color: COLORS.white80,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10
  },
  modalSectionLabel: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 16,
    marginBottom: 8
  },
  techPillLarge: {
    backgroundColor: COLORS.white10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  techPillLargeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700'
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20
  },
  modalPrimaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden'
  },
  modalPrimaryBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13
  },
  modalSecondaryBtn: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.white10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  modalSecondaryBtnText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 13
  },

  headerIconBtnPrimary: {
    backgroundColor: 'rgba(0, 240, 255, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.cyan,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuIconSymbol: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '900'
  },

  // Services Screen Styles
  serviceCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    overflow: 'hidden'
  },
  serviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12
  },
  serviceIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  serviceIconText: {
    fontSize: 22
  },
  serviceTitleGroup: {
    flex: 1
  },
  serviceTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800'
  },
  serviceTimeline: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  serviceDesc: {
    color: COLORS.white80,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 12
  },
  serviceFeaturesLabel: {
    color: COLORS.white60,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8
  },
  serviceFeaturesGrid: {
    gap: 6,
    marginBottom: 16
  },
  serviceFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  checkIcon: {
    color: COLORS.cyan,
    fontWeight: '900',
    fontSize: 13
  },
  featureText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600'
  },
  serviceInquireBtn: {
    height: 42,
    borderRadius: 12,
    overflow: 'hidden'
  },
  serviceInquireBtnText: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: 13
  },

  // Blogs Screen Styles
  blogCard: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  blogMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  blogDate: {
    color: COLORS.white60,
    fontSize: 12,
    fontWeight: '600'
  },
  blogReadTime: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '700'
  },
  blogTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6
  },
  blogExcerpt: {
    color: COLORS.white80,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12
  },
  blogTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  blogTagChip: {
    backgroundColor: COLORS.white10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6
  },
  blogTagText: {
    color: COLORS.white60,
    fontSize: 11,
    fontWeight: '600'
  },
  readMoreText: {
    color: COLORS.cyan,
    fontSize: 12,
    fontWeight: '800'
  },

  // Drawer Sheet Styles
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 17, 0.85)',
    justifyContent: 'flex-end'
  },
  drawerSheet: {
    backgroundColor: COLORS.nav,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  drawerHeaderTitleGroup: {
    flex: 1
  },
  drawerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '900'
  },
  drawerSubTitle: {
    color: COLORS.white60,
    fontSize: 12,
    marginTop: 2
  },
  drawerCloseBtn: {
    padding: 6
  },
  drawerCloseText: {
    color: COLORS.white60,
    fontSize: 20,
    fontWeight: '800'
  },
  drawerMenuList: {
    marginVertical: 4
  },
  drawerItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    padding: 12,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  drawerItemIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  drawerItemIcon: {
    fontSize: 18
  },
  drawerItemTextGroup: {
    flex: 1
  },
  drawerItemLabel: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800'
  },
  drawerItemDesc: {
    color: COLORS.white60,
    fontSize: 11,
    marginTop: 2
  },
  drawerArrow: {
    color: COLORS.cyan,
    fontSize: 16,
    fontWeight: '800'
  },
  drawerDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 14
  },
  drawerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 12
  },
  drawerActionIcon: {
    fontSize: 18
  },
  drawerActionText: {
    color: COLORS.cyan,
    fontSize: 13,
    fontWeight: '800'
  }
});
