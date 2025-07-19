// ===========================
// === AI Chat Service for NutriGuardian
// ===========================

/**
 * Create a system instruction for the NutriGuardian AI chatbot
 * @returns {string}
 */
const createNutriGuardianSystemInstruction = () => {
  return (
    "Bạn là một trợ lý AI chuyên về dinh dưỡng và sức khỏe của ứng dụng NutriGuardian. " +
    "Bạn chỉ trả lời bằng **tiếng Việt**, giọng điệu thân thiện, chuyên nghiệp và dễ hiểu. " +
    "Chuyên môn của bạn bao gồm: " +
    "- Tư vấn dinh dưỡng và chế độ ăn uống lành mạnh " +
    "- Hướng dẫn về dị ứng thực phẩm và cách phòng tránh " +
    "- Gợi ý công thức nấu ăn phù hợp với tình trạng sức khỏe " +
    "- Thông tin về giá trị dinh dưỡng của thực phẩm " +
    "- Lời khuyên về lối sống lành mạnh và tập luyện " +
    "Nếu người dùng hỏi về chủ đề không liên quan đến dinh dưỡng, sức khỏe hoặc thực phẩm, " +
    "bạn hãy lịch sự chuyển hướng cuộc trò chuyện về chuyên môn của mình. " +
    "Khi cần thiết, hãy trình bày thông tin dạng gạch đầu dòng để dễ đọc. " +
    "Luôn nhắc nhở người dùng tham khảo ý kiến bác sĩ chuyên khoa khi cần thiết."
  );
};

/**
 * Generate an answer from AI about nutrition and health
 * @param {string} message - User's message
 * @returns {Promise<string>} - AI response
 */
export const generateNutritionAnswerFromAI = async (message: string): Promise<string> => {
  try {
    const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: message,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3,
        topP: 0.9,
        topK: 1,
      },
      safetySettings: [
        { 
          category: "HARM_CATEGORY_HARASSMENT", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE" 
        },
        { 
          category: "HARM_CATEGORY_HATE_SPEECH", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE" 
        },
        { 
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE" 
        },
        { 
          category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
          threshold: "BLOCK_MEDIUM_AND_ABOVE" 
        },
      ],
      systemInstruction: {
        parts: [
          {
            text: createNutriGuardianSystemInstruction(),
          },
        ],
      },
    };

    console.log('Request URL:', geminiUrl);
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(geminiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      console.error('Invalid response structure:', data);
      throw new Error('Không nhận được phản hồi hợp lệ từ AI');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('400')) {
        return 'Xin lỗi, có vấn đề với yêu cầu. Vui lòng thử rút gọn câu hỏi hoặc thử lại sau.';
      } else if (error.message.includes('401')) {
        return 'Xin lỗi, có vấn đề với xác thực API. Vui lòng liên hệ quản trị viên.';
      } else if (error.message.includes('429')) {
        return 'Bạn đã gửi quá nhiều yêu cầu. Vui lòng đợi một chút rồi thử lại.';
      }
    }
    
    return 'Xin lỗi, tôi đang gặp một chút vấn đề kỹ thuật. Vui lòng thử lại sau ít phút. Trong thời gian chờ đợi, bạn có thể tham khảo thông tin dinh dưỡng trong phần "Tìm hiểu" của ứng dụng.';
  }
};

/**
 * Generate specific advice for food allergies
 * @param {string[]} allergens - List of user's allergens
 * @param {string} question - User's specific question
 * @returns {Promise<string>} - AI response with allergy-specific advice
 */
export const generateAllergyAdvice = async (allergens: string[], question: string): Promise<string> => {
  const allergenList = allergens.join(', ');
  const contextMessage = `
    Người dùng bị dị ứng với: ${allergenList}
    Câu hỏi: ${question}
    
    Vui lòng đưa ra lời khuyên cụ thể về chế độ ăn uống an toàn và thực phẩm thay thế phù hợp.
  `;
  
  return generateNutritionAnswerFromAI(contextMessage);
};

/**
 * Get recipe suggestions based on dietary restrictions
 * @param {string} preferences - User's dietary preferences or restrictions
 * @returns {Promise<string>} - AI response with recipe suggestions
 */
export const getRecipeSuggestions = async (preferences: string): Promise<string> => {
  const message = `
    Tôi cần gợi ý công thức nấu ăn với yêu cầu sau: ${preferences}
    
    Vui lòng đưa ra 2-3 công thức đơn giản, bao gồm nguyên liệu và cách làm cơ bản.
  `;
  
  return generateNutritionAnswerFromAI(message);
};

/**
 * Test function to check if Gemini API is working
 * @returns {Promise<boolean>} - True if API is working
 */
export const testGeminiAPI = async (): Promise<boolean> => {
  try {
    const testResponse = await generateNutritionAnswerFromAI("Xin chào");
    return testResponse.length > 0 && !testResponse.includes('vấn đề kỹ thuật');
  } catch (error) {
    console.error('API Test failed:', error);
    return false;
  }
};

/**
 * Fallback nutrition advice when AI is not available
 * @param {string} message - User's message
 * @returns {string} - Fallback response
 */
export const getFallbackNutritionAdvice = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('dị ứng') || lowerMessage.includes('allergy')) {
    return `**Về vấn đề dị ứng thực phẩm:**
    
*   **Đọc kỹ nhãn thành phần:** Luôn kiểm tra danh sách thành phần trước khi ăn
*   **Tránh phản ứng chéo:** Một số thực phẩm có thể gây dị ứng chéo
*   **Mang thuốc dự phòng:** Luôn có sẵn thuốc chống dị ứng khi cần
*   **Tham khảo chuyên gia:** Bác sĩ chuyên khoa sẽ tư vấn chế độ ăn phù hợp

**Quan trọng:** Đây chỉ là thông tin tham khảo, vui lòng tham khảo ý kiến bác sĩ chuyên khoa.`;
  }
  
  if (lowerMessage.includes('giảm cân') || lowerMessage.includes('weight loss')) {
    return `**Về giảm cân lành mạnh:**
    
*   **Deficit calo hợp lý:** Tạo thiếu hụt 300-500 calo/ngày
*   **Đủ protein:** Duy trì cơ bắp trong quá trình giảm cân
*   **Tăng rau xanh:** Giảm carb tinh chế, tăng chất xơ
*   **Uống đủ nước:** 2-3 lít nước mỗi ngày
*   **Tập luyện đa dạng:** Kết hợp cardio và tập tạ

**Lưu ý:** Tham khảo chuyên gia dinh dưỡng để có kế hoạch cá nhân hóa.`;
  }
  
  if (lowerMessage.includes('công thức') || lowerMessage.includes('nấu ăn')) {
    return `**Gợi ý công thức nấu ăn dinh dưỡng:**

*   **Salad quinoa:** Quinoa + rau xanh + protein + dressing olive oil
*   **Soup rau củ:** Cà rót + bí đỏ + cà rốt + nước dùng xương
*   **Gà nướng thảo mộc:** Ức gà + rosemary + thyme + khoai lang nướng

**Nguyên tắc nấu ăn lành mạnh:**
*   Ít dầu mỡ, nhiều rau xanh
*   Hạn chế muối và đường
*   Ưu tiên thực phẩm tự nhiên`;
  }
  
  return `**Cảm ơn bạn đã liên hệ với NutriGuardian!** 
  
Hiện tại hệ thống AI đang bảo trì. **Bạn có thể:**

*   **Phần "Tìm hiểu":** Tham khảo thông tin dinh dưỡng chi tiết
*   **Theo dõi thực phẩm:** Sử dụng tính năng tracking
*   **Thử lại sau:** Hệ thống sẽ hoạt động trở lại sớm

🔄 **Chúng tôi đang khắc phục sự cố để mang đến trải nghiệm tốt nhất!**`;
};
