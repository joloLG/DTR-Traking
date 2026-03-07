'use client'

import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Mail, 
  Send, 
  Users, 
  Calendar, 
  Bell, 
  Zap, 
  CheckCircle, 
  AlertCircle
} from 'lucide-react'
import { clientEmailService } from '@/lib/client-email-service'

interface EmailComposerProps {
  adminName: string
  onEmailSent?: (result: { success: boolean; message?: string; error?: string; sentCount?: number }) => void
}

interface EmailStats {
  totalRecipients: number
  sentCount: number
  failedCount: number
  progress: number
}

export function AdvancedEmailComposer({ adminName, onEmailSent }: EmailComposerProps) {
  const [emailType, setEmailType] = useState<'custom' | 'announcement' | 'deadline' | 'newsletter'>('custom')
  const [userType, setUserType] = useState<'all' | 'users' | 'admins'>('all')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [deadline, setDeadline] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; sentCount?: number } | null>(null)
  const [emailStats, setEmailStats] = useState<EmailStats>({
    totalRecipients: 0,
    sentCount: 0,
    failedCount: 0,
    progress: 0
  })
  const [enableBulkMode, setEnableBulkMode] = useState(true)
  const [enableRetryFailed, setEnableRetryFailed] = useState(true)
  const [emailDelay, setEmailDelay] = useState(100)

  const handleSendEmail = useCallback(async () => {
    setIsLoading(true)
    setResult(null)
    setEmailStats({ totalRecipients: 0, sentCount: 0, failedCount: 0, progress: 0 })

    try {
      let emailResult

      const emailConfig = {
        adminName,
        userType,
        bulkMode: enableBulkMode,
        retryFailed: enableRetryFailed,
        emailDelay,
        onProgress: (stats: EmailStats) => {
          setEmailStats(stats)
        }
      }

      switch (emailType) {
        case 'announcement':
          if (!subject || !message) {
            setResult({ success: false, message: 'Please provide title and message for announcement' })
            return
          }
          emailResult = await clientEmailService.sendSystemAnnouncement(subject, message, emailConfig)
          break

        case 'deadline':
          if (!deadline || !message) {
            setResult({ success: false, message: 'Please provide deadline and description for reminder' })
            return
          }
          emailResult = await clientEmailService.sendDeadlineReminder(deadline, message, emailConfig)
          break

        case 'newsletter':
          if (!subject || !message) {
            setResult({ success: false, message: 'Please provide subject and content for newsletter' })
            return
          }
          emailResult = await clientEmailService.sendNewsletter(subject, message, emailConfig)
          break

        case 'custom':
        default:
          if (!subject || !message) {
            setResult({ success: false, message: 'Please provide subject and message' })
            return
          }
          emailResult = await clientEmailService.sendToAllUsers(subject, message, emailConfig)
          break
      }

      setResult({
        success: emailResult.success,
        message: emailResult.message || emailResult.error || 'Unknown result',
        sentCount: emailResult.sentCount
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
  }, [emailType, subject, message, deadline, adminName, userType, enableBulkMode, enableRetryFailed, emailDelay, onEmailSent])

  const renderEmailPreview = () => {
    if (!subject && !message) return null

    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-medium mb-2">Email Preview</h4>
        <div className="bg-white border rounded p-3">
          <div className="border-b pb-2 mb-2">
            <p className="text-sm text-gray-600">Subject:</p>
            <p className="font-medium">{subject || 'No subject'}</p>
          </div>
          <div className="mb-2">
            <p className="text-sm text-gray-600">Message:</p>
            <div className="text-sm whitespace-pre-wrap">{message || 'No message content'}</div>
          </div>
          <div className="text-xs text-gray-500 border-t pt-2">
            <p>From: {adminName} (System Administrator)</p>
            <p>To: {userType === 'all' ? 'All Users' : userType === 'users' ? 'Regular Users' : 'Admins Only'}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Advanced Email Composer
          <Badge variant="secondary" className="ml-2">SMTP Enhanced</Badge>
        </CardTitle>
        <CardDescription>
          High-performance bulk email system with real-time progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="compose" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compose">Compose</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="compose" className="space-y-6">
            {/* Email Type Selection */}
            <div className="space-y-2">
              <Label>Email Type</Label>
              <Select value={emailType} onValueChange={(value: 'custom' | 'announcement' | 'deadline' | 'newsletter') => setEmailType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select email type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Custom Email
                    </div>
                  </SelectItem>
                  <SelectItem value="announcement">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      System Announcement
                    </div>
                  </SelectItem>
                  <SelectItem value="deadline">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Deadline Reminder
                    </div>
                  </SelectItem>
                  <SelectItem value="newsletter">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Newsletter
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User Type Selection */}
            <div className="space-y-2">
              <Label htmlFor="userType">Send To</Label>
              <Select value={userType} onValueChange={(value: 'all' | 'users' | 'admins') => setUserType(value)}>
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

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                {emailType === 'announcement' ? 'Announcement Title' : 
                 emailType === 'deadline' ? 'Reminder Subject' : 
                 emailType === 'newsletter' ? 'Newsletter Subject' : 'Email Subject'}
              </Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder={
                  emailType === 'announcement' ? 'Enter announcement title...' :
                  emailType === 'deadline' ? 'Enter reminder subject...' :
                  emailType === 'newsletter' ? 'Enter newsletter subject...' :
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
                 emailType === 'deadline' ? 'Deadline Description' :
                 emailType === 'newsletter' ? 'Newsletter Content' : 'Email Message'}
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  emailType === 'announcement' ? 'Enter your announcement details...' :
                  emailType === 'deadline' ? 'Enter deadline details and requirements...' :
                  emailType === 'newsletter' ? 'Enter your newsletter content...' :
                  'Enter your email message...'
                }
                rows={8}
              />
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bulkMode" 
                  checked={enableBulkMode}
                  onCheckedChange={(checked: boolean) => setEnableBulkMode(checked)}
                />
                <Label htmlFor="bulkMode" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Enable Bulk Mode (Recommended for large lists)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="retryFailed" 
                  checked={enableRetryFailed}
                  onCheckedChange={(checked: boolean) => setEnableRetryFailed(checked)}
                />
                <Label htmlFor="retryFailed" className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Auto-retry Failed Emails
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailDelay">Email Delay (ms between sends)</Label>
                <Input
                  id="emailDelay"
                  type="number"
                  value={emailDelay}
                  onChange={(e) => setEmailDelay(parseInt(e.target.value) || 100)}
                  min="0"
                  max="5000"
                  step="100"
                />
                <p className="text-xs text-gray-500">
                  Higher delays help avoid rate limits. 100-500ms recommended for most SMTP providers.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {renderEmailPreview()}
          </TabsContent>
        </Tabs>

        {/* Progress Bar */}
        {isLoading && emailStats.totalRecipients > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Sending Progress</span>
              <span>{emailStats.sentCount} / {emailStats.totalRecipients}</span>
            </div>
            <Progress value={emailStats.progress} className="w-full" />
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-green-600">{emailStats.sentCount}</p>
                <p className="text-gray-500">Sent</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-red-600">{emailStats.failedCount}</p>
                <p className="text-gray-500">Failed</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-blue-600">{emailStats.progress.toFixed(0)}%</p>
                <p className="text-gray-500">Progress</p>
              </div>
            </div>
          </div>
        )}

        {/* Result Message */}
        {result && (
          <div className={`p-4 rounded-lg ${
            result.success 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
              <div>
                <p className="font-medium">
                  {result.success ? '✅ Email Sent Successfully!' : '❌ Email Sending Failed'}
                </p>
                <p className="text-sm mt-1">{result.message}</p>
                {result.sentCount && (
                  <p className="text-sm mt-1">Total emails sent: {result.sentCount}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Development Mode Notice */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-lg">
            <p className="font-medium text-sm">🔧 Development Mode - Real Email Sending</p>
            <p className="text-xs mt-1">
              {process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
                ? `✅ Real email sending enabled via ${process.env.SMTP_HOST}. Emails will be sent to actual users.`
                : '❌ SMTP configuration missing. Emails will be logged to console.'}
            </p>
          </div>
        )}

        {/* Send Button */}
        <Button 
          onClick={handleSendEmail} 
          disabled={isLoading || !subject || !message}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              {emailStats.totalRecipients > 0 ? `Sending... ${emailStats.progress.toFixed(0)}%` : 'Sending...'}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Email
            </>
          )}
        </Button>

        {/* Feature Info */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">🚀 Advanced Features:</p>
          <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
            <li>✅ Real email sending via SMTP (not just logging)</li>
            <li>Enhanced SMTP Node Mailer with connection pooling</li>
            <li>Real-time progress tracking and error handling</li>
            <li>Automatic retry mechanism for failed emails</li>
            <li>Rate limiting protection with configurable delays</li>
            <li>Bulk email optimization for large recipient lists</li>
            <li>Professional JLG DEV Solutions branding</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
