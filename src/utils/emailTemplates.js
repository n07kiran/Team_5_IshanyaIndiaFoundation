export const parentAppointmentScheduled = (appointment, employee) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; color: #2d3748; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; background: #f7fafc; border-radius: 8px; }
        .header { color: #2b6cb0; font-size: 24px; margin-bottom: 20px; text-align: center; }
        .details { background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .icon { color: #4299e1; margin-right: 10px; font-size: 1.2em; }
        .highlight { color: #2c5282; font-weight: 600; }
        .note-box { background: #fff5f5; border-left: 4px solid #fc8181; padding: 15px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">🎉 Appointment Scheduled Successfully</h2>
        
        <div class="details">
            <p style="font-size: 18px; color: #4a5568;">Dear ${appointment.parentName},</p>
            
            <p style="color: #718096; line-height: 1.6;">Your appointment for <span class="highlight">${appointment.studentName}</span> has been successfully scheduled with Ishanya Foundation.</p>

            <div style="margin: 25px 0;">
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">📅</span>
                    <span><span class="highlight">Date:</span> ${appointment.date.toDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">⏰</span>
                    <span><span class="highlight">Time:</span> ${String(appointment.time.hr).padStart(2, '0')}:${String(appointment.time.min).padStart(2, '0')}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">👩🏫</span>
                    <span><span class="highlight">Assigned Educator:</span> ${employee.firstName} ${employee.lastName}</span>
                </div>
            </div>

            <div class="note-box">
                <h4 style="color: #c53030; margin-top: 0;">Important Notes:</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li style="margin: 8px 0;">Arrive 15 minutes prior to your scheduled time</li>
                    <li style="margin: 8px 0;">Bring any relevant medical reports/assessments</li>
                    <li style="margin: 8px 0;">Contact us at <span class="highlight">+91 73496 76668</span> for changes</li>
                </ul>
            </div>

            <p style="color: #718096; line-height: 1.6;">You'll receive a reminder SMS one day prior. We look forward to welcoming you!</p>
        </div>

        <footer style="margin-top: 30px; text-align: center; color: #718096; font-size: 0.9em;">
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p>Warm regards,<br>
            <strong style="color: #2b6cb0;">Ishanya Foundation</strong></p>
            <p>[Address Line]<br>
            [City, State - Pincode]</p>
        </footer>
    </div>
</body>
</html>
`;

export const employeeAppointmentScheduled = (appointment, employee) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; color: #2d3748; }
        .container { max-width: 600px; margin: 20px auto; padding: 25px; background: #f7fafc; border-radius: 8px; }
        .header { color: #2b6cb0; font-size: 24px; margin-bottom: 20px; text-align: center; }
        .details { background: white; padding: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .icon { color: #4299e1; margin-right: 10px; }
        .highlight { color: #2b6cb0; font-weight: 600; }
        .button {
            display: inline-block;
            margin-top: 20px;
            padding: 12px 24px;
            background: #4299e1;
            color: white;
            text-decoration: none;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2 class="header">🎉 New Appointment Scheduled</h2>
        
        <div class="details">
            <p style="font-size: 18px; color: #4a5568;">Dear ${employee.firstName},</p>
            
            <div style="margin: 20px 0;">
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">📅</span>
                    <span><span class="highlight">Date:</span> ${appointment.date.toDateString()}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">⏰</span>
                    <span><span class="highlight">Time:</span> ${String(appointment.time.hr).padStart(2, '0')}:${String(appointment.time.min).padStart(2, '0')}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">👨🎓</span>
                    <span><span class="highlight">Student:</span> ${appointment.studentName}</span>
                </div>
                <div style="display: flex; align-items: center; margin: 15px 0;">
                    <span class="icon">👪</span>
                    <span><span class="highlight">Parent:</span> ${appointment.parentName}</span>
                </div>
            </div>
        <div style="margin-top: 30px; text-align: center; color: #718096;">
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p>Best regards,<br><strong style="color: #2b6cb0;">Ishanya Team</strong></p>
        </div>
    </div>
</body>
</html>
`;

export const newEmployeeWelcome = (employee, defaultPassword) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c5282; text-align: center;">Welcome to Ishanya Foundation! 🎉</h2>
        
        <p style="color: #4a5568; font-size: 16px;">Dear ${employee.firstName} ${employee.lastName},</p>
        
        <p style="color: #4a5568;">We are thrilled to welcome you to the Ishanya Foundation family! Your account has been successfully created with the following credentials:</p>
        
        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #4299e1; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong style="color: #2b6cb0;">Employee ID:</strong> <span style="color: #4a5568;">${employee.employeeID}</span></p>
            <p style="margin: 5px 0;"><strong style="color: #2b6cb0;">Email:</strong> <span style="color: #4a5568;">${employee.email}</span></p>
            <p style="margin: 5px 0;"><strong style="color: #2b6cb0;">Default Password:</strong> <span style="color: #e53e3e;">${defaultPassword}</span></p>
        </div>

        <div style="background-color: #fff5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0;">🔐 <strong>Important:</strong> Please change your password upon your first login for security purposes.</p>
        </div>

        <p style="color: #4a5568;">Here are a few next steps:</p>
        <ul style="color: #4a5568;">
            <li>Log in to your account using the credentials above</li>
            <li>Update your password</li>
            <li>Complete your profile information</li>
            <li>Review our employee handbook and policies</li>
        </ul>

        <p style="color: #4a5568;">If you have any questions or need assistance, please don't hesitate to reach out to our HR team.</p>

        <div style="margin-top: 30px; text-align: center; color: #718096;">
            <p style="margin: 5px 0;">Best regards,</p>
            <p style="margin: 5px 0;"><strong>Ishanya Foundation Team</strong></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="color: #718096; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
`;

export const newStudentWelcome = (student, defaultPassword) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #38a169; text-align: center;">Welcome to Ishanya Foundation! 🌟</h2>
        
        <p style="color: #4a5568; font-size: 16px;">Dear ${student.parentEmail ? 'Parent/Guardian of' : ''} ${student.firstName} ${student.lastName},</p>
        
        <p style="color: #4a5568;">We are delighted to welcome ${student.firstName} to the Ishanya Foundation family! A student account has been created with the following credentials:</p>
        
        <div style="background-color: #f0fff4; padding: 15px; border-left: 4px solid #48bb78; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong style="color: #276749;">Student ID:</strong> <span style="color: #4a5568;">${student.studentID}</span></p>
            <p style="margin: 5px 0;"><strong style="color: #276749;">Email:</strong> <span style="color: #4a5568;">${student.email}</span></p>
            <p style="margin: 5px 0;"><strong style="color: #276749;">Default Password:</strong> <span style="color: #e53e3e;">${defaultPassword}</span></p>
        </div>

        <div style="background-color: #fff5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0;">🔐 <strong>Important:</strong> Please change the password during the first login for security purposes.</p>
        </div>

        <p style="color: #4a5568;">Next steps for you:</p>
        <ul style="color: #4a5568;">
            <li>Log in to the student portal using the credentials above</li>
            <li>Update the password</li>
            <li>Complete any pending student information</li>
            <li>Review the student handbook and our policies</li>
            <li>Check the schedule for upcoming sessions</li>
        </ul>

        <p style="color: #4a5568;">We're excited to begin this journey with ${student.firstName} and look forward to contributing to their growth and development. Our educators are dedicated to providing personalized support and guidance.</p>

        <p style="color: #4a5568;">If you have any questions or need assistance with the portal, please reach out to our support team at <strong>support@ishanyafoundation.org</strong> or call us at <strong>+91 73496 76668</strong>.</p>

        <div style="margin-top: 30px; text-align: center; color: #718096;">
            <p style="margin: 5px 0;">Warm regards,</p>
            <p style="margin: 5px 0;"><strong>Ishanya Foundation Team</strong></p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <div style="background-color: #ebf8ff; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <p style="color: #2c5282; margin: 0;">📅 <strong>Important:</strong> Please mark your calendar for the orientation session and first day details sent in a separate communication.</p>
        </div>
        
        <p style="color: #718096; font-size: 12px; text-align: center;">
            This is an automated message. Please do not reply to this email.
        </p>
    </div>
</body>
</html>
`;

export const jobApplicationConfirmation = (application) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c5282; text-align: center; border-bottom: 2px solid #2c5282; padding-bottom: 10px;">
            🎉 Job Application Received - Ishanya Foundation
        </h2>
        
        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">Dear <strong>${application.firstName} ${application.lastName}</strong>,</p>
            <p style="margin: 10px 0 0 0;">Thank you for applying to join our team! We've received your application for <strong>${application.employmentType} Position</strong>.</p>
        </div>

        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #48bb78; margin: 20px 0;">
            <h3 style="color: #2c5282; margin-top: 0;">Application Details</h3>
            <p style="margin: 5px 0;">📄 Application ID: <strong>${application.jobId}</strong></p>
            <p style="margin: 5px 0;">📅 Submission Date: ${application.createdAt.toDateString()}</p>
            <p style="margin: 5px 0;">📧 Contact Email: ${application.email}</p>
            <p style="margin: 5px 0;">📱 Phone: ${application.phoneNumber}</p>
        </div>

        <div style="background-color: #fff5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0;">🔍 <strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0 0 20px;">
                <li>Our HR team will review your application</li>
                <li>Shortlisted candidates will be contacted within 7-10 working days</li>
                <li>Please check your email regularly for updates</li>
            </ul>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #718096;">
            <p style="margin: 5px 0;">Need to update your application?</p>
            <p style="margin: 5px 0;">📞 Contact HR: +91 73496 76668</p>
            <p style="margin: 5px 0;">📧 Email: careers@ishanyafoundation.org</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="color: #718096; font-size: 12px; text-align: center;">
            This is an automated confirmation. Please do not reply to this email.<br>
            Ishanya Foundation | [Foundation Address] | [Website URL]
        </p>
    </div>
</body>
</html>
`;

export const appointmentRequestConfirmation = (appointment) => `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c5282; text-align: center; border-bottom: 2px solid #2c5282; padding-bottom: 10px;">
            📅 Appointment Request Received
        </h2>
        
        <div style="background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;">Dear ${appointment.parentName},</p>
            <p style="margin: 10px 0 0 0;">Thank you for requesting an appointment for <strong>${appointment.studentName}</strong>.</p>
        </div>

        <div style="background-color: #f7fafc; padding: 15px; border-left: 4px solid #48bb78; margin: 20px 0;">
            <h3 style="color: #2c5282; margin-top: 0;">Request Details</h3>
            <p style="margin: 5px 0;">👨🎓 Student: <strong>${appointment.studentName}</strong></p>
            <p style="margin: 5px 0;">📅 Preferred Date: ${appointment.date.toDateString()}</p>
            <p style="margin: 5px 0;">⏰ Preferred Time: ${String(appointment.time.hr).padStart(2, '0')}:${String(appointment.time.min).padStart(2, '0')}</p>
            <p style="margin: 5px 0;">📧 Contact Email: ${appointment.email}</p>
            <p style="margin: 5px 0;">📱 Phone: ${appointment.phone}</p>
        </div>

        <div style="background-color: #fff5f5; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #c53030; margin: 0;">ℹ️ <strong>Next Steps:</strong></p>
            <ul style="margin: 10px 0 0 20px;">
                <li>Our team will review your request</li>
                <li>You'll receive confirmation within 24-48 working hours</li>
                <li>Please check your email/SMS for updates</li>
            </ul>
        </div>

        <div style="margin-top: 30px; text-align: center; color: #718096;">
            <p style="margin: 5px 0;">Need to modify your request?</p>
            <p style="margin: 5px 0;">📞 Contact: +91 73496 76668</p>
            <p style="margin: 5px 0;">📧 Email: admissions@ishanyafoundation.org</p>
        </div>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        
        <p style="color: #718096; font-size: 12px; text-align: center;">
            This is an automated confirmation. Please do not reply to this email.<br>
            Ishanya Foundation | [Foundation Address] | [Website URL]
        </p>
    </div>
</body>
</html>
`; 