// app/api/send-sms/route.js

import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { phone, message } = await request.json();

        if (!phone || !message) {
            return NextResponse.json(
                { error: "Phone and message are required" },
                { status: 400 }
            );
        }

        const apiKey = process.env.AT_API_KEY;
        const username = process.env.AT_USERNAME || "sandbox";

        if (!apiKey) {
            console.error("SMS Error: AT_API_KEY is not defined in environment variables");
            return NextResponse.json(
                { error: "SMS configuration error" },
                { status: 500 }
            );
        }

        // Africa's Talking messaging endpoints:
        // Sandbox: https://api.sandbox.africastalking.com/version1/messaging
        // Production: https://api.africastalking.com/version1/messaging (Uncomment this for production)
        const url = "https://api.sandbox.africastalking.com/version1/messaging";

        const bodyParams = new URLSearchParams({
            username: username,
            to: phone,
            message: message,
        });

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "apiKey": apiKey,
                "Accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: bodyParams.toString(),
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error("SMS Send failed from AT:", responseData);
            return NextResponse.json(
                { error: responseData.errorMessage || "Failed to send SMS" },
                { status: response.status }
            );
        }

        return NextResponse.json({ success: true, data: responseData });
    } catch (err) {
        console.error("SMS Route Exception:", err);
        return NextResponse.json(
            { error: err.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
