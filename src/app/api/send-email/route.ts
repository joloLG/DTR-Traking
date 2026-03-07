import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

interface EmailRequest {
  to: string | string[]
  subject: string
  html: string
  text?: string
  smtp?: {
    host: string
    port: number
    user: string
    pass: string
    from: string
    fromName: string
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json()
    const { to, subject, html, text, smtp } = body

    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    console.log('📧 API Route: Processing email request:', {
      to,
      subject,
      htmlLength: html.length,
      hasSMTP: !!smtp
    })

    // For development, we'll create a simple email sending solution
    // In production, you'd use nodemailer or a proper email service
    
    if (smtp && smtp.host && smtp.user && smtp.pass) {
      // Create transporter with SMTP configuration
      const transporter = nodemailer.createTransport({
        host: smtp.host,
        port: smtp.port,
        secure: false, // true for 465, false for other ports
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
      })

      console.log('📧 Creating email transporter with SMTP:', {
        host: smtp.host,
        port: smtp.port,
        user: smtp.user
      })

      // Send mail with defined transport object
      const mailOptions = {
        from: `${smtp.fromName} <${smtp.from}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: html,
        text: text || html.replace(/<[^>]*>/g, ''),
      }

      console.log('📨 Sending email with options:', {
        from: mailOptions.from,
        to: mailOptions.to,
        subject: mailOptions.subject
      })

      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully:', info.messageId)
      
      return NextResponse.json({
        success: true,
        message: `Email sent successfully to ${Array.isArray(to) ? to.length : 1} recipient(s) via Gmail SMTP`,
        sentCount: Array.isArray(to) ? to.length : 1,
        messageId: info.messageId
      })
    }

    return NextResponse.json(
      { error: 'SMTP configuration not provided' },
      { status: 400 }
    )

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
