
import { GoogleGenAI, Type } from "@google/genai";
import { AIScanResult } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const scanImageForData = async (base64Image: string): Promise<AIScanResult[]> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            text: `Phân tích hình ảnh bảng tính "Hành trình huy hiệu vàng xu nông trại". 
            - Cột màu vàng đầu tiên là Ngày (Định dạng D/M/YYYY).
            - Các ô tiếp theo trên cùng một hàng là các lượt thu hoạch, mỗi lượt gồm số xu (ví dụ: 925,000 xu) và thời gian (ví dụ: lúc 19h50p).
            - Trả về mảng JSON các đối tượng: { "date": "YYYY-MM-DD", "amount": number, "time": "string" }.
            - Ví dụ: Nếu ngày 1/10/2026 có 3 lượt, hãy tạo 3 đối tượng trong mảng với cùng ngày đó.`
          },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image.split(',')[1]
            }
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              date: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              time: { type: Type.STRING }
            },
            required: ["date", "amount", "time"]
          }
        }
      }
    });

    const jsonStr = response.text?.trim() || "[]";
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Scan Error:", error);
    throw error;
  }
};
