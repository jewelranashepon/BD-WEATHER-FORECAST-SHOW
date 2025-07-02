// import Welcome from "@/emails/Welcome";
// import { Resend } from "resend";
// import { NextResponse } from "next/server";

// const resend = new Resend(process.env.RESEND_API_KEY);

// export async function POST() {
//   try {
//     const data = await resend.emails.send({
//       from: 'onboarding@resend.dev',
//       to: 'birdsofeden.av@gmail.com ',
//       subject: 'OTP For Sign In',
//       react: Welcome(),
//     });

//     return NextResponse.json({ success: true, data });
//   } catch  {
//     return NextResponse.json({ success: false, error: 'OTP Failed' }, { status: 500 });
//   }
// }
