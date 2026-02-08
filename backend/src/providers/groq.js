/**
 * @file groq.js
 * @description Integration with Groq
 */

const Groq = require("groq-sdk");
const BaseProvider = require("./base");

class GroqProvider extends BaseProvider {
    constructor() {
        super();
        this.groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        this.modelName = "llama-3.3-70b-versatile";
    }
    async generateResponse(prompt, imageBuffer, mimeType) {
        try {
            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
                model: this.modelName,
            });
            return completion.choices[0]?.message?.content || "";

        } catch (error) {
            console.error("Groq API Error:", error);
            throw new Error("Failed to get response from Groq");
        }
    }
}

module.exports = GroqProvider;