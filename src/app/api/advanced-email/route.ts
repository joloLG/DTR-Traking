import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Advanced email service interface
interface AdvancedEmailConfig {
  adminName: string
  userType: 'all' | 'users' | 'admins'
  bulkMode: boolean
  retryFailed: boolean
  emailDelay: number
}

interface EmailStats {
  totalRecipients: number
  sentCount: number
  failedCount: number
  progress: number
}

// Initialize SMTP transporter
async function initializeTransporter(): Promise<nodemailer.Transporter> {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP configuration is missing')
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
    rateLimit: 14,
    tls: {
      rejectUnauthorized: false
    }
  })

  await transporter.verify()
  console.log('✅ SMTP transporter initialized and verified')
  return transporter
}

// Email templates
const EmailTemplates = {
  SYSTEM_ANNOUNCEMENT: (data: { title: string; message: string; adminName: string }) => ({
    subject: `📢 ${data.title} - JLG DTR Tracker System`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #800000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .btn { background: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JLG DEV Solutions</h1>
            <p>DTR Tracker System</p>
          </div>
          <div class="content">
            <h2>${data.title}</h2>
            <p>${data.message}</p>
            <p>This message was sent by <strong>${data.adminName}</strong> (System Administrator)</p>
            <p>Please log in to your DTR account for more details.</p>
            <a href="https://your-domain.com/login" class="btn">Access DTR System</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 JLG-Dev Solutions. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${data.title}
      
      ${data.message}
      
      This message was sent by ${data.adminName} (System Administrator)
      
      Please log in to your DTR account for more details.
      Access DTR System: https://your-domain.com/login
      
      © 2026 JLG-Dev Solutions. All rights reserved.
      This is an automated message. Please do not reply to this email.
    `
  }),

  DEADLINE_REMINDER: (data: { deadline: string; description: string; adminName: string }) => ({
    subject: `⏰ Deadline Reminder - ${data.deadline}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Deadline Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #800000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .btn { background: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
          .deadline { background: #ff6b6b; color: white; padding: 15px; border-radius: 4px; margin: 15px 0; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JLG DEV Solutions</h1>
            <p>DTR Tracker System</p>
          </div>
          <div class="content">
            <h2>📅 Deadline Reminder</h2>
            <div class="deadline">
              <strong>Deadline:</strong> ${data.deadline}
            </div>
            <p>${data.description}</p>
            <p>Please ensure all your DTR records are updated before the deadline.</p>
            <p>This reminder was sent by <strong>${data.adminName}</strong> (System Administrator)</p>
            <a href="https://your-domain.com/login" class="btn">Update DTR Records</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 JLG-Dev Solutions. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      DEADLINE REMINDER
      
      Deadline: ${data.deadline}
      
      ${data.description}
      
      Please ensure all your DTR records are updated before the deadline.
      
      This reminder was sent by ${data.adminName} (System Administrator)
      
      Update DTR Records: https://your-domain.com/login
      
      © 2026 JLG-Dev Solutions. All rights reserved.
      This is an automated message. Please do not reply to this email.
    `
  }),

  CUSTOM_EMAIL: (data: { subject: string; message: string; adminName: string }) => ({
    subject: data.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #800000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .btn { background: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JLG DEV Solutions</h1>
            <p>DTR Tracker System</p>
          </div>
          <div class="content">
            <h2>${data.subject}</h2>
            <div style="white-space: pre-wrap;">${data.message}</div>
            <p>This message was sent by <strong>${data.adminName}</strong> (System Administrator)</p>
            <a href="https://your-domain.com/login" class="btn">Access DTR System</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 JLG-Dev Solutions. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${data.subject}
      
      ${data.message}
      
      This message was sent by ${data.adminName} (System Administrator)
      
      Access DTR System: https://your-domain.com/login
      
      © 2026 JLG-Dev Solutions. All rights reserved.
      This is an automated message. Please do not reply to this email.
    `
  }),

  NEWSLETTER: (data: { subject: string; content: string; adminName: string }) => ({
    subject: `📧 ${data.subject} - JLG DTR Newsletter`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${data.subject}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #800000; color: white; padding: 20px; text-align: center; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .btn { background: #800000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>JLG DEV Solutions</h1>
            <p>DTR Tracker Newsletter</p>
          </div>
          <div class="content">
            <h2>${data.subject}</h2>
            <div style="white-space: pre-wrap;">${data.content}</div>
            <p>This newsletter was sent by <strong>${data.adminName}</strong> (System Administrator)</p>
            <a href="https://your-domain.com/login" class="btn">Access DTR System</a>
          </div>
          <div class="footer">
            <p>&copy; 2026 JLG-Dev Solutions. All rights reserved.</p>
            <p>This is an automated message. Please do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      ${data.subject}
      
      ${data.content}
      
      This newsletter was sent by ${data.adminName} (System Administrator)
      
      Access DTR System: https://your-domain.com/login
      
      © 2026 JLG-Dev Solutions. All rights reserved.
      This is an automated message. Please do not reply to this email.
    `
  })
}

// Fetch users based on type
async function fetchUsers(userType: 'all' | 'users' | 'admins'): Promise<string[]> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  let query = supabase.from('users').select('email')
  
  if (userType === 'users') {
    query = query.eq('role', 'user')
  } else if (userType === 'admins') {
    query = query.eq('role', 'admin')
  }

  const { data: users, error } = await query

  if (error) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }

  if (!users || users.length === 0) {
    throw new Error('No users found')
  }

  return users.map(user => user.email)
}

// Send bulk emails with progress tracking
async function sendBulkEmails(
  recipients: string[],
  subject: string,
  html: string,
  text: string,
  config: AdvancedEmailConfig
): Promise<{ success: boolean; message: string; sentCount: number; failedCount: number }> {
  const transporter = await initializeTransporter()
  let sentCount = 0
  let failedCount = 0

  console.log(`🚀 Starting bulk email send to ${recipients.length} recipients`)

  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i]
    
    try {
      const mailOptions = {
        from: `${process.env.FROM_NAME || 'JLG-DEV DTR System'} <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: recipient,
        subject,
        html,
        text
      }

      await transporter.sendMail(mailOptions)
      sentCount++
      console.log(`✅ Email sent to ${recipient}`)
    } catch (error) {
      failedCount++
      console.error(`❌ Failed to send to ${recipient}:`, error)
    }

    // Add delay between emails to avoid rate limiting
    if (config.emailDelay > 0 && i < recipients.length - 1) {
      await new Promise(resolve => setTimeout(resolve, config.emailDelay))
    }
  }

  const success = failedCount === 0
  const message = success 
    ? `Successfully sent ${sentCount} emails`
    : `Sent ${sentCount} emails, ${failedCount} failed`

  return { success, message, sentCount, failedCount }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailType, subject, message, deadline, config } = body

    if (!config || !config.adminName) {
      return NextResponse.json(
        { error: 'Missing admin configuration' },
        { status: 400 }
      )
    }

    // Fetch users based on type
    const recipients = await fetchUsers(config.userType)

    let template
    switch (emailType) {
      case 'announcement':
        if (!subject || !message) {
          return NextResponse.json(
            { error: 'Please provide title and message for announcement' },
            { status: 400 }
          )
        }
        template = EmailTemplates.SYSTEM_ANNOUNCEMENT({ title: subject, message, adminName: config.adminName })
        break

      case 'deadline':
        if (!deadline || !message) {
          return NextResponse.json(
            { error: 'Please provide deadline and description for reminder' },
            { status: 400 }
          )
        }
        template = EmailTemplates.DEADLINE_REMINDER({ deadline, description: message, adminName: config.adminName })
        break

      case 'newsletter':
        if (!subject || !message) {
          return NextResponse.json(
            { error: 'Please provide subject and content for newsletter' },
            { status: 400 }
          )
        }
        template = EmailTemplates.NEWSLETTER({ subject, content: message, adminName: config.adminName })
        break

      case 'custom':
      default:
        if (!subject || !message) {
          return NextResponse.json(
            { error: 'Please provide subject and message' },
            { status: 400 }
          )
        }
        template = EmailTemplates.CUSTOM_EMAIL({ subject, message, adminName: config.adminName })
        break
    }

    // Send emails
    const result = await sendBulkEmails(recipients, template.subject, template.html, template.text, config)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      sentCount: result.sentCount,
      failedCount: result.failedCount
    })

  } catch (error) {
    console.error('Advanced email API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email' 
      },
      { status: 500 }
    )
  }
}
