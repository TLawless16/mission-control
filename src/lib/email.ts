import { Resend } from 'resend';

// Initialize Resend
// In a real environment with SO-0, this should gracefully handle generic/mock keys if the env var isn't set yet.
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

/**
 * Sends a transactional email using Resend.
 * @param {string} to - The recipient's email address
 * @param {string} subject - The subject line
 * @param {React.ReactElement} template - The React Email template component
 */
export async function sendEmail({
    to,
    subject,
    template,
}: {
    to: string;
    subject: string;
    template: React.ReactElement;
}) {
    try {
        const { data, error } = await resend.emails.send({
            from: 'ApexRex <onboarding@resend.dev>', // Use resend.dev for testing until domain is verified
            to: [to],
            subject: subject,
            react: template,
        });

        if (error) {
            console.error('Error sending email via Resend:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Exception in sendEmail utility:', error);
        return { success: false, error };
    }
}
