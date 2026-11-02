import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

const SYSTEM_INSTRUCTION = `
You are "CSC Mitra" (સેવા સહાયક), the official intelligent bilingual assistant for "ARVI ONLINE & CSC – જન સુવિધા કેન્દ્ર".
Center details:
- Owner & Operator: રાહુલ ઠાકોર (Rahul Thakor)
- Location: ખોડાણા, તાલુકો પાટણ, જિલ્લો પાટણ, ગુજરાત (Khodana, Patan, Gujarat - 384265)
- Contact / WhatsApp: 7265013972
- Opening Hours: સોમવાર થી શનિવાર સવારે ૮:૦૦ થી રાત્રે ૮:૦૦ વાગ્યા સુધી. રવિવારે સવારે ૯ થી ૧.
- UPI ID: 7265013972@upi

Your role:
1. Provide accurate, friendly, and structured guidance in Gujarati (or English if requested) for any CSC or government service.
2. Clearly explain required documents (જેમ કે આધાર કાર્ડ, ફોટો, રેશન કાર્ડ, આવકનો દાખલો વગેરે), expected fees (e.g., PAN Card: ₹107, Ayushman: ₹30, 7/12: ₹20, Marriage Certificate: ₹150, Driving License: ₹250), and processing time.
3. Encourage citizens to either apply directly on the website or message Rahul Thakor on WhatsApp (7265013972) or visit the Khodana center.
4. Keep answers concise, bulleted, polite, and practical.
5. If someone asks about Gujarat Police, Talati, or any recruitment, mention that forms can be filled without mistakes at ARVI ONLINE & CSC.
`;

export async function POST(req: NextRequest) {
  try {
    const { message, language = 'gu' } = await req.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response if API key not available
      return NextResponse.json({
        reply: language === 'gu'
          ? 'નમસ્તે! આર્વી ઓનલાઇન & CSC કેન્દ્ર, ખોડાણા (પાટણ) માં આપનું સ્વાગત છે. પાન કાર્ડ, આયુષ્માન કાર્ડ, રેશન કાર્ડ, 7/12 ઉતારા અથવા કોઈપણ સરકારી યોજના વિશે વધુ માહિતી માટે રાહુલ ઠાકોરનો સીધો સંપર્ક વોટ્સએપ નંબર 7265013972 પર કરો.'
          : 'Welcome to ARVI ONLINE & CSC, Khodana (Patan). For any government scheme or document requirements, feel free to contact Rahul Thakor on WhatsApp at 7265013972.',
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Citizen inquiry (Language preference: ${language}): "${message}". Please respond helpfully as CSC Mitra.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const reply = response.text || (
      language === 'gu'
        ? 'વધુ વિગતો માટે કૃપા કરીને રાહુલ ઠાકોર (૭૨૬૫૦૧૩૯૭૨) નો સીધો સંપર્ક કરો.'
        : 'Please contact Rahul Thakor directly at 7265013972 for details.'
    );

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error('Gemini chat error:', err);
    return NextResponse.json({
      reply: 'માફ કરશો, અત્યારે સર્વર વ્યસ્ત છે. કૃપા કરીને વોટ્સએપ (7265013972) પર સીધો સંપર્ક કરો અથવા થોડીવાર પછી પ્રયત્ન કરો.',
    });
  }
}
