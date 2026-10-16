// Utility to send branded, transactional emails through /api/send-email (Resend API)
export async function sendInstitutionalEmail({
  to,
  subject,
  html,
  text,
  from,
  reply_to
}) {
  try {
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, html, text, from, reply_to })
    });
    return await res.json();
  } catch (err) {
    console.warn('Institutional email sending error:', err);
    return { error: err.message };
  }
}

// Pre-built Branded Welcome Email Template
export function generateWelcomeEmailHtml({ name, role, email, identifier, portalUrl, tempPassword }) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Welcome to NexaTransform Hub LMIS</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">"Intelligent solutions that drive growth."</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">Welcome, ${name}!</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                You have been registered as an authorized <strong>${role}</strong> on the <strong>NexaTransform Hub Learning Management &amp; Information System (LMIS)</strong>.
              </p>

              <!-- Credentials Box -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #c9a34e; font-weight: 700; margin-bottom: 12px;">Your Portal Access Details</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Portal Role:</strong> ${role}</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Official Email:</strong> ${email}</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>ID / Reference:</strong> ${identifier}</div>
                    ${tempPassword ? `<div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Temporary Password:</strong> <code style="background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #38bdf8;">${tempPassword}</code></div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" target="_blank" style="background: linear-gradient(135deg, #c9a34e 0%, #b38b36 100%); color: #0d1527; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 163, 78, 0.3);">
                  Log In to ${role} Portal &rarr;
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 25px 0 0; text-align: center;">
                For your security, please sign in and set your personal password if prompted.<br>
                If you did not expect this email, please contact our academic registrar.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0f1d; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} NexaTransform Hub (Pty) Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Branded Study Material Notification Email Template
export function generateStudyMaterialNotificationEmailHtml({
  learnerName,
  materialTitle,
  materialType,
  courseCode,
  courseTitle,
  facilitatorName,
  unitOrWeek,
  estimatedMinutes,
  description,
  portalUrl = 'https://nexa-transform.com/lmis/learner'
}) {
  const typeBadgeColor = materialType === 'Video' ? '#a855f7' : materialType === 'Presentation' ? '#f59e0b' : '#06b6d4';
  const typeIcon = materialType === 'Video' ? '🎥 Video Lesson' : materialType === 'Presentation' ? '📊 PowerPoint Deck' : '📄 Study Document';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Study Material Published - ${courseCode}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">"Intelligent solutions that drive growth."</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: rgba(201,163,78,0.2); color: #c9a34e; margin-bottom: 15px;">
                New Study Material Available
              </div>

              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">Hello ${learnerName || 'Learner'},</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Your academic facilitator, <strong>${facilitatorName || 'Academic Faculty'}</strong>, has just published new study material for your course <strong>${courseCode}${courseTitle ? ` · ${courseTitle}` : ''}</strong>.
              </p>

              <!-- Material Details Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="margin-bottom: 10px;">
                      <span style="background-color: ${typeBadgeColor}; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px;">
                        ${typeIcon}
                      </span>
                      ${unitOrWeek && unitOrWeek !== materialTitle ? `<span style="background-color: #1e293b; color: #38bdf8; font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 4px; margin-left: 6px;">${unitOrWeek}</span>` : ''}
                    </div>

                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
                      ${materialTitle}
                    </div>

                    ${description ? `
                    <div style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin-top: 6px;">
                      ${description}
                    </div>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Call to Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" target="_blank" style="background: linear-gradient(135deg, #c9a34e 0%, #b38b36 100%); color: #0d1527; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 163, 78, 0.3);">
                  View &amp; Download Material in Learner Portal &rarr;
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 25px 0 0; text-align: center;">
                You can review this material in-browser or download it directly to your device for offline study.<br>
                For questions regarding this material, message your facilitator through the portal.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0f1d; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} NexaTransform Hub (Pty) Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Branded Lecturer Quiz Confirmation Email Template
export function generateLecturerQuizConfirmationEmailHtml({
  lecturerName,
  quizTitle,
  courseCode,
  courseTitle = '',
  duration = 30,
  passMark = 50,
  questionsCount = 1,
  startTime = '',
  endTime = '',
  portalUrl = 'https://nexa-transform.com/lmis/lecturer'
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quiz Published: ${quizTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">Faculty &amp; Academic Operations</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: rgba(34,197,94,0.2); color: #86efac; margin-bottom: 15px;">
                ✓ Quiz Successfully Published
              </div>

              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">Hello ${lecturerName || 'Facilitator'},</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Your new interactive assessment <strong>"${quizTitle}"</strong> for <strong>${courseCode}${courseTitle ? ` · ${courseTitle}` : ''}</strong> is now live on the NexaTransform LMIS.
              </p>

              <!-- Quiz Parameters Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 12px;">
                      ${quizTitle}
                    </div>
                    <div style="display: grid; gap: 8px; font-size: 14px; color: #e2e8f0;">
                      <div style="margin-bottom: 6px;"><strong>Course Code:</strong> <span style="color: #c9a34e;">${courseCode}</span></div>
                      <div style="margin-bottom: 6px;"><strong>Questions:</strong> ${questionsCount} question(s)</div>
                      <div style="margin-bottom: 6px;"><strong>Time Limit:</strong> ⏱️ ${duration} minutes</div>
                      <div style="margin-bottom: 6px;"><strong>Pass Mark:</strong> 🎯 ${passMark}%</div>
                      ${startTime ? `<div style="margin-bottom: 6px;"><strong>Start Date:</strong> ${startTime.replace('T', ' ')}</div>` : ''}
                      ${endTime ? `<div style="margin-bottom: 6px;"><strong>Closing Date:</strong> ${endTime.replace('T', ' ')}</div>` : ''}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Call to Action -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" target="_blank" style="background: linear-gradient(135deg, #c9a34e 0%, #b38b36 100%); color: #0d1527; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 163, 78, 0.3);">
                  View Quiz in Lecturer Portal &rarr;
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 25px 0 0; text-align: center;">
                Enrolled learners in ${courseCode} have been notified. Student submissions and auto-graded results will be tracked in real-time.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0f1d; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} NexaTransform Hub (Pty) Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Branded Learner Quiz Alert Email Template
export function generateLearnerQuizAlertEmailHtml({
  learnerName,
  quizTitle,
  courseCode,
  courseTitle = '',
  facilitatorName = '',
  duration = 30,
  passMark = 50,
  questionsCount = 1,
  endTime = '',
  portalUrl = 'https://nexa-transform.com/lmis/learner'
}) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Quiz Available: ${quizTitle}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">Student Learning Portal</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 30px;">
              <div style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; background: rgba(201,163,78,0.2); color: #c9a34e; margin-bottom: 15px;">
                ⚡ New Assessment Available
              </div>

              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">Hello ${learnerName || 'Learner'},</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                Your facilitator, <strong>${facilitatorName || 'Academic Faculty'}</strong>, has published an interactive quiz for <strong>${courseCode}${courseTitle ? ` · ${courseTitle}` : ''}</strong>.
              </p>

              <!-- Assessment Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 25px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-bottom: 10px;">
                      ${quizTitle}
                    </div>
                    <div style="font-size: 14px; color: #e2e8f0; line-height: 1.6;">
                      <div><strong>Module:</strong> <span style="color: #c9a34e;">${courseCode}</span></div>
                      <div><strong>Total Questions:</strong> ${questionsCount}</div>
                      <div><strong>Time Limit:</strong> ⏱️ ${duration} mins</div>
                      <div><strong>Pass Requirement:</strong> 🎯 ${passMark}%</div>
                      ${endTime ? `<div><strong>Deadline:</strong> 📅 ${endTime.replace('T', ' ')}</div>` : ''}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${portalUrl}" target="_blank" style="background: linear-gradient(135deg, #c9a34e 0%, #b38b36 100%); color: #0d1527; font-weight: 700; text-decoration: none; padding: 14px 32px; border-radius: 8px; display: inline-block; font-size: 15px; box-shadow: 0 4px 15px rgba(201, 163, 78, 0.3);">
                  Open Learner Portal to Start Quiz &rarr;
                </a>
              </div>

              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 25px 0 0; text-align: center;">
                Make sure you have a stable internet connection before starting the timer.<br>
                Best of luck with your assessment!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0f1d; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} NexaTransform Hub (Pty) Ltd. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Branded Notification Email to Admin for Website Inquiries & Partnership Requests
export function generateContactEnquiryAdminEmailHtml({ name, organisation, email, phone, audience_type, enquiry_type, service_interest, industry_sector, message }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>New Enquiry / Partnership Request</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: 0.5px;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">Website Lead &amp; Partnership Dispatch</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <span style="display: inline-block; padding: 4px 12px; background: rgba(201,163,78,0.15); color: #c9a34e; border-radius: 9999px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 12px;">
                ${enquiry_type || 'General Enquiry'}
              </span>
              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">New Web Inquiry: ${name}</h2>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Full Name:</strong> ${name}</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Email:</strong> <a href="mailto:${email}" style="color: #38bdf8; text-decoration: none;">${email}</a></div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Phone:</strong> ${phone || 'Not provided'}</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Organisation:</strong> ${organisation || 'Individual'}</div>
                    ${industry_sector ? `<div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Industry Sector:</strong> ${industry_sector}</div>` : ''}
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Audience Type:</strong> ${audience_type || 'Individual / Organisation'}</div>
                    <div style="font-size: 14px; margin-bottom: 8px; color: #e2e8f0;"><strong>Service of Interest:</strong> ${service_interest || 'Not specified'}</div>
                  </td>
                </tr>
              </table>
              <div style="background-color: #0f172a; padding: 20px; border-radius: 8px; border-left: 4px solid #c9a34e; margin-bottom: 25px;">
                <p style="margin: 0 0 8px; font-size: 12px; text-transform: uppercase; color: #94a3b8; font-weight: 700;">Message Content</p>
                <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #f1f5f9; white-space: pre-wrap;">${message || 'No additional message.'}</p>
              </div>
              <div style="text-align: center;">
                <a href="mailto:${email}?subject=Re: NexaTransform Hub — ${enquiry_type || 'Enquiry'}" style="background: #c9a34e; color: #0d1527; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 6px; display: inline-block; font-size: 14px;">
                  Reply Directly to ${name} &rarr;
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0f1d; padding: 16px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">NexaTransform Hub Platform &bull; Automated Dispatch</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Branded Confirmation Email to Prospect
export function generateContactEnquiryClientConfirmationHtml({ name, enquiry_type }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Thank you for reaching out</title></head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0d1527; color: #ffffff;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0d1527; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #131d35; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <tr>
            <td style="background: linear-gradient(135deg, #0d1527 0%, #1e293b 100%); padding: 30px; text-align: center; border-bottom: 2px solid #c9a34e;">
              <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff;">NexaTransform Hub</h1>
              <p style="margin: 5px 0 0; font-size: 13px; color: #c9a34e; font-style: italic;">"Intelligent solutions that drive growth."</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 35px 30px;">
              <h2 style="margin: 0 0 15px; font-size: 20px; color: #ffffff;">Thank you, ${name}!</h2>
              <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; color: #cbd5e1;">
                We have received your enquiry regarding <strong>${enquiry_type || 'Partnership / Services'}</strong>. One of our specialist transformation consultants will review your request and contact you within 24 hours.
              </p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0a0f1d; border: 1px solid #1e293b; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <div style="font-size: 12px; text-transform: uppercase; color: #c9a34e; font-weight: 700; margin-bottom: 8px;">Direct Contact</div>
                    <div style="font-size: 14px; margin-bottom: 6px; color: #e2e8f0;"><strong>Email:</strong> admissions@nexa-transform.com</div>
                    <div style="font-size: 14px; color: #e2e8f0;"><strong>Website:</strong> https://nexa-transform.com</div>
                  </td>
                </tr>
              </table>
              <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 25px 0 0;">
                Warm regards,<br>
                <strong style="color: #ffffff;">The NexaTransform Hub Team</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #0a0f1d; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05);">
              <p style="margin: 0; font-size: 12px; color: #64748b;">&copy; ${new Date().getFullYear()} NexaTransform Hub (Pty) Ltd. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}


