
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';


async function sendMail(emailData) {
    try {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "aisymdes@gmail.com",
                pass: "ftxtonffuqwehszw"
            }
        });

        // Read email template from file
        const emailTemplatePath = path.join(process.cwd(), 'doc.html');
        const emailTemplate = fs.readFileSync(emailTemplatePath, 'utf-8');

        // Replace placeholders in email template with actual data
        const compiledEmailTemplate = emailTemplate.replace(/{{\s*(\w+)\s*}}/g, (match, key) => {
            return emailData[key] || match;
        });

        // Define the email content
        const mailDetails = {
            from: 'R-JD < logeshtv21@gmail.com >',
            to: emailData.email, // Recipient's email address
            subject: 'YOU ARE SHORTLISTED',
            text: 'Shorlisted for next round.',
            html: compiledEmailTemplate,
        };

        // Send the email
        const info = await mailTransporter.sendMail(mailDetails);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

export default async (req, res) => {
    const { files, excelFile } = req.body;

    const results = [];

    files.forEach(({ id, score }) => {
        const row = excelFile.find(excelItem => String(excelItem.id) === String(id));
        if (row) {
            const emailData = {
                id: row.id,
                score: score,
                email: row.email,
                name: row.name
            };
            // Send email for each matching entry
            sendMail(emailData).catch(err => console.error('Error sending mail:', err));
            results.push(emailData); // Push data to results array for response
        }
    });

    return res.status(200).json({message:"mail sent"});
};
