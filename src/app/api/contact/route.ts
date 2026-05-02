import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getSiteConfig } from '@/lib/config'

export async function POST(req: NextRequest) {
  const config = getSiteConfig()

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Email service not configured.' }, { status: 503 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid form data.' }, { status: 400 })
  }

  const name = formData.get('name')?.toString().trim() ?? ''
  const email = formData.get('email')?.toString().trim() ?? ''
  const subject = formData.get('subject')?.toString().trim() ?? ''
  const message = formData.get('message')?.toString().trim() ?? ''
  const fileEntries = formData.getAll('files') as File[]

  if (!name || !email || !subject || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // Validate total file size (10 MB)
  const totalBytes = fileEntries.reduce((sum, f) => sum + f.size, 0)
  if (totalBytes > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'Attachments exceed 10 MB limit.' }, { status: 400 })
  }

  // Build attachments for Resend
  const attachments = await Promise.all(
    fileEntries
      .filter(f => f.size > 0)
      .map(async f => ({
        filename: f.name,
        content: Buffer.from(await f.arrayBuffer()),
      }))
  )

  const resend = new Resend(apiKey)

  try {
    await resend.emails.send({
      from: config.contact.resend_from,
      to: config.contact.to,
      replyTo: email,
      subject: `[Portfolio] ${subject}`,
      text: `From: ${name} <${email}>\n\n${message}`,
      html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><hr/><pre style="font-family:inherit;white-space:pre-wrap">${message}</pre>`,
      attachments: attachments.length > 0 ? attachments : undefined,
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact] Resend error:', err)
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}
