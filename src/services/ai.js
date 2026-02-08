const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://api.deepseek.com'
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || ''
const DEFAULT_MODEL = import.meta.env.VITE_MODEL || 'deepseek-chat'

class AIService {
  constructor() {
    // 如果 localStorage 中缓存的配置与 .env 不一致，自动清除以使用最新的 .env 配置
    const cachedUrl = localStorage.getItem('ai_api_url')
    if (cachedUrl && !DEFAULT_API_URL.includes(new URL(cachedUrl).hostname)) {
      localStorage.removeItem('ai_api_url')
      localStorage.removeItem('ai_api_key')
      localStorage.removeItem('ai_model')
    }

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

  get isReasoner() {
    return this.model.includes('reasoner')
  }

  get isOpenAI() {
    return this.apiUrl.includes('openai.com')
  }

  async chat(messages, options = {}) {
    // 根据模型类型构建不同的请求参数
    const body = {
      model: this.model,
      messages,
    }

    // deepseek-reasoner 不支持 temperature、top_p、response_format
    if (!this.isReasoner) {
      body.temperature = options.temperature ?? 0.85
      body.top_p = options.top_p ?? 0.9
      if (options.response_format) {
        body.response_format = options.response_format
      }
    }

    // OpenAI 新模型使用 max_completion_tokens 代替 max_tokens
    if (this.isOpenAI) {
      body.max_completion_tokens = options.max_tokens ?? 2048
    } else {
      body.max_tokens = options.max_tokens ?? 2048
    }

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API 错误 (${response.status}): ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  }

  async chatJSON(messages, options = {}) {
    // reasoner 模型不支持 JSON mode，在 prompt 中强调返回 JSON
    const result = await this.chat(messages, {
      ...options,
      ...(this.isReasoner ? {} : { response_format: { type: 'json_object' } })
    })

    try {
      return JSON.parse(result)
    } catch (e) {
      // 尝试从 markdown 代码块中提取 JSON
      const match = result.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (match) {
        return JSON.parse(match[1].trim())
      }
      // 尝试找到第一个 { 到最后一个 } 之间的内容
      const braceMatch = result.match(/\{[\s\S]*\}/)
      if (braceMatch) {
        return JSON.parse(braceMatch[0])
      }
      throw new Error('AI 返回格式错误，无法解析为 JSON')
    }
  }
}

export const aiService = new AIService()
export default aiService
