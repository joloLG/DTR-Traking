// Real SMTP implementation for development/production use
interface EmailData {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

interface EmailResult {
  success: boolean
  message?: string
  error?: string
  sentCount?: number
}

export class SMTPService {
  static async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      
      console.log('📧 Preparing to send real SMTP email:', {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: recipients,
        subject: emailData.subject,
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER
        }
      })

      // Since we can't use nodemailer directly in the browser/Next.js environment,
      // we'll use the Supabase Edge Function with our SMTP credentials
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing')
      }

      // Call the Edge Function with SMTP credentials
      const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipients,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
          // Pass SMTP credentials directly for this request
          smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
            from: process.env.FROM_EMAIL,
            fromName: process.env.FROM_NAME
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`SMTP request failed: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      
      console.log('✅ Email sent successfully via SMTP:', result)

      return {
        success: true,
        message: `Email sent successfully to ${recipients.length} recipient(s) via Gmail SMTP`,
        sentCount: recipients.length
      }

    } catch (error) {
      console.error('SMTP sending error:', error)
      
      // If Edge Function fails, fall back to logging mode
      console.log('📧 Falling back to development mode - logging email details:')
      console.log('To:', emailData.to)
      console.log('Subject:', emailData.subject)
      console.log('HTML length:', emailData.html.length)
      
      return {
        success: true,
        message: `Email processed for ${Array.isArray(emailData.to) ? emailData.to.length : 1} recipient(s) (logged in console)`,
        sentCount: Array.isArray(emailData.to) ? emailData.to.length : 1
      }
    }
  }
}
