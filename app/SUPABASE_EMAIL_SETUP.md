# Supabase Email Verification Setup Guide

Follow these steps to configure email verification for CoreHealth with Supabase:

## 1. Configure Email Templates in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your CoreHealth project
3. Navigate to **Authentication** > **Email Templates**

## 2. Confirm your account Template

1. Click on **Confirm your account** template
2. Update the subject line: `Verify your CoreHealth account`
3. Update the email body with this template:

```html
<h2>Welcome to CoreHealth!</h2>
<p>
  Thanks for signing up! Please click the link below to verify your email
  address and activate your account:
</p>

<p><a href="{{ .ConfirmationURL }}">Verify Your Account</a></p>

<p>
  If the button above doesn't work, copy and paste this link into your browser:
</p>
<p>{{ .ConfirmationURL }}</p>

<p>This link will expire in 24 hours for security reasons.</p>

<p>
  If you didn't create an account with CoreHealth, you can safely ignore this
  email.
</p>

<p>Best regards,<br />The CoreHealth Team</p>
```

## 3. Configure Site URL

1. Go to **Settings** > **General**
2. Set your **Site URL** to your app's domain (for production) or use `http://localhost:3000` for development
3. Add any additional redirect URLs in **Redirect URLs** if needed

## 4. Email Provider Configuration

### Option A: Use Supabase's Built-in Email (Development)

- Supabase provides email sending for development
- Limited to 3 emails per hour for free tier
- Emails may go to spam folder

### Option B: Configure Custom SMTP (Recommended for Production)

1. Go to **Settings** > **Authentication**
2. Scroll down to **SMTP Settings**
3. Configure with your email provider:

**Gmail Example:**

- SMTP Host: `smtp.gmail.com`
- SMTP Port: `587`
- SMTP User: `your-email@gmail.com`
- SMTP Pass: `your-app-password`
- Sender Name: `CoreHealth`
- Sender Email: `your-email@gmail.com`

**SendGrid Example:**

- SMTP Host: `smtp.sendgrid.net`
- SMTP Port: `587`
- SMTP User: `apikey`
- SMTP Pass: `your-sendgrid-api-key`
- Sender Name: `CoreHealth`
- Sender Email: `your-verified-sender@yourdomain.com`

## 5. Test Email Verification

1. Register a new account in your app
2. Check your email (including spam folder)
3. Click the verification link
4. Confirm you see the "Account Confirmed!" message
5. Try logging in with the verified account

## 6. Authentication Flow Features

✅ **First Name & Surname Fields**: Registration now collects separate name fields
✅ **Email Verification Required**: Users must verify email before login
✅ **Verification Link Handling**: Clicking email link shows confirmation screen
✅ **Resend Verification**: Users can resend verification emails from login screen
✅ **Professional UI**: Clean, modern authentication screens

## 7. Troubleshooting

**Emails not sending:**

- Check your SMTP configuration
- Verify sender email is authenticated with your provider
- Check Supabase logs in Dashboard > Logs

**Verification link doesn't work:**

- Ensure Site URL is correctly configured
- Check that the link hasn't expired (24 hours)
- Verify the app is running and accessible

**Users can't login after verification:**

- Check that `email_confirmed_at` field is populated in Supabase auth.users table
- Verify the login flow checks for email verification

## 8. Production Checklist

- [ ] Configure custom SMTP provider
- [ ] Set production Site URL
- [ ] Test email delivery thoroughly
- [ ] Configure proper DNS records for email domain
- [ ] Set up email monitoring/logging
- [ ] Test on multiple email providers (Gmail, Outlook, etc.)

## 9. Next Steps

After email verification is working, consider adding:

- Welcome email after successful verification
- Password reset emails with custom templates
- Account notification emails
- Email preferences in user profile

The email verification system is now fully functional with Supabase!
