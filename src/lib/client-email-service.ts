// Client-side email service that calls the API route
export interface ClientEmailConfig {
  adminName: string
  userType: 'all' | 'users' | 'admins'
  bulkMode: boolean
  retryFailed: boolean
  emailDelay: number
  onProgress?: (stats: EmailStats) => void
}

export interface EmailStats {
  totalRecipients: number
  sentCount: number
  failedCount: number
  progress: number
}

export interface EmailResult {
  success: boolean
  message?: string
  error?: string
  sentCount?: number
  failedCount?: number
}

export class ClientEmailService {
  private static instance: ClientEmailService

  static getInstance(): ClientEmailService {
    if (!ClientEmailService.instance) {
      ClientEmailService.instance = new ClientEmailService()
    }
    return ClientEmailService.instance
  }

  // Send custom email to all users
  async sendToAllUsers(
    subject: string,
    message: string,
    config: ClientEmailConfig
  ): Promise<EmailResult> {
    try {
      const response = await fetch('/api/advanced-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'custom',
          subject,
          message,
          config
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send email')
      }

      return result
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
    config: ClientEmailConfig
  ): Promise<EmailResult> {
    try {
      const response = await fetch('/api/advanced-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'announcement',
          subject: title,
          message,
          config
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send announcement')
      }

      return result
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
    config: ClientEmailConfig
  ): Promise<EmailResult> {
    try {
      const response = await fetch('/api/advanced-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'deadline',
          subject: deadline,
          message: description,
          config
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send deadline reminder')
      }

      return result
    } catch (error) {
      console.error('Deadline reminder error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send deadline reminder'
      }
    }
  }

  // Send newsletter
  async sendNewsletter(
    subject: string,
    content: string,
    config: ClientEmailConfig
  ): Promise<EmailResult> {
    try {
      const response = await fetch('/api/advanced-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: 'newsletter',
          subject,
          message: content,
          config
        })
      })

      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to send newsletter')
      }

      return result
    } catch (error) {
      console.error('Newsletter error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send newsletter'
      }
    }
  }
}

export const clientEmailService = ClientEmailService.getInstance()
