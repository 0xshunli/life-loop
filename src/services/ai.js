const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'https://api.deepseek.com'
const DEFAULT_API_KEY = import.meta.env.VITE_API_KEY || ''
const DEFAULT_MODEL = import.meta.env.VITE_MODEL || 'deepseek-chat'

class AIService {
  constructor() {
    const cachedUrl = localStorage.getItem('ai_api_url')
    if (cachedUrl) {
      try {
        if (!DEFAULT_API_URL.includes(new URL(cachedUrl).hostname)) {
          localStorage.removeItem('ai_api_url')
          localStorage.removeItem('ai_api_key')
          localStorage.removeItem('ai_model')
        }
      } catch { /* ignore invalid URL */ }
    }
    this.apiUrl = localStorage.getItem('ai_api_url') || DEFAULT_API_URL
    this.apiKey = localStorage.getItem('ai_api_key') || DEFAULT_API_KEY
    this.model = localStorage.getItem('ai_model') || DEFAULT_MODEL
  }

  updateConfig({ apiUrl, apiKey, model }) {
    if (apiUrl) { this.apiUrl = apiUrl; localStorage.setItem('ai_api_url', apiUrl) }
    if (apiKey) { this.apiKey = apiKey; localStorage.setItem('ai_api_key', apiKey) }
    if (model) { this.model = model; localStorage.setItem('ai_model', model) }
  }

  get isReasoner() { return this.model.includes('reasoner') }
  get isOpenAI() { return this.apiUrl.includes('openai.com') }

  /** 构建请求体（共用逻辑） */
  _buildBody(messages, options = {}) {
    const body = { model: this.model, messages }
    if (!this.isReasoner) {
      body.temperature = options.temperature ?? 0.85
      body.top_p = options.top_p ?? 0.9
      if (options.response_format) body.response_format = options.response_format
    }
    if (this.isOpenAI) {
      body.max_completion_tokens = options.max_tokens ?? 2048
    } else {
      body.max_tokens = options.max_tokens ?? 2048
    }
    return body
  }

  /** 解析 JSON（支持多种格式） */
  _parseJSON(text) {
    try { return JSON.parse(text) } catch {}
    const mdMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (mdMatch) try { return JSON.parse(mdMatch[1].trim()) } catch {}
    const braceMatch = text.match(/\{[\s\S]*\}/)
    if (braceMatch) try { return JSON.parse(braceMatch[0]) } catch {}
    throw new Error('AI 返回格式错误，无法解析为 JSON')
  }

  /** 普通请求 */
  async chat(messages, options = {}) {
    const body = this._buildBody(messages, options)
    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error(`API 错误 (${response.status}): ${await response.text()}`)
    const data = await response.json()
    return data.choices[0].message.content
  }

  /** JSON 请求（非流式） */
  async chatJSON(messages, options = {}) {
    const result = await this.chat(messages, {
      ...options,
      ...(this.isReasoner ? {} : { response_format: { type: 'json_object' } })
    })
    return this._parseJSON(result)
  }

  /**
   * 流式 JSON 请求 — 边接收边回调
   * @param {Array} messages - 消息数组
   * @param {Object} options - 请求选项
   * @param {Function} onChunk - (fullText: string, delta: string) => void
   * @returns {Object} 解析后的 JSON 对象
   */
  async chatStreamJSON(messages, options = {}, onChunk) {
    const body = this._buildBody(messages, {
      ...options,
      ...(this.isReasoner ? {} : { response_format: { type: 'json_object' } })
    })
    body.stream = true

    const response = await fetch(`${this.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify(body)
    })
    if (!response.ok) throw new Error(`API 错误 (${response.status}): ${await response.text()}`)

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    let fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })

      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || !trimmed.startsWith('data:')) continue
        const data = trimmed.slice(5).trim()
        if (data === '[DONE]') continue
        try {
          const json = JSON.parse(data)
          const content = json.choices?.[0]?.delta?.content
          if (content) {
            fullText += content
            if (onChunk) onChunk(fullText, content)
          }
        } catch { /* skip malformed chunks */ }
      }
    }

    return this._parseJSON(fullText)
  }
}

export const aiService = new AIService()
export default aiService
