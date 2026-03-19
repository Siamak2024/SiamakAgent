// Sample code to call Azure Function from your HTML/JavaScript
// Replace your direct OpenAI API calls with this

class AzureOpenAIClient {
  constructor(apiEndpoint = '/api/openai-proxy') {
    this.apiEndpoint = apiEndpoint;
  }

  async chat(messages, options = {}) {
    const {
      model = 'gpt-3.5-turbo',
      temperature = 0.7,
      max_tokens = 1000
    } = options;

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages,
          model,
          temperature,
          max_tokens
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      throw error;
    }
  }
}

// Usage in your application:
// const client = new AzureOpenAIClient();
// const response = await client.chat([
//   { role: 'system', content: 'You are a helpful assistant.' },
//   { role: 'user', content: 'Hello!' }
// ]);
// console.log(response.choices[0].message.content);
