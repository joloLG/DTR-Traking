import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const { to, subject, html, text, smtp }: EmailRequest = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: to, subject, html' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Use passed SMTP credentials if available, otherwise use environment variables
    const emailService = smtp ? 'smtp' : Deno.env.get('EMAIL_SERVICE') || 'resend'
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')
    const smtpHost = smtp?.host || Deno.env.get('SMTP_HOST')
    const smtpPort = smtp?.port || parseInt(Deno.env.get('SMTP_PORT') || '587')
    const smtpUser = smtp?.user || Deno.env.get('SMTP_USER')
    const smtpPass = smtp?.pass || Deno.env.get('SMTP_PASS')
    const fromEmail = smtp?.from || Deno.env.get('FROM_EMAIL') || 'noreply@jlgdev.com'
    const fromName = smtp?.fromName || Deno.env.get('FROM_NAME') || 'JLG DTR System'

    let response: Response

    if (emailService === 'smtp' && smtpHost && smtpUser && smtpPass) {
      // Use direct SMTP with passed credentials or environment variables
      response = await sendWithSMTP({
        to,
        subject,
        html,
        text,
        fromEmail,
        fromName,
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass
      })
    } else if (emailService === 'resend' && resendApiKey) {
      // Use Resend API
      response = await sendWithResend({
        to,
        subject,
        html,
        text,
        fromEmail,
        fromName,
        apiKey: resendApiKey
      })
    } else if (emailService === 'brevo' && brevoApiKey) {
      // Use Brevo (Sendinblue) API
      response = await sendWithBrevo({
        to,
        subject,
        html,
        text,
        fromEmail,
        fromName,
        apiKey: brevoApiKey
      })
    } else {
      return new Response(
        JSON.stringify({ 
          error: 'Email service not configured. Please set EMAIL_SERVICE and corresponding API keys' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return response
  } catch (error) {
    console.error('Email function error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function sendWithResend(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  fromEmail: string
  fromName: string
  apiKey: string
}): Promise<Response> {
  const recipients = Array.isArray(params.to) ? params.to : [params.to]
  
  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${params.fromName} <${params.fromEmail}>`,
      to: recipients,
      subject: params.subject,
      html: params.html,
      text: params.text,
    }),
  })

  const data = await resendResponse.json()

  if (!resendResponse.ok) {
    throw new Error(`Resend API error: ${data.message || 'Unknown error'}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Email sent via Resend',
      data 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function sendWithBrevo(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  fromEmail: string
  fromName: string
  apiKey: string
}): Promise<Response> {
  const recipients = Array.isArray(params.to) ? params.to : [params.to]
  
  const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': params.apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: params.fromName,
        email: params.fromEmail,
      },
      to: recipients.map(email => ({ email })),
      subject: params.subject,
      htmlContent: params.html,
      textContent: params.text,
    }),
  })

  const data = await brevoResponse.json()

  if (!brevoResponse.ok) {
    throw new Error(`Brevo API error: ${data.message || 'Unknown error'}`)
  }

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Email sent via Brevo',
      data 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}

async function sendWithSMTP(params: {
  to: string | string[]
  subject: string
  html: string
  text?: string
  fromEmail: string
  fromName: string
  host: string
  port: number
  user: string
  pass: string
}): Promise<Response> {
  // For SMTP, we'd need a library like nodemailer-deno or implement SMTP protocol
  // For now, we'll return a mock response
  const recipients = Array.isArray(params.to) ? params.to : [params.to]
  
  console.log('SMTP email would be sent:', {
    to: recipients,
    subject: params.subject,
    from: `${params.fromName} <${params.fromEmail}>`,
    host: params.host,
    port: params.port
  })

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: `Email would be sent via SMTP to ${recipients.length} recipients`,
      recipients 
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    }
  )
}
