import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: Request) {
  try {
    const { to, name, password } = await request.json()

    // Create email transporter (using Ethereal for testing - free)
    // For real emails, you'd use Gmail, SendGrid, etc.
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'your-test-email@ethereal.email', // You'll get this from https://ethereal.email
        pass: 'your-test-password'
      }
    })

    // Email content
    const mailOptions = {
      from: '"Cloudz Travels CRM" <noreply@cloudztravels.com>',
      to: to,
      subject: 'Welcome to Cloudz Travels Internship Program!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to Cloudz Travels!</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb;">
            <h2>Dear ${name},</h2>
            <p>We're excited to welcome you to the Cloudz Travels Internship Program!</p>
            <p>Your account has been created successfully. Here are your login details:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Email:</strong> ${to}</p>
              <p><strong>Temporary Password:</strong> ${password || 'Use the password you signed up with'}</p>
            </div>
            <p>You can log in to your portal here:</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Login to Portal</a>
            <p style="margin-top: 30px;">Best regards,<br><strong>Cloudz Travels Team</strong></p>
          </div>
        </div>
      `
    }

    // Send email
    await transporter.sendMail(mailOptions)
    
    return NextResponse.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email error:', error)
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 })
  }
}