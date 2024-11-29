export const aiRequest = async (prompt, username, onChunk) => {
  try {
    const response = await uniFetch({
      url: '/ai/generate-plan',
      method: 'POST',
      data: {
        prompt,
        username
      },
      // 启用分块传输
      enableChunked: true,
      responseType: 'text'
    });

    // 处理流式响应
    if (response.data) {
      const lines = response.data.split('\n');
      
      // 模拟流式输出
      for (const line of lines) {
        if (line.trim() === '[DONE]') {
          break;
        }
        
        if (line.trim()) {
          try {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              const data = JSON.parse(jsonStr);
              if (data.choices?.[0]?.delta?.content) {
                // 使用 setTimeout 模拟流式效果
                await new Promise(resolve => setTimeout(resolve, 50)); // 每50ms输出一块
                onChunk?.(data.choices[0].delta.content);
              }
            }
          } catch (e) {
            console.warn('解析数据块失败:', e);
          }
        }
      }
    }

    return true;
  } catch (error) {
    console.error('AI请求失败:', error);
    throw error;
  }
}; 