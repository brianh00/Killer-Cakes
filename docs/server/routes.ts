import type { Express } from "express";
import { createServer, type Server } from "http";
import nodemailer from "nodemailer";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  date: z.string().refine((val) => !Number.isNaN(Date.parse(val)), {
    message: "Invalid date",
  }),
  flavor: z.string().min(1),
  message: z.string().min(10),
});

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
  });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res, next) => {
    try {
      const body = contactSchema.parse(req.body);

      const transporter = await createTransporter();
      const mailData = {
        from: `\"Killer Cakes Contact Form\" <${process.env.EMAIL_FROM || process.env.EMAIL_SMTP_USER}>`,
        to: process.env.EMAIL_TO || "brianh00@gmail.com",
        subject: `Killer Cakes request from ${body.name}`,
        text: `Name: ${body.name}\nEmail: ${body.email}\nDate: ${body.date}\nFlavor: ${body.flavor}\nMessage:\n${body.message}`,
        html: `<p><strong>Name:</strong> ${body.name}</p><p><strong>Email:</strong> ${body.email}</p><p><strong>Date:</strong> ${body.date}</p><p><strong>Flavor:</strong> ${body.flavor}</p><p><strong>Message:</strong></p><p>${body.message.replace(/\n/g, "<br />")}</p>`,
      };

      const info = await transporter.sendMail(mailData);

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
