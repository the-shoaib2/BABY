import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma"
import { createVerificationToken } from "@/lib/email-utils"
import { sendVerificationEmail } from "@/lib/email-utils"
import * as bcrypt from "bcryptjs"
import { z } from "zod"

import { UAParser } from 'ua-parser-js'



const registerSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string(),
  captchaSessionId: z.string().min(1, 'CAPTCHA session ID is required'),
  captchaText: z.string().min(1, 'CAPTCHA text is required'),
  storedCaptchaText: z.string().min(1, 'Stored CAPTCHA text is required')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

// Helper function to extract client info
function extractClientInfo(request: NextRequest) {
  const userAgent = request.headers.get('user-agent') || '';
  const ipAddress =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    request.headers.get('cf-connecting-ip') || // Cloudflare
    request.headers.get('x-client-ip') ||
    '';

  return { userAgent, ipAddress };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validatedData = registerSchema.parse(body);

    // Validate CAPTCHA directly
    const isValidCaptcha = validatedData.captchaText.toUpperCase() === validatedData.storedCaptchaText.toUpperCase();
    
    if (!isValidCaptcha) {
      return NextResponse.json(
        { message: "Invalid CAPTCHA" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Extract client info for session tracking
    const { userAgent, ipAddress } = extractClientInfo(request as NextRequest);
    const parser = new UAParser(userAgent);
    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();
    
    // Device type detection
    const deviceType = device.type || 
                      (userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                       userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop');
    
    // Device model detection
    let deviceModel = '';
    if (device.vendor && device.model) {
      deviceModel = `${device.vendor} ${device.model}`.trim();
    } else if (device.model) {
      deviceModel = device.model;
    } else if (os.name) {
      deviceModel = `${os.name} ${os.version || ''}`.trim();
    } else if (browser.name) {
      deviceModel = `${browser.name} ${browser.version || ''}`.trim();
    }

    // Create user without initial session (session will be created on first login)
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: "USER"
      }
    });

    // Create verification token
    const token = await createVerificationToken(validatedData.email);

    // Send verification email
    await sendVerificationEmail(validatedData.email, validatedData.name, token);

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Failed to register user" },
      { status: 500 }
    );
  }
}
