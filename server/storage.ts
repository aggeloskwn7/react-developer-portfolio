import { 
  projects, type Project, type InsertProject,
  profiles, type Profile, type InsertProfile,
  visits, type Visit, type InsertVisit,
  messages, type Message, type InsertMessage,
  stats, type Stat, type InsertStat,
  users, type User, type InsertUser
} from "@shared/schema";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Calculate the uploads directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'dist', 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Profile methods
  getProfile(): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(profile: Partial<Profile>): Promise<Profile | undefined>;
  updateProfileImage(imageBuffer: Buffer, filename: string): Promise<string>;
  
  // Project methods
  getAllProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  getFeaturedProject(): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;
  
  // Visit analytics methods
  recordVisit(visit: InsertVisit): Promise<Visit>;
  getVisitStats(): Promise<Stat | undefined>;
  getVisitsByTimeRange(startDate: Date, endDate: Date): Promise<Visit[]>;
  getVisitsByLocation(): Promise<Record<string, number>>;
  getTopReferrers(limit?: number): Promise<{ source: string; count: number }[]>;
  
  // Contact methods
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private profile: Profile | undefined;
  private projects: Map<number, Project>;
  private visits: Visit[];
  private messages: Message[];
  private stats: Stat | undefined;
  
  private currentUserId: number;
  private currentProjectId: number;
  private currentVisitId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.projects = new Map();
    this.visits = [];
    this.messages = [];
    
    this.currentUserId = 1;
    this.currentProjectId = 1;
    this.currentVisitId = 1;
    this.currentMessageId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Add default profile
    this.profile = {
      id: 1,
      name: "Aggelos Kwnstantinou",
      age: 17,
      location: "Greece",
      bio: "I'm a 17-year-old developer passionate about creating innovative digital experiences. Despite my young age, I've already started building various projects, including web applications and an online casino platform.",
      profileImage: "/uploads/default-profile.jpg",
      resumeUrl: "/uploads/resume.pdf"
    };

    // Add default featured project
    const rageBetProject: Project = {
      id: this.currentProjectId++,
      title: "Rage Bet",
      description: "An online casino platform offering various games including slots, poker, blackjack, and live dealer games. The project features user authentication, virtual currency management, and real-time gaming experiences.",
      imageUrl: "https://images.unsplash.com/photo-1596865249308-2472dc5216e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=500&q=80",
      projectUrl: "https://ragebet.example.com",
      githubUrl: "https://github.com/aggelos/ragebet",
      featured: true,
      tags: ["React", "Node.js", "MongoDB", "Socket.IO", "Stripe"]
    };
    this.projects.set(rageBetProject.id, rageBetProject);

    // Add additional sample projects
    const weatherApp: Project = {
      id: this.currentProjectId++,
      title: "Weather App",
      description: "A responsive weather application that displays current weather conditions and forecasts.",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80",
      projectUrl: "https://weather.example.com",
      githubUrl: "https://github.com/aggelos/weather",
      featured: false,
      tags: ["JavaScript", "API", "CSS"]
    };
    this.projects.set(weatherApp.id, weatherApp);

    const taskManager: Project = {
      id: this.currentProjectId++,
      title: "Task Manager",
      description: "A task management application with features like task creation, categorization, and due dates.",
      imageUrl: "https://images.unsplash.com/photo-1607706189992-eae578626c86?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=200&q=80",
      projectUrl: "https://tasks.example.com",
      githubUrl: "https://github.com/aggelos/tasks",
      featured: false,
      tags: ["React", "Firebase", "Tailwind"]
    };
    this.projects.set(taskManager.id, taskManager);

    // Initialize stats
    this.stats = {
      id: 1,
      date: new Date(),
      totalVisits: 12486,
      uniqueVisitors: 4827,
      avgTimeOnPage: "2:37",
      conversionRate: "6.8%",
      visitorsByLocation: {
        Greece: 45,
        "United States": 25,
        Germany: 15,
        "United Kingdom": 10,
        Other: 5
      },
      visitorsByTime: {
        Jan: 750,
        Feb: 820, 
        Mar: 900,
        Apr: 1200,
        May: 1100,
        Jun: 1250,
        Jul: 1300,
        Aug: 1450,
        Sep: 1350,
        Oct: 1600,
        Nov: 1750,
        Dec: 1850
      },
      topReferrers: [
        { source: "Google", count: 1843, percentage: 7.2 },
        { source: "GitHub", count: 952, percentage: 8.5 },
        { source: "LinkedIn", count: 684, percentage: 5.5 },
        { source: "Twitter", count: 421, percentage: 4.5 }
      ]
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Profile methods
  async getProfile(): Promise<Profile | undefined> {
    return this.profile;
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const newProfile: Profile = { ...profile, id: 1 };
    this.profile = newProfile;
    return newProfile;
  }

  async updateProfile(profileUpdates: Partial<Profile>): Promise<Profile | undefined> {
    if (!this.profile) return undefined;
    
    this.profile = { ...this.profile, ...profileUpdates };
    return this.profile;
  }

  async updateProfileImage(imageBuffer: Buffer, filename: string): Promise<string> {
    const extension = path.extname(filename);
    const newFilename = `profile-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, newFilename);
    
    // Write the file to the uploads directory
    fs.writeFileSync(filePath, imageBuffer);
    
    // Update profile image path
    const imagePath = `/uploads/${newFilename}`;
    if (this.profile) {
      this.profile.profileImage = imagePath;
    }
    
    return imagePath;
  }

  // Project methods
  async getAllProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getFeaturedProject(): Promise<Project | undefined> {
    return Array.from(this.projects.values()).find(project => project.featured);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const newProject: Project = { ...project, id };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, projectUpdates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { ...project, ...projectUpdates };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Visit analytics methods
  async recordVisit(visit: InsertVisit): Promise<Visit> {
    const id = this.currentVisitId++;
    const newVisit: Visit = { ...visit, id, timestamp: new Date() };
    this.visits.push(newVisit);
    
    // Update stats
    if (this.stats) {
      this.stats.totalVisits++;
      
      // This is simplified; in a real app, we'd do proper unique visitor tracking
      // based on session/cookie/IP
      this.stats.uniqueVisitors = Math.floor(this.stats.totalVisits * 0.4);
    }
    
    return newVisit;
  }

  async getVisitStats(): Promise<Stat | undefined> {
    return this.stats;
  }

  async getVisitsByTimeRange(startDate: Date, endDate: Date): Promise<Visit[]> {
    return this.visits.filter(
      visit => visit.timestamp >= startDate && visit.timestamp <= endDate
    );
  }

  async getVisitsByLocation(): Promise<Record<string, number>> {
    return this.stats?.visitorsByLocation as Record<string, number> || {};
  }

  async getTopReferrers(limit: number = 10): Promise<{ source: string; count: number }[]> {
    if (!this.stats?.topReferrers) return [];
    
    return (this.stats.topReferrers as any[])
      .map(ref => ({ 
        source: ref.source, 
        count: ref.count 
      }))
      .slice(0, limit);
  }

  // Contact methods
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...messageData, 
      id, 
      timestamp: new Date() 
    };
    this.messages.push(message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return this.messages;
  }
}

export const storage = new MemStorage();
