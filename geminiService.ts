
import { GoogleGenAI, Chat } from "@google/genai";
import { Lesson, Grade } from "./types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createLearningChat = (grade: Grade, lesson: Lesson): Chat => {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `Bạn là một trợ lý giáo dục chuyên nghiệp về môn Tin học lớp ${grade} tại Việt Nam. 
      Nhiệm vụ của bạn là giải thích các khái niệm trong bài "${lesson.title}" một cách dễ hiểu, chính xác theo chương trình SGK. 
      Bài học có các nội dung chính: ${lesson.keyPoints.join(', ')}. 
      Hãy trả lời bằng tiếng Việt, ngắn gọn, súc tích và có ví dụ minh họa cụ thể.`,
    },
  });
};

export const sendMessageToGemini = async (chat: Chat, message: string) => {
  const result = await chat.sendMessage({ message });
  // The .text property directly returns the generated string
  return result.text;
};
