import { suggestedSkillCategories, skillsTitle, skillsSubtitle } from './skills.js';
import { trainingItems } from './training.js';

/**
 * Content Layer
 *
 * Holds all portfolio content matching Mongoose schemas.
 * Structured so that a real REST/GraphQL API can seamlessly replace this file.
 */

// Intro Schema Reference
// const introSchema = new mongoose.Schema({
//   welcomeText: { type: String, required: true },
//   firstName: { type: String, required: true },
//   lastName: { type: String, required: true },
//   caption: { type: String, required: true },
//   description: { type: String, required: true },
// });
export const introData = {
  welcomeText: "Hello, I am",
  firstName: "Jobayer",
  lastName: "Mannan",
  caption: "Full Stack Developer",
  description:
    "A passionate Frontend focused MERN Stack Developer based in Dhaka, Bangladesh. With a deep interest in building scalable web applications and solving complex problems, I strive to create seamless user experiences and efficient systems.",
  heroHeadline: "I build scalable web",
  heroAccentWord: "experiences.",
  heroSubtextWhite: "MERN Stack Developer. Based in Dhaka, Bangladesh.",
  heroSubtextGray: "Frontend focused. CS student at Green University of Bangladesh.",
};

// Profile Avatar & Images
export const PROFILE_IMAGE = "/projects/avater.jpg";

// Social Links & Navigation
export const socialLinks = {
  github: "https://github.com/jobayermannan",
  linkedin: "https://www.linkedin.com/in/jobayermannan",
  facebook: "",
  medium: "",
  resume: "/resume.pdf",
  email: "jobayermannan777@gmail.com",
  phone: "+880 1626-519873",
  location: "Mirpur, Dhaka, Bangladesh",
};

export const aboutData = {
  lottieURL: "https://assets9.lottiefiles.com/packages/lf20_sSF6EG.json",
  eyebrow: "ABOUT ME",
  headlinePrefix: "I'm a frontend-focused developer who builds",
  headlineAccent: "seamless experiences.",
  description1:
    "I am a MERN stack developer with a strong focus on frontend development. My expertise spans across full-stack development, with a focus on both front-end and back-end technologies including HTML5, CSS3, JavaScript, React.js, Next.js, Node.js, and MongoDB.",
  description2:
    "Outside of writing clean modular code, I enjoy breaking down complex programming paradigms into intuitive real-world metaphors, continuous learning, and exploring architectural patterns.",
  storyLead: "This is my journey — translating ideas into high-performance web applications with precision.",
  skillsTitle, skillsSubtitle,
  skillCategories: suggestedSkillCategories,
};

// Experience Schema Reference
// const experienceSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   period: { type: String, required: true },
//   company: { type: String, required: true },
//   description: { type: String, required: true },
// });
export const experienceData = [
  {
    title: "Web Developer",
    period: "Oct 2024 – Jul 2025",
    company: "Ecommander LTD",
    description:
      "Managed WordPress site updates and bug fixes, coordinated with Laravel theme developers to resolve product issues, and participated in developing demo projects using MERN Stack.",
  },
];

// Education Schema Reference
export const educationData = [
  {
    id: "edu-1",
    degree: "SSC",
    institution: "Monipur High School and College",
    year: "2017",
    status: "Completed",
    description: "Secondary School Certificate with strong foundation in science and mathematics.",
  },
  {
    id: "edu-2",
    degree: "HSC",
    institution: "Monipur High School and College",
    year: "2020",
    status: "Completed",
    description: "Higher Secondary Certificate focusing on analytical sciences and computer basics.",
  },
  {
    id: "edu-3",
    degree: "Bachelor",
    institution: "Green University of Bangladesh",
    year: "2022 to present",
    status: "In Progress",
    description: "B.Sc. in Computer Science & Engineering. Deep dive into algorithms, web engineering & databases.",
  },
];

// Projects Schema Reference
// const projectsSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   shortDescription: { type: String, required: true },
//   detailedDescription: { type: String, required: true },
//   image: { type: String, required: true },
//   link: { type: String, required: true },
//   technologies: { type: Array, required: true },
//   githubLink: { type: String, required: true },
// });
export const projectsData = [
  {
    id: "fastrev",
    title: "FastRev — Clinic Management & AI No-Show Prediction",
    shortDescription: "A clinic operations platform with AI-powered no-show prediction and smart overbooking standby recommendations.",
    detailedDescription:
      "FastRev is an enterprise healthcare operations system managing patients, doctors, appointments, scheduling, and billing with zero double-booking concurrency locks, asynchronous ML no-show risk prediction (FastAPI + XGBoost), background notification queues (BullMQ + Redis), and a Next.js App Router dashboard with smart overbooking standby recommendations.",
    image: "https://res.cloudinary.com/jobayer-cloud1/image/upload/v1793965655/portfolio_assets/oscucbwzarn2od5gnsz8.png",
    link: "https://fastrev.vercel.app",
    liveUrl: "https://fastrev.vercel.app",
    githubLink: "https://github.com/jobayermannan/FastRev",
    category: "Full Stack / AI & Machine Learning",
    windowUrl: "fastrev.vercel.app/appointments",
    technologies: [
      "Next.js 15",
      "TypeScript",
      "Node.js",
      "FastAPI",
      "Python",
      "XGBoost",
      "Prisma",
      "MySQL",
      "Redis",
      "BullMQ",
      "Tailwind CSS",
    ],
  },
  {
    id: "food-intelligence",
    title: "Food Intelligence Platform",
    shortDescription: "A production-oriented food inventory and operations platform with auditable stock movements.",
    detailedDescription:
      "Food Intelligence Platform is a production-oriented full-stack operations system built for restaurants, retailers, and food distributors. It manages businesses, locations, team roles, product catalogs, batch-based inventory, stock transfers, sales, returns, waste, expiry monitoring, and operational analytics.",
    image: "https://res.cloudinary.com/jobayer-cloud1/image/upload/v1792168068/portfolio_assets/vxvawjw9vdlf9gp6iw1y.png",
    link: "https://food-intelligence-platform-web.vercel.app/",
    liveUrl: "https://food-intelligence-platform-web.vercel.app/",
    githubLink: "https://github.com/jobayermannan/food-intelligence-platform",
    category: "Full Stack / SaaS / Business Operations",
    windowUrl: "food-intelligence-platform-web.vercel.app",
    technologies: [
      "Next.js 16",
      "React 19",
      "NestJS 11",
      "PostgreSQL",
      "Neon",
      "Drizzle",
      "Docker Compose",
    ],
  },
  {
    id: "depthline",
    title: "Depthline — Microplastic Exposure Intelligence",
    shortDescription: "AI-powered microplastic exposure intelligence platform featuring semantic vector research search and dual RandomForest ML prediction models.",
    detailedDescription:
      "Depthline is an environmental exposure intelligence platform with two core capabilities: AI semantic search across peer-reviewed research using FastEmbed ONNX embeddings and pgvector cosine similarity, and dual RandomForest regression & classification models predicting microplastic concentration and risk tiers from product category, geographic coordinates, and plastic type.",
    image: "https://res.cloudinary.com/jobayer-cloud1/image/upload/v1793966355/portfolio_assets/on3olbxvh4jyqh8c9xzz.png",
    link: "https://microplastic-exposure-intelligence-swart.vercel.app",
    liveUrl: "https://microplastic-exposure-intelligence-swart.vercel.app",
    githubLink: "https://github.com/jobayermannan/Microplastic-Exposure-Intelligence-Platform",
    category: "Full Stack / AI & Machine Learning",
    windowUrl: "microplastic-exposure-intelligence-swart.vercel.app",
    technologies: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "scikit-learn",
      "PostgreSQL",
      "pgvector",
      "Tailwind CSS",
      "Docker",
    ],
  },
];

// Courses Schema Reference
// const coursesSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: { type: String, required: true },
//   image: { type: String, required: true },
//   link: { type: String, required: true },
// });
export const coursesData = trainingItems;

// Blogs
export const blogsData = [
  {
    id: "blog-1",
    year: "2022",
    title: "Redux Analogy",
    slug: "redux-analogy",
    date: "Oct 3, 2022",
    excerpt: "The Redux store is a centralized place where the state of your application is stored...",
    content:
      "The library (redux store): Real Meaning: The Redux store is a centralized place where the state of your application is stored. Think of it like a public library. If anyone in the town needs a book (state), they come to this one central place to get it. When you need to read information, you look into the library catalog (selectors), and when you need to add or update records, you hand the librarian a formal request ticket (dispatching an action). The librarian follows strict protocols (reducers) so nothing gets misplaced or corrupted.",
  },
  {
    id: "blog-2",
    year: "2023",
    title: "Understanding JavaScript Closures: A Wallet Metaphor",
    slug: "understanding-javascript-closures-a-wallet-metaphor",
    date: "Jan 27, 2023",
    excerpt: "Imagine you have a wallet with some money inside. The wallet represents a function in JavaScript...",
    content:
      "Imagine you have a wallet with some money inside. The wallet represents a function in JavaScript, and the money inside represents private variables. Even when you leave your house (the outer function finishes executing and pops off the call stack), you still carry that wallet in your pocket. Whenever you need to buy something or check your cash, your inner hands can access the wallet's contents anywhere you go. That persistent pocket environment that lingers around is exactly what a closure is in JavaScript.",
  },
  {
    id: "blog-3",
    year: "2024",
    title: "Understanding Javascript Debouncing through everyday photography!",
    slug: "understanding-javascript-debouncing-through-everyday-photography",
    date: "Jul 13, 2024",
    excerpt:
      "Imagine you have a friend who's a photography enthusiast. Every time they see something interesting, they quickly click the shutter button...",
    content:
      "Imagine you have a friend who's a photography enthusiast. Every time they see something interesting, they quickly click the shutter button. If they click too many times in quick succession, they end up with lots of nearly identical photos and their camera's memory fills up fast. Instead, a smart photographer waits for the subject to settle into the perfect pose before pressing the shutter once. Debouncing in JavaScript functions the exact same way: instead of firing an expensive API search on every single keystroke, we wait until the user pauses typing for 300ms before taking the final shot.",
  },
  {
    id: "blog-4",
    year: "2024",
    title: "Understanding Callback Functions, Asynchronous Programming, and Helpers in JavaScript",
    slug: "understanding-callback-functions-asynchronous-programming-and-helpers-in-javascript",
    date: "Jul 10, 2024",
    excerpt:
      "Imagine you are in a busy kitchen preparing a big meal. You are busy chopping vegetables when you realize you need some spices from the pantry...",
    content:
      "Imagine you are in a busy kitchen preparing a big meal. You are busy chopping vegetables when you realize you need some spices from the pantry. Instead of stopping your chopping, you ask a kitchen assistant to fetch the spices for you. While the assistant goes to get the spices, you continue chopping vegetables without blocking the main prep work. When the assistant returns, they call your attention ('Here are the spices!'). In JavaScript, that assistant is an asynchronous worker, and your instruction on what to do when they return is your callback function.",
  },
  {
    id: "blog-5",
    year: "2024",
    title: "Understanding Next.js: CSR vs. SSR through the Lens of TV Shows",
    slug: "understanding-nextjs-csr-vs-ssr-through-the-lens-of-tv-shows",
    date: "Jul 14, 2024",
    excerpt:
      "Think about watching your favorite TV shows. The way we experience them can help us understand Client-Side Rendering (CSR) and Server-Side Rendering (SSR) in Next.js....",
    content:
      "Think about watching your favorite TV shows. The way we experience them can help us understand Client-Side Rendering (CSR) and Server-Side Rendering (SSR) in Next.js. Imagine receiving a box of film negatives and a projector kit in the mail, and you have to assemble the reel yourself before the show starts playing. That's traditional Client-Side Rendering (CSR) — your browser receives a barebones bundle and has to execute JavaScript to paint the UI. On the other hand, Server-Side Rendering (SSR) is like turning on a live cable broadcast: the studio already rendered every frame, so the moment you tune in, the fully formed picture appears immediately on screen.",
  },
];

// Contact Schema Reference
// const contactSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   gender: { type: String, required: true },
//   email: { type: String, required: true },
//   mobile: { type: String, required: true },
//   age: { type: String, required: true },
//   address: { type: String, required: true },
// });
export const contactData = {
  name: "Jobayer Mannan",
  gender: "Male",
  email: "jobayermannan777@gmail.com",
  mobile: "+88 01626519873",
  age: "25",
  address: "Mirpur, Dhaka, Bangladesh",
};

// Message Schema Reference (for payloads)
// const messageSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   email: { type: String, required: true },
//   message: { type: String, required: true },
//   createdAt: { type: Date, default: Date.now },
// });

// User Schema Reference
// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });
