export const portfolioData = {
  Profile: {
    Name: "Ajay Kumar",
    Title: "Full Stack Developer & AI/ML Specialist",
    SubTitle: "Designing Scalable MVC Web Applications & Deploying Intelligent Machine Learning Pipelines",
    Description: "I am a passionate Full Stack Developer and AI/ML enthusiast with experience in C#, ASP.NET Core, and database design. I specialize in building efficient, modern, and highly responsive web and mobile user interfaces while integrating smart automation and custom AI models to deliver premium products.",
    Email: "ajaykumar737905@gmail.com",
    Phone: "7318104815",
    Address: "Gurugram, Haryana, India",
    LinkedIn: "https://linkedin.com/in/ajaykumar",
    GitHub: "https://github.com/ajaykumar",
    ResumeUrl: "#"
  },
  Skills: [
    { name: "ASP.NET Core / C# / Entity Framework", percentage: 95, category: "Backend" },
    { name: "SQL Server & Database Query Optimization", percentage: 90, category: "Database" },
    { name: "React Web & React Native Mobile", percentage: 88, category: "Frontend" },
    { name: "Python / TensorFlow / AI/ML Model Training", percentage: 80, category: "AI / ML" },
    { name: "HTML5 / Vanilla CSS / Responsive Layouts", percentage: 92, category: "Frontend" },
    { name: "Git / GitHub / Version Control", percentage: 85, category: "Tools" }
  ],
  Projects: [
    {
      title: "Portfolio Management System",
      description: "A complete professional portfolio dashboard featuring active visitor tracking, resume download analytics, direct email notifications, and an administrative manager console.",
      tags: [".NET 9", "C#", "SQL Server", "CSS Grid", "ChartJS"],
      liveLink: "https://ajaykumardotandaimldeveloper.runasp.net",
      githubLink: "https://github.com"
    },
    {
      title: "AutoTube Video Generator",
      description: "An automated system utilizing voice synthesis and custom video rendering modules to push daily video contents to YouTube channels dynamically.",
      tags: ["Python", "FFmpeg", "YouTube API", "OAUTH2", "TTS"],
      liveLink: "#",
      githubLink: "https://github.com"
    },
    {
      title: "Academic resource Study Portal",
      description: "Academic resources portal for AKTU students featuring subject catalogs, syllabus downloads, notes directory, and online payment integrations.",
      tags: ["ASP.NET MVC", "C#", "Razor Views", "Bootstrap", "RazorPay"],
      liveLink: "#",
      githubLink: "https://github.com"
    }
  ],
  Experience: [
    {
      company: "Freelance Software Developer",
      role: "Full Stack Engineer & AI Integrator",
      duration: "Jan 2023 - Present (2 Years +)",
      desc: "Designed and implemented robust MVC web architectures, integrated automated email notification systems, and deployed custom machine learning algorithms for automation pipelines."
    }
  ],
  Education: [
    {
      institute: "AKTU Affiliated College",
      degree: "Bachelor of Technology in Computer Science & Engineering",
      duration: "2020 - 2024",
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
      title: "Integrating Machine Learning Models in Mobile & Web Apps",
      excerpt: "A developer guide to using Python APIs to invoke machine learning inference engines inside client applications.",
      content: "Connecting React & React Native apps to a lightweight Flask/FastAPI backend hosting TensorFlow or PyTorch models provides an efficient, scalable solution.",
      date: "July 15, 2026",
      readTime: "6 min read",
      author: "Ajay Kumar",
      tags: ["Python", "AI / ML", "React"]
    },
    {
      id: 3,
      title: "Building High Performance Cyber-Glass Interfaces",
      excerpt: "Tips and tricks for smooth animations, custom panels, dark mode glassmorphism, and responsive layouts.",
      content: "Creating a standout user experience requires attention to visual design, smooth micro-animations, and fast render cycles.",
      date: "July 10, 2026",
      readTime: "5 min read",
      author: "Ajay Kumar",
      tags: ["React", "UI Design", "CSS"]
    }
  ],
  Messages: [
    { id: 1, name: "Aman Gupta", email: "aman@tcs.com", subject: "Job Opportunity", message: "Hi Ajay, we loved your portfolio. Are you open to a full stack developer role in Gurugram?", createdDate: "Jul 23, 2026, 11:20 AM", isRead: false },
    { id: 2, name: "Sarah Connor", email: "sarah@skynet.net", subject: "System Security Audit", message: "Your particle canvas script runs extremely fast. Good work with CSS blurring.", createdDate: "Jul 22, 2026, 04:15 PM", isRead: true }
  ],
  Bookings: [
    { id: 1, name: "Rohit Sen", email: "rohit@infosys.com", company: "Infosys Ltd", date: "2026-07-28", time: "02:00 PM - 02:30 PM", notes: "Technical interview session" }
  ],
  VisitorStats: {
    totalViews: 384,
    todayViews: 28,
    activeChats: 2,
    downloads: 14,
    chartLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    chartData: [45, 60, 52, 75, 90, 82, 110]
  }
};

