'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Mail, Send, Users, Calendar, Bell } from 'lucide-react'
import { emailService } from '@/lib/email-service'

interface EmailComposerProps {
  adminName: string
  onEmailSent?: (result: { success: boolean; message?: string; error?: string }) => void
}

export function EmailComposer({ adminName, onEmailSent }: EmailComposerProps) {
  const [emailType, setEmailType] = useState<'custom' | 'announcement' | 'deadline'>('custom')
  const [userType, setUserType] = useState<'all' | 'users' | 'admins'>('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSendEmail = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      let emailResult

      switch (emailType) {
        case 'announcement':
          if (!subject || !message) {
            setResult({ success: false, message: 'Please provide title and message for announcement' })
            return
          }
          emailResult = await emailService.sendSystemAnnouncement(subject, message, adminName, userType)
          break

        case 'deadline':
          if (!deadline || !message) {
            setResult({ success: false, message: 'Please provide deadline and description for reminder' })
            return
          }
          emailResult = await emailService.sendDeadlineReminder(deadline, message, adminName, userType)
          break

        case 'custom':
        default:
          if (!subject || !message) {
            setResult({ success: false, message: 'Please provide subject and message' })
            return
          }
          emailResult = await emailService.sendToAllUsers(subject, message, adminName, userType)
          break
      }

      setResult({
        success: emailResult.success,
        message: emailResult.message || emailResult.error || 'Unknown result'
      })
      onEmailSent?.(emailResult)

      // Reset form on success
      if (emailResult.success) {
        setSubject('')
        setMessage('')
        setDeadline('')
      }
    } catch (error) {
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send email'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Composer
        </CardTitle>
        <CardDescription>
          Send emails to all system users
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Type Selection */}
        <div className="space-y-2">
          <Label>Email Type</Label>
          <RadioGroup value={emailType} onValueChange={(value: string) => setEmailType(value as 'custom' | 'announcement' | 'deadline')}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="custom" />
              <Label htmlFor="custom" className="flex items-center gap-2 cursor-pointer">
                <Mail className="h-4 w-4" />
                Custom Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="announcement" id="announcement" />
              <Label htmlFor="announcement" className="flex items-center gap-2 cursor-pointer">
                <Bell className="h-4 w-4" />
                System Announcement
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="deadline" id="deadline" />
              <Label htmlFor="deadline" className="flex items-center gap-2 cursor-pointer">
                <Calendar className="h-4 w-4" />
                Deadline Reminder
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* User Type Selection */}
        <div className="space-y-2">
          <Label htmlFor="userType">Send To</Label>
          <Select value={userType} onValueChange={(value: string) => setUserType(value as 'all' | 'users' | 'admins')}>
            <SelectTrigger>
              <SelectValue placeholder="Select user type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  All Users
                </div>
              </SelectItem>
              <SelectItem value="users">Regular Users Only</SelectItem>
              <SelectItem value="admins">Admins Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Subject/Title */}
        <div className="space-y-2">
          <Label htmlFor="subject">
            {emailType === 'announcement' ? 'Announcement Title' : 
             emailType === 'deadline' ? 'Reminder Subject' : 'Email Subject'}
          </Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={
              emailType === 'announcement' ? 'Enter announcement title...' :
              emailType === 'deadline' ? 'Enter reminder subject...' :
              'Enter email subject...'
            }
          />
        </div>

        {/* Deadline (only for deadline reminders) */}
        {emailType === 'deadline' && (
          <div className="space-y-2">
            <Label htmlFor="deadline">Deadline Date</Label>
            <Input
              id="deadline"
              type="datetime-local"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              placeholder="Select deadline..."
            />
          </div>
        )}

        {/* Message */}
        <div className="space-y-2">
          <Label htmlFor="message">
            {emailType === 'announcement' ? 'Announcement Message' :
             emailType === 'deadline' ? 'Deadline Description' : 'Email Message'}
          </Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={
              emailType === 'announcement' ? 'Enter your announcement details...' :
              emailType === 'deadline' ? 'Enter deadline details and requirements...' :
              'Enter your email message...'
            }
            rows={6}
          />
        </div>

        {/* Result Message */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <p className="font-medium">
              {result.success ? '✅ Success!' : '❌ Error'}
            </p>
            <p className="text-sm mt-1">{result.message}</p>
          </div>
        )}

        {/* Development Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg">
            <p className="font-medium text-sm">🔧 Development Mode</p>
            <p className="text-xs mt-1">
              {process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
                ? `Real email sending enabled (${process.env.SMTP_HOST}). Emails will be sent via nodemailer.`
                : 'Emails will be logged to console instead of being sent.'}
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendEmail} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>

        {/* Preview Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">📧 Email Preview:</p>
          <p>This email will be sent to <strong>{userType === 'all' ? 'all users' : userType}</strong> and will include:</p>
          <ul className="mt-1 ml-4 list-disc text-xs">
            <li>Professional JLG DEV Solutions branding</li>
            <li>Your name as sender ({adminName})</li>
            <li>Link to DTR system</li>
            <li>Formatted HTML and text versions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
