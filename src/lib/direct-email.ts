// Direct email sending using EmailJS or similar service for development
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

export class DirectEmailService {
  static async sendEmail(emailData: EmailData): Promise<EmailResult> {
    try {
      const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to]
      
      console.log('📧 Direct email service - attempting to send:', {
        from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
        to: recipients,
        subject: emailData.subject,
        hasSMTP: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
      })

      // Always try API route first for real email sending
      if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return await this.sendViaAPI(emailData, recipients)
      }
      
      // Option 1: Use EmailJS if configured
      if (process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID && process.env.EMAILJS_PUBLIC_KEY) {
        return await this.sendViaEmailJS(emailData, recipients)
      }
      
      // Option 2: Use external API if configured
      if (process.env.EMAIL_API_ENDPOINT) {
        return await this.sendViaAPI(emailData, recipients)
      }
      
      // Option 3: Create mailto links for development testing
      return await this.createMailtoLinks(emailData, recipients)
      
    } catch (error) {
      console.error('Direct email sending error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send email'
      }
    }
  }

  private static async sendViaEmailJS(emailData: EmailData, recipients: string[]): Promise<EmailResult> {
    try {
      console.log('📧 Sending via EmailJS...')
      
      // This would require EmailJS setup
      // For now, we'll simulate it
      
      return {
        success: true,
        message: `Email prepared for ${recipients.length} recipient(s) via EmailJS (setup required)`,
        sentCount: recipients.length
      }
    } catch (error) {
      return {
        success: false,
        error: `EmailJS error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private static async sendViaAPI(emailData: EmailData, recipients: string[]): Promise<EmailResult> {
    try {
      console.log('📧 Sending via local API route...')
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: recipients,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
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
        throw new Error(`API request failed: ${response.status} - ${errorData}`)
      }

      const result = await response.json()
      console.log('✅ API Route Response:', result)
      
      return {
        success: true,
        message: result.message || `Email processed via API for ${recipients.length} recipient(s)`,
        sentCount: recipients.length
      }
    } catch (error) {
      console.error('API Route Error:', error)
      return {
        success: false,
        error: `API error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  private static async createMailtoLinks(emailData: EmailData, recipients: string[]): Promise<EmailResult> {
    try {
      console.log('📧 Creating mailto links for testing...')
      
      // Create mailto links for each recipient
      recipients.forEach((recipient, index) => {
        const subject = encodeURIComponent(emailData.subject)
        const body = encodeURIComponent(emailData.text || emailData.html.replace(/<[^>]*>/g, ''))
        const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`
        
        console.log(`📧 Recipient ${index + 1}: ${recipient}`)
        console.log(`🔗 Mailto link: ${mailtoLink}`)
        
        // Open first few emails automatically for testing
        if (index < 3) {
          window.open(mailtoLink, '_blank')
        }
      })
      
      return {
        success: true,
        message: `Created mailto links for ${recipients.length} recipient(s). First 3 opened automatically.`,
        sentCount: recipients.length
      }
    } catch (error) {
      return {
        success: false,
        error: `Mailto error: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}
