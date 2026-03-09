import * as React from 'react';
import { Html, Body, Head, Heading, Hr, Container, Preview, Section, Text, Tailwind } from '@react-email/components';

export interface LeadNotificationEmailProps {
    name: string;
    email: string;
    phone?: string;
    inquiryType?: string;
    message?: string;
}

export const LeadNotificationEmail = ({
    name,
    email,
    phone,
    inquiryType,
    message,
}: LeadNotificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>New Lead Submission from {name}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans">
                    <Container className="mx-auto py-5 pb-12 w-full max-w-[580px]">
                        <Heading className="text-2xl font-bold mt-8 mb-5 p-0">
                            New Lead Form Submission
                        </Heading>
                        <Text className="text-base leading-6 text-gray-700">
                            You have a new inquiry from the website.
                        </Text>
                        <Hr className="border border-solid border-[#eaeaea] my-6 mx-0 w-full" />

                        <Section>
                            <Text className="text-base leading-6 text-gray-800 font-bold mb-1">Contact Details:</Text>
                            <Text className="text-sm leading-6 text-gray-600 mb-0 mt-0">
                                <strong>Name:</strong> {name}
                            </Text>
                            <Text className="text-sm leading-6 text-gray-600 mb-0 mt-0">
                                <strong>Email:</strong> {email}
                            </Text>
                            {phone && (
                                <Text className="text-sm leading-6 text-gray-600 mb-0 mt-0">
                                    <strong>Phone:</strong> {phone}
                                </Text>
                            )}
                            {inquiryType && (
                                <Text className="text-sm leading-6 text-gray-600 mb-0 mt-0">
                                    <strong>Inquiry Type:</strong> {inquiryType}
                                </Text>
                            )}
                        </Section>

                        {message && (
                            <>
                                <Hr className="border border-solid border-[#eaeaea] my-6 mx-0 w-full" />
                                <Section>
                                    <Text className="text-base leading-6 text-gray-800 font-bold mb-1">Message:</Text>
                                    <Text className="text-sm leading-6 text-gray-600 break-words mt-0">
                                        {message}
                                    </Text>
                                </Section>
                            </>
                        )}

                        <Hr className="border border-solid border-[#eaeaea] my-6 mx-0 w-full" />
                        <Text className="text-xs text-[#666666] leading-6">
                            This is an automated notification from the Kate Monroe CEO lead capture system deployed by ApexRex.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default LeadNotificationEmail;
