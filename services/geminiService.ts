import { GoogleGenAI, Type } from "@google/genai";
import { Task, Employee } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // A simple alert for demonstration purposes. In a real app, handle this more gracefully.
  console.error("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const suggestAssignee = async (
    task: Task,
    employees: Employee[]
): Promise<{ employeeId: string; reason: string }> => {
    try {
        const employeeList = employees
            .map(e => `- ID: ${e.id}, Name: ${e.name}, Job Title: ${e.jobTitle}`)
            .join('\n');

        const prompt = `
        You are an expert project manager responsible for assigning tasks.
        Based on the following task details and the list of available employees with their job titles, please recommend the best employee to assign this task to.

        Task Title: "${task.title}"
        Task Description: "${task.description}"

        Available Employees:
        ${employeeList}

        Provide your recommendation in the specified JSON format. Your response should include the ID of the recommended employee and a brief justification for your choice, highlighting why their job title makes them a good match for the task.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        employeeId: {
                            type: Type.STRING,
                            description: 'The ID of the recommended employee.',
                        },
                        reason: {
                            type: Type.STRING,
                            description: 'A short reason for recommending this employee.',
                        },
                    },
                    required: ['employeeId', 'reason'],
                },
            },
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        
        if (employees.some(e => e.id === result.employeeId)) {
            return result;
        } else {
            console.error("Gemini suggested an invalid employee ID:", result.employeeId);
            throw new Error("AI returned an invalid employee suggestion. Please try again or assign manually.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error && error.message.includes('invalid employee')) {
            throw error;
        }
        throw new Error("Failed to get AI suggestion. Please check your connection or API key and try again.");
    }
};