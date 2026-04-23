import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import multer from "multer";
import fsSync from "fs";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  date: z.string().optional().refine((val) => !val || !Number.isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  desiredCake: z.string().min(1),
  otherCake: z.string().optional(),
  details: z.string().optional(),
}).refine(
  (data) => data.desiredCake !== "Other" || (data.otherCake && data.otherCake.length > 5),
  {
    path: ["otherCake"],
    message: "Please describe your custom cake.",
  },
);

const cakeSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.string().min(1),
  image: z.string().min(1),
});

const adminSettingsSchema = z.object({
  contactRecipientEmail: z.string().email(),
});

const cakesFileCandidates = [
  path.resolve(process.cwd(), "client", "src", "data", "cakes.json"),
  path.resolve(process.cwd(), "docs", "client", "src", "data", "cakes.json"),
];

const cakesFilePath =
  cakesFileCandidates.find((candidate) => fsSync.existsSync(candidate)) ?? cakesFileCandidates[0];

const cakeImagesDirCandidates = [
  path.resolve(process.cwd(), "attached_assets", "cakes"),
  path.resolve(process.cwd(), "docs", "attached_assets", "cakes"),
];

const cakeImagesDir =
  cakeImagesDirCandidates.find((candidate) => fsSync.existsSync(candidate)) ??
  cakeImagesDirCandidates[0];

const adminSettingsFileCandidates = [
  path.resolve(process.cwd(), "server", "data", "admin-settings.json"),
  path.resolve(process.cwd(), "docs", "server", "data", "admin-settings.json"),
];

const adminSettingsFilePath =
  adminSettingsFileCandidates.find((candidate) => fsSync.existsSync(candidate)) ??
  adminSettingsFileCandidates[0];

const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
});

async function readCakes() {
  const raw = await fs.readFile(cakesFilePath, "utf-8");
  const parsed = JSON.parse(raw);
  return z.array(cakeSchema).parse(parsed);
}

async function writeCakes(cakes: z.infer<typeof cakeSchema>[]) {
  await fs.writeFile(cakesFilePath, `${JSON.stringify(cakes, null, 2)}\n`, "utf-8");
}

async function readAdminSettings() {
  const fallback = {
    contactRecipientEmail: "brianh00@gmail.com",
  };

  try {
    const raw = await fs.readFile(adminSettingsFilePath, "utf-8");
    const parsed = JSON.parse(raw);
    return adminSettingsSchema.parse(parsed);
  } catch {
    return fallback;
  }
}

async function writeAdminSettings(settings: z.infer<typeof adminSettingsSchema>) {
  await fs.mkdir(path.dirname(adminSettingsFilePath), { recursive: true });
  await fs.writeFile(adminSettingsFilePath, `${JSON.stringify(settings, null, 2)}\n`, "utf-8");
}

function isAuthorizedAdminPassword(password: string | undefined) {
  const configured = process.env.ADMIN_PASSWORD || "killercakes-admin";
  return Boolean(password) && password === configured;
}

function isValidIndex(value: string) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : -1;
}

async function createTransporter() {
  let host = process.env.EMAIL_SMTP_HOST;
  let port = Number(process.env.EMAIL_SMTP_PORT || "587");
  let user = process.env.EMAIL_SMTP_USER;
  let pass = process.env.EMAIL_SMTP_PASS;

  if (!host || !user || !pass) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing email configuration. Set EMAIL_SMTP_HOST, EMAIL_SMTP_USER, EMAIL_SMTP_PASS",
      );
    }

    // Development fallback: use Ethereal test account so form works without real SMTP
    const testAccount = await nodemailer.createTestAccount();
    host = testAccount.smtp.host;
    port = testAccount.smtp.port;
    user = testAccount.user;
    pass = testAccount.pass;

    console.log("[nodemailer] using Ethereal test SMTP account", {
      host,
      port,
      user,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: host ? { servername: host } : undefined,
  });
}

async function sendContactEmail(mailData: nodemailer.SendMailOptions) {
  if (process.env.RESEND_API_KEY) {
    const resendFrom = process.env.RESEND_FROM || "Killer Cakes <onboarding@resend.dev>";
    const rawTo = Array.isArray(mailData.to) ? mailData.to.join(",") : String(mailData.to || "");
    const toList = rawTo
      .split(",")
      .map((email) => email.trim())
      .filter(Boolean);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFrom,
        to: toList.length > 0 ? toList : ["onboarding@resend.dev"],
        subject: mailData.subject,
        text: mailData.text,
        html: mailData.html,
        reply_to: mailData.replyTo,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Resend send failed (${resendResponse.status}): ${errorText}`);
    }

    const result = await resendResponse.json();
    return {
      messageId: result?.id || "resend-primary",
    };
  }

  const transporter = await createTransporter();

  try {
    return await transporter.sendMail(mailData);
  } catch (error: any) {
    // Render environments can occasionally time out to gmail on 587.
    // Retry once on 465 if smtp.gmail.com is configured.
    const host = process.env.EMAIL_SMTP_HOST || "";
    const port = Number(process.env.EMAIL_SMTP_PORT || "587");
    const user = process.env.EMAIL_SMTP_USER;
    const pass = process.env.EMAIL_SMTP_PASS;

    const isTimeout =
      error?.code === "ETIMEDOUT" ||
      error?.code === "ESOCKET" ||
      String(error?.message || "").toLowerCase().includes("timeout");

    if (isTimeout && host.toLowerCase() === "smtp.gmail.com" && port === 587 && user && pass) {
      const fallbackTransporter = nodemailer.createTransport({
        host,
        port: 465,
        secure: true,
        auth: { user, pass },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 15000,
        tls: { servername: host },
      });

      return fallbackTransporter.sendMail(mailData);
    }

    throw error;
  }
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get("/api/cakes", async (_req, res, next) => {
    try {
      const cakes = await readCakes();
      res.status(200).json(cakes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/login", (req, res) => {
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!isAuthorizedAdminPassword(password)) {
      return res.status(401).json({ message: "Invalid password" });
    }

    return res.status(200).json({ status: "ok" });
  });

  app.post("/api/admin/upload-image", upload.single("image"), async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image file is required" });
      }

      const extension = path.extname(req.file.originalname).toLowerCase();
      if (!allowedImageExtensions.has(extension)) {
        return res.status(400).json({ message: "Unsupported image type" });
      }

      const fileName = `cake_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${extension}`;
      const destination = path.join(cakeImagesDir, fileName);

      await fs.mkdir(cakeImagesDir, { recursive: true });
      await fs.writeFile(destination, req.file.buffer);

      return res.status(201).json({ filename: fileName });
    } catch (error) {
      next(error);
    }
  });

  app.get("/api/admin/settings", async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const settings = await readAdminSettings();
      return res.status(200).json(settings);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/settings", async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = adminSettingsSchema.parse(req.body);
      await writeAdminSettings(payload);
      return res.status(200).json(payload);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/admin/cakes", async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = z
        .object({
          title: z.string().min(1),
          description: z.string().min(1),
          price: z.string().min(1),
          image: z.string().min(1),
          index: z.number().int().min(0).optional(),
        })
        .parse(req.body);

      const { index, ...newCake } = payload;
      const cakes = await readCakes();
      if (typeof index === "number" && index <= cakes.length) {
        cakes.splice(index, 0, newCake);
      } else {
        cakes.push(newCake);
      }
      await writeCakes(cakes);
      return res.status(201).json(cakes);
    } catch (error) {
      next(error);
    }
  });

  app.put("/api/admin/cakes/:index", async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const index = isValidIndex(req.params.index);
      const updatedCake = cakeSchema.parse(req.body);
      const cakes = await readCakes();

      if (index < 0 || index >= cakes.length) {
        return res.status(404).json({ message: "Cake not found" });
      }

      cakes[index] = updatedCake;
      await writeCakes(cakes);
      return res.status(200).json(cakes);
    } catch (error) {
      next(error);
    }
  });

  app.delete("/api/admin/cakes/:index", async (req, res, next) => {
    try {
      const password = req.header("x-admin-password");
      if (!isAuthorizedAdminPassword(password)) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const index = isValidIndex(req.params.index);
      const cakes = await readCakes();

      if (index < 0 || index >= cakes.length) {
        return res.status(404).json({ message: "Cake not found" });
      }

      cakes.splice(index, 1);
      await writeCakes(cakes);
      return res.status(200).json(cakes);
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/contact", async (req, res, next) => {
    try {
      const body = contactSchema.parse(req.body);
      const selectedCake = body.desiredCake === "Other" ? body.otherCake : body.desiredCake;
      const settings = await readAdminSettings();
      const submittedPhone = body.phone || "Not provided";
      const submittedDate = body.date || "Not provided";
      const submittedDetails = body.details || "Not provided";
      const mailData = {
        from: `\"Killer Cakes Contact Form\" <${process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER}>`,
        to: settings.contactRecipientEmail,
        subject: `Killer Cakes request from ${body.name}`,
        replyTo: body.email,
        text: `Name: ${body.name}\nEmail: ${body.email}\nPhone: ${submittedPhone}\nDate: ${submittedDate}\nDesired Cake: ${selectedCake}\nAdditional Details:\n${submittedDetails}`,
        html: `<p><strong>Name:</strong> ${body.name}</p><p><strong>Email:</strong> ${body.email}</p><p><strong>Phone:</strong> ${submittedPhone}</p><p><strong>Date:</strong> ${submittedDate}</p><p><strong>Desired Cake:</strong> ${selectedCake}</p><p><strong>Additional Details:</strong></p><p>${submittedDetails.replace(/\n/g, "<br />")}</p>`,
      };

      const info = await sendContactEmail(mailData);

      if (process.env.NODE_ENV !== "production") {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log("[nodemailer] Preview URL:", previewUrl);
        }
      }

      res.status(200).json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  });

  return httpServer;
}
