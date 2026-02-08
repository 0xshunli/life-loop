import { defineStore } from 'pinia'
import { aiService } from '../services/ai'
import wallet from '../services/wallet'

export const useGameStore = defineStore('game', {
  state: () => ({
    character: { name: '', gender: '', personality: [], backstory: '' },
    attributes: { health: 70, intelligence: 50, charisma: 50, wealth: 30, happiness: 60, social: 40 },
    world: { setting: '', settingLabel: '', description: '' },
    age: 18,
    month: 1,
    totalMonths: 0,
    relationships: [],       // [{ name, relation, affection, personality?, age?, status? }]
    npcBonds: [],            // NPC之间的关系 [{ from, to, type, tension }]
    memories: [],
    recentEvents: [],
    currentNarrative: '',
    currentOptions: [],
    currentMood: '平静',
    timeline: [],
    milestones: [],
    career: '',
    location: '',
    family: { spouse: null, children: [] },  // 家庭系统
    // New: tracking systems
    attributeHistory: [],   // [{ totalMonths, health, intelligence, ... }]
    moodHistory: [],        // [{ totalMonths, mood }]
    lifeStats: {
      totalChoices: 0,
      positiveEvents: 0,
      negativeEvents: 0,
      npcMet: 0,
      highestAttribute: '',
      lowestAttribute: '',
    },
    isPlaying: false,
    isGameOver: false,
    gameOverReason: '',
    isLoading: false,
    settings: { autoSave: true, textSpeed: 25, enableParticles: true, enableTypewriter: true },
  }),

  getters: {
    lifeStage(state) {
      if (state.age < 3) return { key: 'infant', label: '婴儿期', color: 'pink', icon: '👶' }
      if (state.age < 6) return { key: 'toddler', label: '幼儿期', color: 'pink', icon: '💒' }
      if (state.age < 12) return { key: 'child', label: '童年', color: 'sky', icon: '💒' }
      if (state.age < 18) return { key: 'teen', label: '少年期', color: 'blue', icon: '🧑' }
      if (state.age < 30) return { key: 'youth', label: '青年期', color: 'emerald', icon: '💪' }
      if (state.age < 50) return { key: 'prime', label: '壮年期', color: 'amber', icon: '🏆' }
      if (state.age < 65) return { key: 'middle', label: '中年期', color: 'orange', icon: '🍁' }
      return { key: 'elder', label: '老年期', color: 'purple', icon: '🌅' }
    },
    yearMonth(state) { return `${state.age}岁 · ${state.month}月` },
    seasonLabel(state) {
      const m = state.month
      if (m >= 3 && m <= 5) return { name: '春', icon: '🌸', color: '#f9a8d4' }
      if (m >= 6 && m <= 8) return { name: '夏', icon: '☀️', color: '#fbbf24' }
      if (m >= 9 && m <= 11) return { name: '秋', icon: '🍂', color: '#f97316' }
      return { name: '冬', icon: '❄️', color: '#93c5fd' }
    },
    ageAvatar(state) {
      // 优先使用玩家自选头像
      if (state.character.avatar) return state.character.avatar
      // 否则根据性别和年龄自动推断
      const g = state.character.gender, a = state.age
      if (g === '女') {
        if (a < 3) return '👶'; if (a < 10) return '👧'; if (a < 20) return '👩'
        if (a < 35) return '💁‍♀️'; if (a < 50) return '👩‍💼'; if (a < 65) return '👩‍🦰'; return '👵'
      }
      if (a < 3) return '👶'; if (a < 10) return '👦'; if (a < 20) return '👨'
      if (a < 35) return '🙋‍♂️'; if (a < 50) return '👨‍💼'; if (a < 65) return '🧔'; return '👴'
    },
    attributeList(state) {
      return [
        { key: 'health', label: '健康', icon: '❤️', color: '#10b981', value: state.attributes.health },
        { key: 'intelligence', label: '智力', icon: '🧠', color: '#3b82f6', value: state.attributes.intelligence },
        { key: 'charisma', label: '魅力', icon: '✨', color: '#ec4899', value: state.attributes.charisma },
        { key: 'wealth', label: '财富', icon: '💰', color: '#f59e0b', value: state.attributes.wealth },
        { key: 'happiness', label: '幸福', icon: '😊', color: '#8b5cf6', value: state.attributes.happiness },
        { key: 'social', label: '社交', icon: '👥', color: '#f97316', value: state.attributes.social },
      ]
    },
    memoryContext(state) {
      const recent = state.recentEvents.slice(-5).map(e => e.summary).join('\n')
      const important = state.memories.filter(m => m.importance >= 7).slice(-10).map(m => m.summary).join('\n')
      return { recent, important }
    },
    lifeScore(state) {
      const a = state.attributes
      return Math.round((a.health + a.intelligence + a.charisma + a.wealth + a.happiness + a.social) / 6)
    },
    // Sparkline data: last N attribute snapshots for a given key
    sparklineData: (state) => (key, count = 20) => {
      const hist = state.attributeHistory.slice(-count)
      return hist.map(h => h[key] || 0)
    },
    dominantMood(state) {
      if (!state.moodHistory.length) return '平静'
      const freq = {}
      state.moodHistory.forEach(m => { freq[m.mood] = (freq[m.mood] || 0) + 1 })
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
    },
  },

  actions: {
    initGame(character, world) {
      this.character = { ...character }
      this.world = { ...world }
      this.age = character.startAge ?? 0; this.month = 1; this.totalMonths = 0
      // Scale initial attributes by starting age
      const age = this.age
      const r = () => Math.floor(Math.random() * 16 - 8)
      if (age < 6) {
        // Baby/toddler: high health & happiness, low everything else
        this.attributes = { health: 85 + r(), intelligence: 15 + r(), charisma: 30 + r(), wealth: 0, happiness: 80 + r(), social: 10 + r() }
      } else if (age < 18) {
        // Child/teen: growing stats
        this.attributes = { health: 80 + r(), intelligence: 35 + r(), charisma: 40 + r(), wealth: 10 + r(), happiness: 70 + r(), social: 35 + r() }
      } else if (age < 40) {
        // Young adult: balanced
        this.attributes = { health: 70 + r(), intelligence: 50 + r(), charisma: 50 + r(), wealth: 30 + r(), happiness: 60 + r(), social: 45 + r() }
      } else {
        // Middle-aged+: experienced
        this.attributes = { health: 55 + r(), intelligence: 60 + r(), charisma: 55 + r(), wealth: 50 + r(), happiness: 50 + r(), social: 50 + r() }
      }
      // Clamp all to 0-100
      for (const k of Object.keys(this.attributes)) this.attributes[k] = Math.max(0, Math.min(100, this.attributes[k]))
      this.relationships = []; this.npcBonds = []; this.memories = []; this.recentEvents = []
      this.currentNarrative = ''; this.currentOptions = []; this.currentMood = '期待'
      this.timeline = []; this.milestones = []; this.attributeHistory = []; this.moodHistory = []
      this.career = ''; this.location = ''; this.family = { spouse: null, children: [] }
      this.lifeStats = { totalChoices: 0, positiveEvents: 0, negativeEvents: 0, npcMet: 0, highestAttribute: '', lowestAttribute: '' }
      this.isPlaying = true; this.isGameOver = false; this.gameOverReason = ''
      // Record initial snapshot
      this.recordSnapshot()
    },

    recordSnapshot() {
      this.attributeHistory.push({ totalMonths: this.totalMonths, ...this.attributes })
      this.moodHistory.push({ totalMonths: this.totalMonths, mood: this.currentMood })
    },

    updateLifeStats() {
      const a = this.attributes
      const entries = Object.entries(a)
      entries.sort((x, y) => y[1] - x[1])
      this.lifeStats.highestAttribute = entries[0][0]
      this.lifeStats.lowestAttribute = entries[entries.length - 1][0]
    },

    applyAttributeChanges(changes) {
      for (const [key, delta] of Object.entries(changes)) {
        if (this.attributes[key] !== undefined) {
          this.attributes[key] = Math.max(0, Math.min(100, this.attributes[key] + delta))
        }
      }
      if (this.attributes.health <= 0) { this.isGameOver = true; this.gameOverReason = '健康值归零，生命走到了尽头……' }
      if (this.age >= 100) { this.isGameOver = true; this.gameOverReason = '走过了漫长的一生，安详地闭上了眼睛……' }
    },

    advanceTime(aiTimeSkip, ageAfter) {
      let monthsToAdd

      // 优先级1：AI 指定了目标年龄 age_after
      if (ageAfter != null && typeof ageAfter === 'number' && ageAfter > this.age) {
        // 直接跳到目标年龄（计算需要推进多少个月）
        const yearDiff = ageAfter - this.age
        monthsToAdd = yearDiff * 12 - this.month + 1  // 跳到目标年龄的1月
        if (monthsToAdd < 1) monthsToAdd = 12 * yearDiff
        monthsToAdd = Math.min(monthsToAdd, 1200) // 上限100年
      }
      // 优先级2：AI 指定了 time_skip 月数
      else if (aiTimeSkip && aiTimeSkip > 1) {
        monthsToAdd = Math.min(Math.round(aiTimeSkip), 120)
      }
      // 优先级3：默认按年龄段推进
      else {
        monthsToAdd = 1
        if (this.age < 3) monthsToAdd = 6
        else if (this.age < 6) monthsToAdd = 4
        else if (this.age < 12) monthsToAdd = 3
        else if (this.age < 18) monthsToAdd = 2
      }

      for (let i = 0; i < monthsToAdd; i++) {
        this.month++; this.totalMonths++
        if (this.month > 12) { this.month = 1; this.age++ }
      }
    },

    // 从玩家输入中智能识别年龄跳跃意图
    parseAgeFromInput(input, currentAge) {
      if (!input) return null
      // 模式1："我X岁了" "到X岁" "X岁的时候" "快进到X岁"
      const ageMatch = input.match(/(?:我|到|快进到|跳到|已经|现在)?(\d{1,3})岁/)
      if (ageMatch) {
        const target = parseInt(ageMatch[1])
        if (target > currentAge && target <= 120) return target
      }
      // 模式2："X年后" "过了X年"
      const yearsLater = input.match(/(\d{1,3})年(?:后|之后|以后)/)
      if (yearsLater) {
        const y = parseInt(yearsLater[1])
        if (y > 0 && y <= 100) return currentAge + y
      }
      // 模式3：关键词推断
      const kwMap = [
        [/读完大学|大学毕业|毕业了/, 22],
        [/读完高中|高中毕业/, 18],
        [/读完初中|初中毕业/, 15],
        [/读完小学|小学毕业/, 12],
        [/长大成人|成年/, 18],
        [/退休/, 60],
        [/上小学/, 6],
        [/上初中/, 12],
        [/上高中/, 15],
        [/上大学|考上大学/, 18],
      ]
      for (const [re, targetAge] of kwMap) {
        if (re.test(input) && targetAge > currentAge) return targetAge
      }
      return null
    },

    // 基因系统：根据父母属性生成子女天赋
    generateChildAttributes() {
      const a = this.attributes
      // 子女继承父母属性的40-60%加随机变异
      const inherit = (key) => {
        const parentVal = a[key] || 50
        const base = parentVal * (0.4 + Math.random() * 0.2)
        const mutation = (Math.random() - 0.5) * 30
        return Math.max(10, Math.min(90, Math.round(base + mutation)))
      }
      const potential = {
        health: inherit('health'),
        intelligence: inherit('intelligence'),
        charisma: inherit('charisma'),
        wealth: 0,
        happiness: inherit('happiness'),
        social: inherit('social'),
      }
      // 从父母性格中随机继承1-2个特质
      const parentTraits = this.character.personality || []
      const allTraits = ['勇敢', '谨慎', '善良', '冷酷', '聪明', '天真', '幽默', '严肃', '浪漫', '务实', '叛逆', '温顺']
      const numInherit = Math.min(parentTraits.length, 1 + Math.floor(Math.random() * 2))
      const shuffled = [...parentTraits].sort(() => Math.random() - 0.5)
      const inherited = shuffled.slice(0, numInherit)
      // Add 1 random new trait
      const newTraits = allTraits.filter(t => !inherited.includes(t))
      if (newTraits.length) inherited.push(newTraits[Math.floor(Math.random() * newTraits.length)])
      return { traits: inherited, potential }
    },

    addMemory(event) {
      this.recentEvents.push(event)
      if (this.recentEvents.length > 10) {
        const old = this.recentEvents.shift()
        this.memories.push({ month: old.month, summary: old.summary, importance: old.importance || 5 })
      }
    },

    addTimelineEntry(entry) {
      this.timeline.push({ totalMonths: this.totalMonths, age: this.age, month: this.month, ...entry })
    },

    buildSystemPrompt() {
      return `你是「人生进程」模拟人生游戏的叙事引擎。你要为玩家创造身临其境的人生故事。

## 核心规则
1. 叙事200-500字，要有画面感、对话、内心独白，像文学作品
2. 根据角色性格和当前处境合理推进，不要突兀转折
3. 保持世界观和人物性格一致性
4. 属性每次变化 -15 到 +15，重大事件可更大
5. 根据人生阶段调整叙事风格：
   - 婴幼儿(0-3岁)：以第三人称旁白讲述，从父母视角描写婴儿成长（啼哭、第一次笑、学走路、说第一个字），时间跨度可大些
   - 幼儿(3-6岁)：幼儿园、家庭互动、对世界的好奇探索，简短的童言童语对话
   - 童年(6-12岁)：小学生活、友谊、家庭、梦想萌芽，孩子视角的纯真叙事
   - 少年(12-18岁)：中学、叛逆期、初恋、自我意识觉醒、升学压力
   - 青年(18-30岁)：求学/恋爱/求职/独立、社会认知冲击
   - 壮年(30-50岁)：事业/家庭/子女教育/社会责任/中年危机
   - 中老年(50+)：健康/退休/传承/回忆/人生智慧
6. 制造戏剧张力：伏笔、冲突、温情、意外，让玩家想继续
7. 3个选项要有实质差异，体现不同价值观和风险
8. 适时引入NPC，让关系网自然生长。NPC应有鲜明性格、年龄和职业
9. 对话用「」标注，内心活动用"……"省略号渲染
10. 当发生人生重大转折时（如第一份工作、恋爱、结婚、生子、升职、重大变故等），请在 milestone 字段标记
11. 描述天气、环境、人物外貌和表情，让读者有画面感
12. NPC之间也有关系：朋友可能暗中竞争，同事可能是情侣，家人之间可能有矛盾——在npc_bonds字段描述
13. 当角色结婚生子时，在family_event字段返回家庭事件
14. **时间跳跃**：根据玩家行动的语义决定time_skip月数。例如"读完大学"→48,"过完这个学期"→6,"出差一周"→1,"十年后"→120。叙事中要体现时间的流逝感

## 叙事风格
- 运用五感描写（视觉、听觉、嗅觉、触觉、味觉）
- 细节决定质量：天气、表情、小动作、环境氛围
- 适当留白，让玩家有想象空间
- 每个月的故事应有起承转合的小结构
- NPC对话要有个性化的语气和措辞

你必须严格以JSON格式回复，不要在JSON外面添加任何其他内容。`
    },

    buildTurnPrompt(playerAction, recentMemory, importantMemory) {
      const relInfo = this.relationships.length > 0
        ? this.relationships.map(r => {
            const extras = []
            if (r.personality) extras.push(`性格:${r.personality}`)
            if (r.age) extras.push(`${r.age}岁`)
            if (r.status) extras.push(r.status)
            return `${r.name}(${r.relation}, 好感度:${r.affection || 50}${extras.length ? ', ' + extras.join(', ') : ''})`
          }).join('、')
        : '暂无'
      const bondsInfo = this.npcBonds.length > 0
        ? this.npcBonds.map(b => `${b.from}↔${b.to}: ${b.type}${b.tension ? '(张力:' + b.tension + ')' : ''}`).join('、')
        : '暂无'
      const familyInfo = this.family
        ? `配偶: ${this.family.spouse || '无'}, 子女: ${(this.family.children || []).map(c => `${c.name}(${c.age}岁)`).join('、') || '无'}`
        : '暂无家庭'
      const milestoneList = this.milestones.length > 0
        ? this.milestones.map(m => `${m.icon} ${m.title}(${m.age}岁)`).join('、')
        : '暂无'
      const season = this.seasonLabel

      return `## 当前状态
角色：${this.character.name}，${this.character.gender}，${this.age}岁（${this.lifeStage.label}）
性格：${this.character.personality.join('、')}
背景：${this.character.backstory}
世界：${this.world.settingLabel} - ${this.world.description}
季节：${season.name}天 ${season.icon}（${this.month}月）
${this.career ? `职业：${this.career}` : ''}
${this.location ? `所在地：${this.location}` : ''}

## 属性（0-100）
健康:${this.attributes.health} | 智力:${this.attributes.intelligence} | 魅力:${this.attributes.charisma}
财富:${this.attributes.wealth} | 幸福:${this.attributes.happiness} | 社交:${this.attributes.social}

## 当前情绪：${this.currentMood}
## 人际关系：${relInfo}
## NPC之间的关系：${bondsInfo}
## 家庭：${familyInfo}
## 已达成里程碑：${milestoneList}

## 近期经历
${recentMemory || (this.age === 0 ? '一个新生命刚刚来到这个世界，发出了第一声啼哭' : this.age < 6 ? `${this.character.name}是一个${this.age}岁的孩子，世界在TA眼中充满新奇` : this.age < 18 ? `${this.character.name}正处于${this.age}岁的少年时期` : '刚刚开始新的人生旅程')}

## 重要记忆
${importantMemory || '尚无重要记忆'}

## 本回合
${playerAction ? `玩家选择：${playerAction}\n\n⚠️ 时间跳跃指令：仔细分析玩家输入中是否隐含时间跨度。\n如果玩家提到了具体年龄（如"我X岁了""到X岁"），请设置 age_after 为该年龄。\n如果隐含时间跨度（如"读完大学""工作三年""长大成人"），请设置 age_after 为合理的目标年龄。\n当前角色 ${this.age} 岁，age_after 必须 >= ${this.age}。` : '自动推进（age_after设为null）'}

请严格按以下JSON返回（不要添加任何JSON外的文字）：
{
  "title": "本回合标题（2-6字）",
  "narrative": "本回合故事（200-500字，含对话、描写、情感）",
  "narrative_summary": "一句话摘要（15字内）",
  "time_skip": 1,
  "age_after": null,
  "scene_type": "场景类型（work/love/study/adventure/family/health/social/crisis/leisure/milestone）",
  "weather": "天气（晴/阴/雨/雪/风/雾 等，一个字）",
  "options": ["选项1", "选项2", "选项3"],
  "attribute_changes": {"health":0,"intelligence":0,"charisma":0,"wealth":0,"happiness":0,"social":0},
  "new_relationships": [],
  "npc_bonds": [],
  "family_event": null,
  "mood": "情绪（2-4字）",
  "importance": 5,
  "milestone": null,
  "career_update": null,
  "location_update": null
}

new_relationships 格式：{"name":"姓名","relation":"关系","affection":50,"personality":"简短性格","age":25,"status":"当前状态"}
npc_bonds 格式：[{"from":"NPC名","to":"NPC名","type":"关系描述(朋友/暗恋/对手/合作...)","tension":0}]  tension -5到5，正数=融洽，负数=紧张
family_event 格式（仅发生家庭事件时）：{"type":"marry/child/divorce/death","target":"对象名","child_name":"孩子名(生子时)","child_gender":"男/女(生子时)"}
milestone 格式（仅重大事件时填写，否则null）：{"title":"里程碑名","icon":"emoji","description":"一句话描述"}
career_update：如果职业有变化，填新职业字符串，否则null
location_update：如果地点有变化，填新地点，否则null
importance：1-10整数

**【重要】时间跳跃相关字段：**
age_after：本回合故事结束后角色应该是几岁（整数）。这是最重要的时间控制字段！
  - 如果玩家说"我12岁了"或"到12岁"，age_after应该设为12
  - 如果玩家说"读完大学"且当前18岁，age_after应该设为22
  - 如果玩家说"三年后"且当前25岁，age_after应该设为28
  - 如果是普通日常推进，age_after设为null（系统自动推进）
  - age_after不能小于当前年龄
time_skip：备用字段，推进月数（整数）。仅当age_after为null时生效。默认1`
    },

    async playTurn(playerAction = null) {
      this.isLoading = true
      try {
        const { recent, important } = this.memoryContext
        const messages = [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: this.buildTurnPrompt(playerAction, recent, important) }
        ]
        const result = await aiService.chatJSON(messages)

        this.currentNarrative = result.narrative || '这个月平静地度过了……'
        this.currentOptions = result.options || ['继续生活', '做出改变', '随遇而安']
        this.currentMood = result.mood || '平静'

        if (result.attribute_changes) this.applyAttributeChanges(result.attribute_changes)

        if (result.new_relationships && Array.isArray(result.new_relationships)) {
          for (const rel of result.new_relationships) {
            if (!rel.name) continue
            const existing = this.relationships.find(r => r.name === rel.name)
            if (existing) {
              Object.assign(existing, rel)
            } else {
              this.relationships.push({
                name: rel.name,
                relation: rel.relation || '认识的人',
                affection: rel.affection ?? 50,
                personality: rel.personality || '',
                age: rel.age || null,
                status: rel.status || '',
              })
              this.lifeStats.npcMet++
            }
          }
        }

        // NPC bonds (NPC之间的关系)
        if (result.npc_bonds && Array.isArray(result.npc_bonds)) {
          for (const bond of result.npc_bonds) {
            if (!bond.from || !bond.to) continue
            const existing = this.npcBonds.find(b =>
              (b.from === bond.from && b.to === bond.to) || (b.from === bond.to && b.to === bond.from)
            )
            if (existing) Object.assign(existing, bond)
            else this.npcBonds.push({ ...bond, tension: bond.tension || 0 })
          }
        }

        // Family events (结婚/生子/离婚)
        if (result.family_event && result.family_event.type) {
          const fe = result.family_event
          if (fe.type === 'marry' && fe.target) {
            this.family.spouse = fe.target
          } else if (fe.type === 'child' && fe.child_name) {
            const childAttrs = this.generateChildAttributes()
            this.family.children.push({
              name: fe.child_name,
              gender: fe.child_gender || '未知',
              birthAge: this.age,
              age: 0,
              inheritedTraits: childAttrs.traits,
              potential: childAttrs.potential,
            })
          } else if (fe.type === 'divorce') {
            this.family.spouse = null
          }
        }

        // Age up children each turn
        if (this.family.children.length > 0) {
          for (const child of this.family.children) {
            child.age = this.age - child.birthAge
          }
        }

        if (result.milestone && result.milestone.title) {
          this.milestones.push({ ...result.milestone, age: this.age, month: this.month })
        }

        if (result.career_update) this.career = result.career_update
        if (result.location_update) this.location = result.location_update

        // Track stats
        if (playerAction) this.lifeStats.totalChoices++
        const changes = result.attribute_changes || {}
        const total = Object.values(changes).reduce((s, v) => s + v, 0)
        if (total > 0) this.lifeStats.positiveEvents++
        else if (total < 0) this.lifeStats.negativeEvents++

        this.addMemory({
          month: this.totalMonths,
          summary: result.narrative_summary || result.narrative?.substring(0, 80) + '...',
          detail: result.narrative,
          importance: result.importance || 5
        })

        this.addTimelineEntry({
          title: result.title || '日常',
          narrative: result.narrative,
          choice: playerAction,
          mood: result.mood,
          sceneType: result.scene_type || 'leisure',
          weather: result.weather || ''
        })

        // 智能时间跳跃：前端解析 + AI 返回取最优
        let finalAgeAfter = null
        const aiAge = (typeof result.age_after === 'number' && result.age_after > this.age) ? result.age_after : null

        // 始终尝试前端解析玩家输入
        const parsedAge = playerAction ? this.parseAgeFromInput(playerAction, this.age) : null

        // 取两者中更大的那个（更尊重玩家意图）
        if (aiAge && parsedAge) finalAgeAfter = Math.max(aiAge, parsedAge)
        else finalAgeAfter = parsedAge || aiAge || null

        console.log(`[时间跳跃] 当前:${this.age}岁 | AI返回:${result.age_after} | 前端解析:${parsedAge} | 最终目标:${finalAgeAfter}`)

        // Record snapshot & update stats
        this.advanceTime(result.time_skip, finalAgeAfter)
        this.recordSnapshot()
        this.updateLifeStats()

        if (this.settings.autoSave) this.saveGame()

      } catch (error) {
        console.error('AI turn failed:', error)
        this.currentNarrative = '【系统提示】AI 响应出错，请检查网络和API设置。\n\n错误：' + error.message
        this.currentOptions = ['重试本回合']
      } finally {
        this.isLoading = false
      }
    },

    saveGame() {
      const saveData = {
        character: this.character, attributes: this.attributes, world: this.world,
        age: this.age, month: this.month, totalMonths: this.totalMonths,
        relationships: this.relationships, npcBonds: this.npcBonds,
        memories: this.memories, recentEvents: this.recentEvents,
        currentNarrative: this.currentNarrative, currentOptions: this.currentOptions,
        currentMood: this.currentMood, timeline: this.timeline, milestones: this.milestones,
        career: this.career, location: this.location, family: this.family,
        attributeHistory: this.attributeHistory, moodHistory: this.moodHistory, lifeStats: this.lifeStats,
        isPlaying: this.isPlaying, isGameOver: this.isGameOver, gameOverReason: this.gameOverReason,
        settings: this.settings,
        savedAt: new Date().toISOString(), walletAddress: wallet.state.address || '',
      }
      localStorage.setItem(wallet.getSaveKey(), JSON.stringify(saveData))
    },

    loadGame(customKey) {
      const key = customKey || wallet.getSaveKey()
      const data = localStorage.getItem(key)
      if (data) {
        const save = JSON.parse(data)
        Object.keys(save).forEach(k => {
          if (k !== 'savedAt' && k !== 'walletAddress' && this.$state.hasOwnProperty(k)) this[k] = save[k]
        })
        return true
      }
      return false
    },

    hasSaveData() { return !!localStorage.getItem(wallet.getSaveKey()) },
    deleteSave() { localStorage.removeItem(wallet.getSaveKey()) },

    getSaveInfo() {
      const data = localStorage.getItem(wallet.getSaveKey())
      if (!data) return null
      try {
        const s = JSON.parse(data)
        return { characterName: s.character?.name || '未知', age: s.age || 0, world: s.world?.settingLabel || '未知', savedAt: s.savedAt || '', walletAddress: s.walletAddress || '' }
      } catch { return null }
    }
  }
})
