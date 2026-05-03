import { prisma } from '../../../lib/prisma.js'; // Adjust path
import AppError from '../../error/AppError.js';
import { GoogleGenAI } from '@google/genai';
import { envVars } from '../../config/env.js'; // Adjust path

// 1. Initialize Gemini
const ai = new GoogleGenAI({ apiKey: envVars.GEMINI_API_KEY as string });

// Date Helpers
const getCurrentMondayUTC = () => {
    const d = new Date();
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff, 0, 0, 0, 0));
};

const getTodayUTC = () => {
    const d = new Date();
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

 const generateDigest = async (
    projectId: string, 
    type: 'DAILY' | 'WEEKLY_RETRO'
) => {
    // 2. Set the target date based on the requested type
    const targetDate = type === 'DAILY' ? getTodayUTC() : getCurrentMondayUTC();
    const weekStart = getCurrentMondayUTC(); // Goals are always bound to the week

    // 3. Check for an existing cached digest
    const existingDigest = await prisma.aiDigest.findFirst({
        where: { projectId, digestDate: targetDate, type }
    });

    if (existingDigest) {
        return existingDigest; 
    }

    // 4. Fetch the data 
    const goals = await prisma.goal.findMany({
        where: { projectId, weekStart },
        include: { user: { select: { name: true } } }
    });

    const standups = await prisma.standup.findMany({
        where: { 
            projectId, 
            createdAt: { gte: targetDate } // If DAILY, only today's standups. If WEEKLY, the whole week.
        },
        include: { user: { select: { name: true } } }
    });

    if (standups.length === 0 && goals.length === 0) {
        throw new AppError(400, `Not enough data to generate a ${type} digest.`);
    }

    // 5. Format the prompt data
    let promptData = `Project Data for ${targetDate.toISOString().split('T')[0]}:\n\n`;
    promptData += `--- CURRENT WEEKLY GOALS ---\n`;
    goals.forEach(g => {
        promptData += `- ${g.user.name}: "${g.title}" (Progress: ${g.progress}%, Status: ${g.status})\n`;
    });

    promptData += `\n--- SUBMITTED STANDUPS ---\n`;
    standups.forEach(s => {
        promptData += `- ${s.user.name}: Did: "${s.yesterday}", Doing: "${s.today}", Blocker: "${s.blocker || 'None'}"\n`;
    });

    // 6. Dynamic System Instructions
    const reportName = type === 'DAILY' ? "Daily Morning Briefing" : "Weekly Retrospective";
    const systemInstruction = `You are an expert Agile Scrum Master. Analyze the provided goals and standups.
    Write a concise, professional ${reportName}.
    Format in Markdown:
    1. 🚀 Executive Summary (1 sentence overview)
    2. ⚠️ Blockers (Highlight anyone stuck right now)
    3. ✅ Progress (Brief summary of momentum)
    4. 💡 Recommendation (One actionable tip for the team lead)`;

    // 7. Call Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptData,
        config: { systemInstruction, temperature: 0.3 }
    });

    const aiReport = response.text;

    if (!aiReport) {
        throw new AppError(500, "Failed to generate AI content");
    }

    // 8. Save to DB using your exact Schema
    const newDigest = await prisma.aiDigest.create({
        data: {
            projectId,
            digestDate: targetDate,
            type,
            content: aiReport
        }
    });

    return newDigest;
};

export const aiDigestService = {
    generateDigest
}