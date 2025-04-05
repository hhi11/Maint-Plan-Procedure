import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateJobPlan } from "./lib/openai";
import { insertJobPlanSchema } from "@shared/schema";
import nodemailer from "nodemailer";
import { stripe, SUBSCRIPTION_PRICE_ID } from "./lib/stripe";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || "pivot2ai@gmail.com",
    pass: "jemda8-morgen"
  }
});

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Auth middleware
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const user = await storage.getUser(decoded.id);
    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      if (!req.is('application/json')) {
        return res.status(406).json({ message: "Only JSON requests are accepted" });
      }
      
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, password and name are required" });
      }
      
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await storage.createUser({ email, password: hashedPassword, name });
      const token = jwt.sign({ id: user.id }, JWT_SECRET);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ message: "User not found" });
        return;
      }
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        res.status(400).json({ message: "Invalid password" });
        return;
      }
      const token = jwt.sign({ id: user.id }, JWT_SECRET);
      res.json({ token });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });
  // Generate job plan from query
  app.post("/api/job-plans/generate", authenticate, async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    if (!req.is('application/json')) {
      return res.status(406).json({ 
        error: "Content-Type must be application/json",
        received: req.headers['content-type'],
        message: "Please ensure you're sending the request with the correct Content-Type header"
      });
    }
    try {
      const userId = (req as any).user.id;
      const user = await storage.getUser(userId);

      if (!user) {
        res.status(401).json({ message: "User not found" });
        return;
      }

      const { query } = z.object({ query: z.string().min(1) }).parse(req.body);
      const aiResponse = await generateJobPlan(query);

      if (user.isAdmin !== "true" && user.email !== "hhill@outlook.com") {
        if (user.generationCount >= 3) {
          res.status(403).json({ 
            message: "Free plan limit reached. Please upgrade to continue generating job plans.",
            status: "upgrade_required"
          });
          return;
        }
        await storage.incrementGenerationCount(userId);
      }

      res.json(aiResponse);
    } catch (error: any) {
      console.error("Job Plan Generation Error:", error);
      res.status(400).json({ 
        message: error instanceof z.ZodError 
          ? "Please provide a valid maintenance task description" 
          : error.message 
      });
    }
  });

  // Create new job plan
  app.post("/api/job-plans", authenticate, async (req, res) => {
    try {
      const plan = insertJobPlanSchema.parse(req.body);
      const savedPlan = await storage.createJobPlan(plan);
      res.json(savedPlan);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get all job plans
  app.get("/api/job-plans", authenticate, async (_req, res) => {
    try {
      const plans = await storage.getAllJobPlans();
      res.json(plans);
    } catch (error: any) {
      console.error("Job Plan Retrieval Error:", error);
      res.status(500).json({ message: "Failed to retrieve job plans" });
    }
  });

  // Get job plan by ID
  app.get("/api/job-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getJobPlan(id);
      if (!plan) {
        res.status(404).json({ message: "Job plan not found" });
        return;
      }
      res.json(plan);
    } catch (error: any) {
      console.error("Job Plan Retrieval Error:", error);
      res.status(500).json({ message: "Failed to retrieve job plan" });
    }
  });

  // Update job plan
  app.patch("/api/job-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = insertJobPlanSchema.partial().parse(req.body);
      const updated = await storage.updateJobPlan(id, updates);
      res.json(updated);
    } catch (error: any) {
      console.error("Job Plan Update Error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Delete job plan
  app.delete("/api/job-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteJobPlan(id);
      res.status(204).send();
    } catch (error: any) {
      console.error("Job Plan Deletion Error:", error);
      res.status(500).json({ message: "Failed to delete job plan" });
    }
  });

  // Contact endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, message } = req.body;
      await transporter.sendMail({
        from: email,
        to: "pivot2ai@gmail.com",
        subject: `Contact Form: Message from ${name}`,
        text: `From: ${name} (${email})\n\nMessage:\n${message}`,
        html: `<p><strong>From:</strong> ${name} (${email})</p><p><strong>Message:</strong><br/>${message}</p>`
      });

      res.json({ message: "Message received" });
    } catch (error: any) {
      console.error("Contact Form Error:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Payment routes
  app.options("/api/payments/subscribe", (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.status(200).end();
  });

  app.post("/api/payments/subscribe", async (req, res) => {
    try {
      // Set CORS headers first
      res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Content-Type', 'application/json');

      // Global error handler
      const sendError = (status: number, message: string) => {
        return res.status(status).json({ 
          error: true,
          message: message 
        });
      };

      // Validate stripe configuration first
      if (!stripe || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
        return sendError(500, 'Payment system not properly configured');
      }

      // Get the full URL from request
      const host = req.headers['x-forwarded-host'] || req.headers.host || req.get('host');
      const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
      const domain = `${protocol}://${host}`;

      console.log('Creating Stripe session with domain:', domain);
      console.log('Headers:', req.headers);

      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: SUBSCRIPTION_PRICE_ID, quantity: 1 }],
        success_url: `${domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${domain}/payment/cancel`,
        allow_promotion_codes: true,
        billing_address_collection: 'required',
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Payment Error:', error);
      res.status(500).json({
        error: true,
        message: error.message || 'Payment session creation failed'
      });
    }
  });



  app.post("/api/payments/webhook", async (req, res) => {
    const sig = req.headers['stripe-signature'];
    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      switch (event.type) {
        case 'checkout.session.completed':
          // Handle successful payment
          break;
        case 'invoice.paid':
          // Handle subscription renewal
          break;
      }

      res.json({ received: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}