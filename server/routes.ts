import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { insertMessageSchema, insertProfileSchema, insertVisitSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

// Setup multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes - all prefixed with /api
  
  // Get profile
  app.get("/api/profile", async (req: Request, res: Response) => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  
  // Update profile
  app.patch("/api/profile", async (req: Request, res: Response) => {
    try {
      const result = insertProfileSchema.partial().safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const updatedProfile = await storage.updateProfile(result.data);
      if (!updatedProfile) {
        return res.status(404).json({ message: "Profile not found" });
      }
      
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  
  // Upload profile image
  app.post("/api/profile/image", upload.single("image"), async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const imageBuffer = req.file.buffer;
      const filename = req.file.originalname;
      
      const imagePath = await storage.updateProfileImage(imageBuffer, filename);
      res.json({ imagePath });
    } catch (error) {
      console.error("Error uploading profile image:", error);
      res.status(500).json({ message: "Failed to upload profile image" });
    }
  });
  
  // Get all projects
  app.get("/api/projects", async (req: Request, res: Response) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  
  // Get featured project
  app.get("/api/projects/featured", async (req: Request, res: Response) => {
    try {
      const project = await storage.getFeaturedProject();
      if (!project) {
        return res.status(404).json({ message: "No featured project found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching featured project:", error);
      res.status(500).json({ message: "Failed to fetch featured project" });
    }
  });
  
  // Record visit
  app.post("/api/analytics/visit", async (req: Request, res: Response) => {
    try {
      const result = insertVisitSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      const visit = await storage.recordVisit(result.data);
      res.status(201).json(visit);
    } catch (error) {
      console.error("Error recording visit:", error);
      res.status(500).json({ message: "Failed to record visit" });
    }
  });
  
  // Get visit stats
  app.get("/api/analytics/stats", async (req: Request, res: Response) => {
    try {
      const stats = await storage.getVisitStats();
      if (!stats) {
        return res.status(404).json({ message: "No stats found" });
      }
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });
  
  // Get visits by location
  app.get("/api/analytics/locations", async (req: Request, res: Response) => {
    try {
      const locations = await storage.getVisitsByLocation();
      res.json(locations);
    } catch (error) {
      console.error("Error fetching locations:", error);
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });
  
  // Get top referrers
  app.get("/api/analytics/referrers", async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const referrers = await storage.getTopReferrers(limit);
      res.json(referrers);
    } catch (error) {
      console.error("Error fetching referrers:", error);
      res.status(500).json({ message: "Failed to fetch referrers" });
    }
  });
  
  // Submit contact form
  app.post("/api/contact", async (req: Request, res: Response) => {
    try {
      const result = insertMessageSchema.safeParse(req.body);
      
      if (!result.success) {
        const errorMessage = fromZodError(result.error).message;
        return res.status(400).json({ message: errorMessage });
      }
      
      // Save the message to the database
      const message = await storage.createMessage(result.data);
      
      // Import the email service here to avoid circular dependencies
      const { sendContactEmail } = await import('./emailService');
      
      // Send an email notification
      const emailSent = await sendContactEmail(message);
      
      res.status(201).json({ 
        success: true, 
        message: emailSent 
          ? "Message sent successfully. You'll receive a reply soon!" 
          : "Message saved successfully, but email notification failed.",
        id: message.id,
        emailSent
      });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  
  return httpServer;
}
