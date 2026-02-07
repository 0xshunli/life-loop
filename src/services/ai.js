const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://api.deepseek.com'
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || ''
const DEFAULT_MODEL = import.meta.env.VITE_MODEL || 'deepseek-chat'

class AIService {
  constructor() {
    this.apiUrl = localStorage.getItem('ai_api_url') || DEFAULT_API_URL
    this.apiKey = localStorage.getItem('ai_api_key') || DEFAULT_API_KEY
    this.model = localStorage.getItem('ai_model') || DEFAULT_MODEL
  }

  updateConfig({ apiUrl, apiKey, model }) {
    if (apiUrl) {
      this.apiUrl = apiUrl
      localStorage.setItem('ai_api_url', apiUrl)
    }
    if (apiKey) {
      this.apiKey = apiKey
      localStorage.setItem('ai_api_key', apiKey)
    }
    if (model) {
      this.model = model
      localStorage.setItem('ai_model', model)
    }
  }

  async chat(messages, options = {}) {
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: options.temperature ?? 0.85,
        max_tokens: options.max_tokens ?? 2048,
        top_p: options.top_p ?? 0.9,
        ...(options.response_format ? { response_format: options.response_format } : {})
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API 错误 (${response.status}): ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async chatJSON(messages, options = {}) {
    const result = await this.chat(messages, {
      ...options,
      response_format: { type: 'json_object' }
    })

    try {
      return JSON.parse(result)
    } catch (e) {
      // Try to extract JSON from markdown code blocks
      const match = result.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        return JSON.parse(match[1].trim())
      }
      throw new Error('AI 返回格式错误，无法解析为 JSON')
    }
  }
}

export const aiService = new AIService()
export default aiService
