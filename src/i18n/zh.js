export default {
  app: { title: '人生进程', subtitle: '每一次人生都是独一无二的', version: 'v0.2.0 · 人生进程' },
  nav: { home: '回到首页', back: '返回', restart: '重启人生', settings: '设置', dashboard: '人生总览', share: '分享到 X', close: '关闭', cancel: '取消', confirm: '确认', save: '保存设置', prev: '上一步', next: '下一步', delete: '删除' },

  // ═══ StartScreen ═══
  start: {
    newGame: '开始新人生', continueGame: '继续上次的故事', saves: '存档列表',
    features: ['🤖 AI 驱动叙事', '🎭 自由选择', '🌍 多元世界', '🔗 钱包存档', '🔊 沉浸音效'],
    connectWallet: '连接钱包', connecting: '连接中...', disconnect: '断开',
    walletHint: '连接钱包后，存档将绑定你的链上身份',
    slot: '槽', score: '评分', confirmDelete: '确定删除存档槽 {n}？',
    achievements: '成就图鉴',
  },

  // ═══ CharacterCreate ═══
  create: {
    title: '创建你的角色', subtitle: '塑造一个独一无二的灵魂',
    backHome: '返回首页',
    steps: ['基本信息', '选择头像', '性格特征', '背景故事', '确认创建'],
    stepsIcon: ['📝', '🎭', '💫', '📖', '✅'],
    // Step 1
    nameLabel: '角色姓名', namePlaceholder: '起个名字...',
    genderLabel: '性别',
    genderMale: '男性', genderFemale: '女性', genderOther: '自定义',
    ageLabel: '起始年龄', ageBirth: '出生', ageTeen: '少年', ageYouth: '青年', ageMiddle: '中年', ageUnit: '岁',
    agePresets: [{ label: '出生', icon: '👶' }, { label: '童年', icon: '🎒' }, { label: '成年', icon: '🎓' }, { label: '而立', icon: '💼' }],
    // Step 2
    avatarTitle: '选择一个代表你的头像', avatarDesc: '这将成为你在人生旅程中的形象标识',
    avatarSelected: '已选择头像', avatarChangeHint: '你可以随时回到这一步更换',
    avatarPlease: '请从上方选择一个头像',
    avatarCats: ['经典人物', '职业身份', '奇幻角色', '动物精灵', '符号标志'],
    // Step 3
    traitTitle: '性格特征', traitDesc: '选择 {n} 个最能代表角色的特质', traitRemaining: '还差 {n} 个',
    // Step 4
    storyLabel: '背景故事', storyPlaceholder: '写一段角色的背景故事...\n\n例如：出生在一个普通家庭，从小对世界充满好奇，梦想有一天能看到更大的天空……',
    aiGenerate: 'AI 生成', generating: '生成中...',
    // Step 5
    confirmHint: '确认后将选择世界，开始你的人生旅程',
    selectWorld: '选择世界',
    // Preview
    preview: '实时预览', unnamed: '未命名', personality: '性格', awaitStory: '等待书写……',
    completeness: '完成度', ready: '准备就绪！',
    items: { name: '姓名', gender: '性别', avatar: '头像', traits: '性格', story: '故事' },
    notStarted: '尚未开始',
    // Age stages
    ageStages: { infant: '婴儿期', toddler: '幼儿期', child: '童年', teen: '少年期', youth: '青年期', prime: '壮年期', middle: '中年期', elder: '老年期' },
  },
  // Traits
  traits: {
    brave: '勇敢', cautious: '谨慎', kind: '善良', cold: '冷酷', smart: '聪明', naive: '天真',
    humorous: '幽默', serious: '严肃', romantic: '浪漫', pragmatic: '务实', rebel: '叛逆', gentle: '温顺',
    ambitious: '野心勃勃', easygoing: '淡泊名利', extrovert: '外向开朗', introvert: '内向沉静',
    just: '正义感强', goWithFlow: '随波逐流',
  },

  // ═══ WorldSelect ═══
  world: {
    backCreate: '返回修改角色', title: '选择你的世界', subtitle: '每个世界都有独特的命运等待书写',
    startJourney: '开始人生旅程 →',
    modern: { label: '现代都市', desc: '繁华的现代城市，机遇与挑战并存。在职场、爱情、生活中找到属于你的位置。', tags: ['职场', '爱情', '社交', '科技'] },
    ancient: { label: '古代王朝', desc: '风云变幻的古代，朝堂争斗、江湖恩怨。入朝为官或行走江湖，命运由你书写。', tags: ['权谋', '武侠', '诗词', '历史'] },
    fantasy: { label: '奇幻大陆', desc: '魔法与神秘生物的世界。冒险、修炼、结交伙伴，书写属于你的史诗传奇。', tags: ['魔法', '冒险', '修炼', '神兽'] },
    scifi: { label: '星际时代', desc: '人类走向星际的未来。太空探索、AI 共存、星际贸易，无限可能在宇宙展开。', tags: ['太空', 'AI', '探索', '未来'] },
  },

  // ═══ GameMain ═══
  game: {
    startFirst: '开始第一个月 →', inputPlaceholder: '或输入你想做的任何事...', action: '行动',
    loading: ['命运的齿轮正在转动……', '人生如戏，好戏将至……', '笔墨未干，故事已起……', '星辰排列，命运即将揭晓……', '故事正在编织……', '下一个月会发生什么呢……', '时光流转中……', '生活总有意想不到的惊喜……', '每一个选择都在塑造你……'],
    streaming: '正在生成...', aiThinking: 'AI 正在构思你的故事...',
    gameOver: '人生落幕', lifeReport: '📜 人生报告', detailView: '📊 详细总览', restartLife: '🔄 重启人生',
    restartTitle: '重启人生', restartDesc: '当前进度自动保存。重新创建角色，开启全新旅程。',
    events: '事件', turns: '回合', awaitStory: '等待故事开始', awaitFate: '等待缘分到来',
    expand: '展开 ↓', collapse: '收起 ↑',
    keyTip: '提示：按', quickSelect: '快速选择',
    // Sidebar
    charPanel: '角色面板', milestones: '🏆 人生里程碑', attributes: '📊 属性', family: '👨‍👩‍👧‍👦 家庭',
    relations: '👥 关系', timeline: '📅 时间线', npcNet: 'NPC 关系网',
    spouse: '配偶', children: '子女', noSpouse: '无',
    skillsLabel: '🌳 技能', assetsLabel: '🏠 资产', detail: '详情 →',
    overview: '📊 总览', skills: '🌳 技能', assets: '🏠 资产', achievementsBtn: '🏅 成就',
    // Menu
    menuRestart: '🔄 重启人生', menuDashboard: '📊 人生总览', menuSkills: '🌳 技能树',
    menuAssets: '🏠 资产', menuAchievements: '🏅 成就', menuSettings: '⚙️ 设置',
    menuHome: '🏠 回到首页', menuShare: '分享到 X',
    // Game over
    monthsLived: '经历月份', milestonesCount: '人生里程碑', peopleMet: '结识之人', choicesMade: '人生抉择',
    gameOverReason: '游戏结束原因',
    inherited: '继承',
  },

  // ═══ Attributes ═══
  attrs: { health: '健康', intelligence: '智力', charisma: '魅力', wealth: '财富', happiness: '幸福', social: '社交' },

  // ═══ Life Stages ═══
  lifeStages: { infant: '婴儿期', toddler: '幼儿期', child: '童年', teen: '少年期', youth: '青年期', prime: '壮年期', middle: '中年期', elder: '老年期' },

  // ═══ Skills ═══
  skills: {
    title: '🌳 技能树 & 职业体系', desc: '通过不同生活选择获得技能经验，解锁职业晋升路径',
    levelTitle: '技能等级', careerTitle: '🏢 职业路径',
    technology: '科技', communication: '沟通', creativity: '创造力', fitness: '体能', business: '商业', academic: '学术',
    current: '当前', unlocked: '可达成', locked: '🔒 未解锁',
    nextStage: '→ 下一阶段:',
    tip: '💡 技能通过游戏中的不同选择自动获得经验',
    tipDesc: '学习场景 → 学术⬆ | 工作场景 → 商业⬆ | 社交场景 → 沟通⬆ ...',
    // Career names
    careers: {
      programmer: '程序员', senior_dev: '高级工程师', tech_lead: '技术总监', cto: 'CTO',
      teacher: '教师', professor: '教授', artist: '艺术家', famous_artist: '知名艺术家',
      entrepreneur: '创业者', ceo: 'CEO', athlete: '运动员', champion: '冠军',
      doctor: '医生', chief_doctor: '主任医师', writer: '作家', bestseller: '畅销作家',
    },
  },

  // ═══ Assets ═══
  assets: {
    title: '🏠 资产管理', desc: '你拥有的房产、车辆、收藏品和奢侈品',
    totalValue: '总资产价值', noAssets: '暂无资产', noAssetsDesc: '随着人生的发展，你将逐渐积累各种资产',
    unowned: '尚未拥有', value: '价值', acquiredAt: '{age}岁获得',
    property: '🏠 房产', vehicle: '🚗 车辆', collectible: '🖼️ 收藏品', luxury: '💎 奢侈品',
    names: {
      apartment: '公寓', house: '别墅', mansion: '豪宅',
      bicycle: '自行车', car: '轿车', sports_car: '跑车',
      painting: '名画', antique: '古董', watch: '名表', jewelry: '珠宝', yacht: '游艇',
    },
  },

  // ═══ Achievements ═══
  achievements: {
    title: '🏅 成就图鉴', desc: '跨越多次人生的全局成就，你能全部解锁吗？',
    cats: { all: '🏅 全部', explore: '🌍 探索', life: '🌟 人生', relation: '💕 关系', attr: '📊 属性', career: '💼 职业', skill: '🔮 技能', asset: '🏠 资产' },
    noCat: '该分类暂无成就',
    defs: {
      first_step: { title: '第一步', desc: '开始你的第一段人生' },
      four_worlds: { title: '世界旅者', desc: '在四个不同世界中开始人生' },
      age_100: { title: '百岁人瑞', desc: '活到100岁' },
      age_80: { title: '长命百岁', desc: '活到80岁' },
      first_love: { title: '初恋', desc: '第一次恋爱' },
      married: { title: '步入婚姻', desc: '结婚' },
      parent: { title: '为人父母', desc: '有了第一个孩子' },
      big_family: { title: '大家庭', desc: '有3个以上孩子' },
      social_butterfly: { title: '社交达人', desc: '认识20个以上NPC' },
      rich: { title: '财务自由', desc: '财富值达到90以上' },
      genius: { title: '天才', desc: '智力值达到95以上' },
      perfect_health: { title: '铁人', desc: '健康值一直保持在80以上' },
      all_max: { title: '六边形战士', desc: '所有属性同时达到70以上' },
      ceo_life: { title: '商业帝国', desc: '成为CEO' },
      professor_life: { title: '学术巅峰', desc: '成为教授' },
      champion_life: { title: '冠军之路', desc: '成为冠军' },
      five_milestones: { title: '里程碑收集者', desc: '达成5个以上里程碑' },
      ten_milestones: { title: '传奇人生', desc: '达成10个以上里程碑' },
      max_score: { title: '完美人生', desc: '人生评分达到85以上' },
      skill_master: { title: '技能大师', desc: '任意技能达到8级' },
      asset_collector: { title: '资产大亨', desc: '拥有5个以上资产' },
      ten_lives: { title: '轮回', desc: '完成10次人生' },
    },
  },

  // ═══ Dashboard ═══
  dashboard: {
    title: '📊 人生总览',
    age: '年龄', months: '经历月份', score: '综合评分', milestones: '里程碑', relations: '人际关系', choices: '抉择次数',
    attrTrend: '📈 属性趋势', eventDist: '⚖️ 事件分布',
    positive: '😊 积极事件', negative: '😢 消极事件',
    moodTrack: '🎭 情绪轨迹', dominantMood: '主导情绪',
    achieveLabel: '🏆 成就',
  },

  // ═══ Life Report ═══
  report: {
    life: '的人生', lifeScore: '人生评分',
    aiReview: '🤖 AI 人生总评', aiLoading: 'AI 正在回顾你的一生...', aiFail: '无法生成 AI 总评',
    finalAttrs: '最终属性', finalSkills: '🌳 最终技能', finalAssets: '🏠 最终资产',
    lifeJourney: '人生轨迹', milestonesLabel: '🏆 人生里程碑',
    peopleMet: '👥 人生中遇到的人', familyLabel: '👨‍👩‍👧‍👦 家庭',
    relGraph: '🕸️ 人际关系图谱', relGraphDesc: '以你为中心的人际关系网络',
    moodPortrait: '情绪画像',
    exportText: '📝 导出文本',
    quickStats: { months: '经历月份', milestones: '里程碑', people: '遇见之人', choices: '人生抉择' },
  },

  // ═══ Settings ═══
  settings: {
    title: '⚙️ 设置',
    gameTitle: '🎮 游戏设置', textSpeed: '文字速度', fast: '快', slow: '慢',
    typewriter: '打字机效果', typewriterDesc: '逐字显示叙事文本',
    particles: '环境粒子', particlesDesc: '世界主题浮动粒子效果',
    autoSave: '自动保存', autoSaveDesc: '每回合自动保存进度',
    audioTitle: '🔊 音效', audioEnabled: '启用音效', audioDesc: 'BGM + 音效反馈', bgm: '背景音乐', sfx: '音效',
    langTitle: '🌐 语言 / Language', shortcuts: '⌨️ 快捷键',
    shortcutChoose: '选择选项 1/2/3', shortcutSettings: '打开设置', shortcutDashboard: '人生总览',
    show: '显示', hide: '隐藏',
  },
}
