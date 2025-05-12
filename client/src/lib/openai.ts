import { apiRequest } from "./queryClient";
import { ChatMessage } from "../types";

export async function sendChatMessage(userId: number, message: string): Promise<ChatMessage> {
  try {
    const response = await apiRequest("POST", "/api/chat", {
      userId,
      isBot: false,
      message
    });
    
    const botResponse = await response.json();
    return botResponse;
  } catch (error) {
    console.error("Error sending chat message:", error);
    throw new Error("Failed to process chat message");
  }
}

export async function getChatHistory(userId: number): Promise<ChatMessage[]> {
  try {
    const response = await apiRequest("GET", `/api/chat/${userId}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw new Error("Failed to fetch chat history");
  }
}
