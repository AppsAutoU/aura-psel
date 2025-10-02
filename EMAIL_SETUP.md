# Email Setup with Nodemailer

We've switched from Resend to Nodemailer to send emails directly to candidates without domain verification requirements.

## Setup Instructions

### Option 1: Gmail (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "Aura PSEL"
   - Copy the 16-character password

3. **Update your `.env` file**:
   ```bash
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # The app password from step 2
   EMAIL_FROM=Aura RH <your-email@gmail.com>
   ```

### Option 2: Outlook/Hotmail

1. Update your `.env` file:
   ```bash
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-password
   EMAIL_FROM=Aura RH <your-email@outlook.com>
   ```

2. Update `src/lib/email/nodemailer.ts` line 6:
   ```typescript
   service: 'hotmail', // Changed from 'gmail'
   ```

### Option 3: Other SMTP Provider

If you want to use a custom SMTP server:

1. Update `src/lib/email/nodemailer.ts`:
   ```typescript
   const transporter = nodemailer.createTransport({
     host: 'smtp.your-provider.com',
     port: 587,
     secure: false, // true for 465, false for other ports
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASSWORD,
     },
   })
   ```

## Testing

After setting up your credentials:

1. Restart your dev server
2. Go to Portal Administrador
3. Select a candidate
4. Click "Avaliar com IA"
5. The email will be sent directly to the candidate's email address

## Advantages over Resend

- ✅ No domain verification required
- ✅ Send to any email address immediately
- ✅ Free with Gmail (up to 500 emails/day)
- ✅ Works with any SMTP provider
- ✅ No vendor lock-in

## Troubleshooting

### Gmail: "Less secure app access"
- Make sure you're using an **App Password**, not your regular Gmail password
- Enable 2-Factor Authentication first

### Gmail: Rate limits
- Gmail free accounts can send ~500 emails/day
- For higher volume, consider upgrading to Google Workspace

### Emails going to spam
- Make sure your EMAIL_FROM matches your EMAIL_USER domain
- Consider adding SPF/DKIM records to your domain (not required but helps)

## Daily Limits

- **Gmail (free)**: ~500 emails/day
- **Gmail (Workspace)**: 2,000 emails/day
- **Outlook (free)**: 300 emails/day
- **Outlook (365)**: 10,000 emails/day

For production with high volume, consider:
- Google Workspace
- SendGrid (requires domain verification but has higher limits)
- AWS SES (very cheap, requires domain verification)
