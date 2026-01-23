const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialize the mail transporter with Ethereal Email (for development)
 */
const initMailService = async () => {
    try {
        // Create a test account on Ethereal
        const testAccount = await nodemailer.createTestAccount();

        // Create a reusable transporter object using the default SMTP transport
        transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        console.log('Mail Service Initialized');
        console.log('Ethereal Email Credentials:');
        console.log(`User: ${testAccount.user}`);
        console.log(`Pass: ${testAccount.pass}`);
    } catch (error) {
        console.error('Failed to initialize Mail Service:', error);
    }
};

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} html - Email body in HTML format
 */
const sendEmail = async (to, subject, html) => {
    if (!transporter) {
        console.error('Mail transporter is not initialized. Call initMailService() first.');
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Personal Organizer" <no-reply@organizer.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });

        console.log(`Message sent: ${info.messageId}`);
        // Preview only available when sending through an Ethereal account
        console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

module.exports = {
    initMailService,
    sendEmail,
};
