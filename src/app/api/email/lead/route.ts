import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { LeadNotificationEmail } from '@/emails/lead-notification';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, inquiryType, message } = body;

        if (!name || !email) {
            return NextResponse.json({ error: 'Name and email are required fields.' }, { status: 400 });
        }

        // Default to the agreed-upon destination email (Kryzta)
        // NOTE: This could be dynamic based on a payload target, but per T-006 directives, Kryzta is the primary target for Kate Monroe.
        const destinationEmail = process.env.LEAD_DESTINATION_EMAIL || 'Kryzta@MonroeMedia.com';

        const result = await sendEmail({
            to: destinationEmail,
            subject: `New Lead: ${name} [Action Required]`,
            template: LeadNotificationEmail({ name, email, phone, inquiryType, message }),
        });

        if (!result.success) {
            return NextResponse.json({ error: 'Failed to send lead notification email.', details: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Lead notification sent successfully.' });
    } catch (error: any) {
        console.error('API Route Error /email/lead:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
