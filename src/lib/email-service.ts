import { createClient } from '@supabase/supabase-js'
import { SMTPService } from './smtp-service'
import { DirectEmailService } from './direct-email'

// Email service interface
export interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailResult {
  success: boolean
  message?: string
  error?: string
  sentCount?: number
}

// Email templates
export const EmailTemplates = {
  SYSTEM_ANNOUNCEMENT: (data: { title: string; message: string; adminName: string }): EmailTemplate => ({
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

  DEADLINE_REMINDER: (data: { deadline: string; description: string; adminName: string }): EmailTemplate => ({
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

  CUSTOM_EMAIL: (data: { subject: string; message: string; adminName: string }): EmailTemplate => ({
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
  })
}

// Email service using Supabase Edge Functions or Resend
export class EmailService {
  private static instance: EmailService

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService()
    }
    return EmailService.instance
  }

  // Send email using Supabase Edge Functions with fallback
  async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      // Convert single email to array for consistent handling
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to]

      // For local development with SMTP config, use direct implementation
      if (process.env.NODE_ENV === 'development' && 
          process.env.SMTP_HOST && 
          process.env.SMTP_USER && 
          process.env.SMTP_PASS) {
        
        console.log('📧 Using direct email service with SMTP configuration')
        // Try SMTP service first
        try {
          return await SMTPService.sendEmail(emailData)
        } catch (smtpError) {
          console.warn('SMTP service failed, trying direct email service:', smtpError)
          // Fallback to direct email service
          return await DirectEmailService.sendEmail(emailData)
        }
      }

      // Check if email service environment variables are set for Edge Functions
      const hasEmailConfig = process.env.EMAIL_SERVICE || 
                            process.env.RESEND_API_KEY || 
                            process.env.BREVO_API_KEY ||
                            (process.env.SMTP_HOST && process.env.SMTP_USER)
      
      if (!hasEmailConfig) {
        console.log('📧 Mock email service (development mode - no email config):', {
          to: recipients,
          subject: emailData.subject,
          htmlLength: emailData.html.length,
          textLength: emailData.text?.length || 0
        })
        
        return {
          success: true,
          message: `Email sent successfully to ${recipients.length} recipient(s) (development mode - mock service)`,
          sentCount: recipients.length
        }
      }

      // Call Supabase Edge Function for email sending
      const { error } = await supabase.functions.invoke('send-email', {
        body: {
          to: recipients,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || emailData.html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        }
      })

      if (error) {
        throw new Error(`Email service error: ${error.message}`)
      }

      return {
        success: true,
        message: `Email sent successfully to ${recipients.length} recipient(s)`,
        sentCount: recipients.length
      }
    } catch (error) {
      console.error('Email sending error:', error)
      
      // Provide helpful error message based on common issues
      let errorMessage = error instanceof Error ? error.message : 'Failed to send email'
      
      if (errorMessage.includes('Failed to send a request to the Edge Function') || 
          errorMessage.includes('CORS policy') ||
          errorMessage.includes('net::ERR_FAILED')) {
        errorMessage = `Email service not available. This is normal in development if Edge Functions are not deployed.

For development without email setup, system will use mock mode.
For production email sending:
1. Deploy Edge Functions: supabase functions deploy send-email
2. Configure email service environment variables
3. Check network connectivity to Supabase

Current mode: Development - Emails will be logged to console`
      }
      
      return {
        success: false,
        error: errorMessage
      }
    }
  }

  // Send email to all users
  async sendToAllUsers(
    subject: string, 
    message: string, 
    adminName: string,
    userType: 'all' | 'users' | 'admins' = 'all'
  ): Promise<EmailResult> {
    try {
      // Fetch users based on type
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
        return {
          success: false,
          error: 'No users found to send email to'
        }
      }

      const emailAddresses = users.map(user => user.email)
      const template = EmailTemplates.CUSTOM_EMAIL({ subject, message, adminName })

      return await this.sendEmail({
        to: emailAddresses,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    } catch (error) {
      console.error('Send to all users error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email to users'
      }
    }
  }

  // Send system announcement
  async sendSystemAnnouncement(
    title: string, 
    message: string, 
    adminName: string,
    userType: 'all' | 'users' | 'admins' = 'all'
  ): Promise<EmailResult> {
    try {
      // Fetch users based on type
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
        return {
          success: false,
          error: 'No users found to send announcement to'
        }
      }

      const emailAddresses = users.map(user => user.email)
      const template = EmailTemplates.SYSTEM_ANNOUNCEMENT({ title, message, adminName })

      return await this.sendEmail({
        to: emailAddresses,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    } catch (error) {
      console.error('System announcement error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send system announcement'
      }
    }
  }

  // Send deadline reminder
  async sendDeadlineReminder(
    deadline: string, 
    description: string, 
    adminName: string,
    userType: 'all' | 'users' | 'admins' = 'all'
  ): Promise<EmailResult> {
    try {
      // Fetch users based on type
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
        return {
          success: false,
          error: 'No users found to send reminder to'
        }
      }

      const emailAddresses = users.map(user => user.email)
      const template = EmailTemplates.DEADLINE_REMINDER({ deadline, description, adminName })

      return await this.sendEmail({
        to: emailAddresses,
        subject: template.subject,
        html: template.html,
        text: template.text
      })
    } catch (error) {
      console.error('Deadline reminder error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send deadline reminder'
      }
    }
  }
}

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const emailService = EmailService.getInstance()
