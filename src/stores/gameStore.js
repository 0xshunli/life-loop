import { defineStore } from 'pinia'
import { aiService } from '../services/ai'
import wallet from '../services/wallet'

// ═══ 随机事件池 ═══
const RANDOM_EVENTS = [
  // ══════ 通用（全年龄） ══════
  { text: '路边有位老人请你帮忙指路，你热心地带TA走了一段', icon: '🧓', changes: { social: 3, happiness: 2 }, minAge: 6, maxAge: 100 },
  { text: '在路上捡到了一枚幸运硬币', icon: '🪙', changes: { wealth: 1, happiness: 2 }, minAge: 3, maxAge: 100 },
  { text: '走路时不小心摔了一跤，膝盖擦破了', icon: '🤕', changes: { health: -3, happiness: -1 }, minAge: 3, maxAge: 80 },
  { text: '偶遇一只流浪猫，和它玩了好一会儿', icon: '🐱', changes: { happiness: 4, social: 1 }, minAge: 3, maxAge: 100 },
  { text: '天气突变，被一场大雨淋了个透', icon: '🌧️', changes: { health: -2, happiness: -2 }, minAge: 3, maxAge: 100 },
  { text: '意外发现一本被遗忘的好书，读得入了迷', icon: '📖', changes: { intelligence: 3, happiness: 2 }, minAge: 6, maxAge: 100 },
  { text: '在街角听到一首动人的音乐，心情大好', icon: '🎵', changes: { happiness: 4 }, minAge: 3, maxAge: 100 },
  { text: '做了一个关于飞翔的美梦', icon: '💭', changes: { happiness: 2 }, minAge: 3, maxAge: 100 },
  { text: '吃到了一顿特别美味的饭', icon: '🍽️', changes: { happiness: 3, health: 1 }, minAge: 3, maxAge: 100 },
  { text: '看到了一场绚丽的日落，内心涌起感动', icon: '🌅', changes: { happiness: 3 }, minAge: 3, maxAge: 100 },
  { text: '在超市遇到了打折，省了一笔钱', icon: '🛒', changes: { wealth: 2, happiness: 1 }, minAge: 10, maxAge: 100 },
  { text: '帮一位陌生人提了重物，对方连声道谢', icon: '🙏', changes: { social: 2, happiness: 3, charisma: 1 }, minAge: 10, maxAge: 75 },
  { text: '深夜失眠，一个人看了一整夜的星空', icon: '🌌', changes: { happiness: 1, intelligence: 1 }, minAge: 8, maxAge: 100 },
  { text: '无意间拍了一张特别美的照片', icon: '📸', changes: { happiness: 2, charisma: 1 }, minAge: 8, maxAge: 100 },
  { text: '被蚊子咬了好几个包，浑身难受', icon: '🦟', changes: { health: -1, happiness: -2 }, minAge: 3, maxAge: 100 },
  { text: '在公园的长椅上小睡了一会儿，精神焕发', icon: '💤', changes: { health: 2, happiness: 2 }, minAge: 6, maxAge: 100 },
  { text: '学会了一道新菜，味道还不错', icon: '🍳', changes: { intelligence: 1, happiness: 3 }, minAge: 10, maxAge: 100 },
  { text: '看了一部让人泪流满面的电影', icon: '🎬', changes: { happiness: -1, intelligence: 2 }, minAge: 8, maxAge: 100 },
  { text: '收到了一份意想不到的快递，是朋友寄来的', icon: '📦', changes: { happiness: 4, social: 2 }, minAge: 12, maxAge: 100 },
  { text: '手机屏幕摔碎了，心疼不已', icon: '📱', changes: { wealth: -3, happiness: -3 }, minAge: 10, maxAge: 80 },

  // ══════ 婴幼儿 (0-5) ══════
  { text: '第一次叫出了"妈妈"，全家人都开心坏了', icon: '👶', changes: { social: 3, happiness: 5 }, minAge: 0, maxAge: 2 },
  { text: '学会了翻身！虽然翻完就哭了', icon: '🔄', changes: { health: 2, happiness: 1 }, minAge: 0, maxAge: 1 },
  { text: '发高烧了，妈妈整夜没合眼', icon: '🤒', changes: { health: -5, social: 2 }, minAge: 0, maxAge: 5 },
  { text: '在地上爬来爬去，把家里搞得一团糟', icon: '🐛', changes: { health: 1, happiness: 3 }, minAge: 0, maxAge: 2 },
  { text: '抓到了一只蝴蝶！又放走了', icon: '🦋', changes: { happiness: 4, intelligence: 1 }, minAge: 2, maxAge: 6 },
  { text: '第一次吃冰淇淋，被甜到了', icon: '🍦', changes: { happiness: 5 }, minAge: 2, maxAge: 6 },
  { text: '在幼儿园学会了一首新歌', icon: '🎶', changes: { intelligence: 2, happiness: 3, social: 1 }, minAge: 3, maxAge: 6 },
  { text: '和小朋友一起堆了一座沙堡', icon: '🏖️', changes: { happiness: 4, social: 3 }, minAge: 2, maxAge: 6 },

  // ══════ 童年 (6-12) ══════
  { text: '在游乐场玩得不亦乐乎！', icon: '🎢', changes: { happiness: 5, social: 2 }, minAge: 3, maxAge: 12 },
  { text: '考试得了满分，老师当众表扬', icon: '💯', changes: { intelligence: 3, happiness: 4, charisma: 2 }, minAge: 6, maxAge: 18 },
  { text: '和小伙伴吵架了，有点难过', icon: '😤', changes: { happiness: -3, social: -2 }, minAge: 4, maxAge: 15 },
  { text: '在学校运动会上拿了第一名', icon: '🥇', changes: { health: 3, charisma: 4, happiness: 5 }, minAge: 6, maxAge: 18 },
  { text: '被班上同学起了一个外号', icon: '😣', changes: { happiness: -4, charisma: -2 }, minAge: 6, maxAge: 15 },
  { text: '在花园里发现了一只蜗牛，观察了很久', icon: '🐌', changes: { intelligence: 2, happiness: 2 }, minAge: 4, maxAge: 10 },
  { text: '第一次骑自行车不用辅助轮！', icon: '🚴', changes: { health: 3, happiness: 5 }, minAge: 5, maxAge: 10 },
  { text: '画了一幅画，被老师贴在教室后墙上', icon: '🎨', changes: { charisma: 3, happiness: 4 }, minAge: 5, maxAge: 12 },
  { text: '放学路上发现了一条捷径，感觉自己是探险家', icon: '🗺️', changes: { intelligence: 2, happiness: 3 }, minAge: 6, maxAge: 12 },
  { text: '考试考砸了，被父母批评', icon: '😞', changes: { happiness: -4, intelligence: 1 }, minAge: 6, maxAge: 18 },
  { text: '在图书馆借了一本科幻小说，看得如痴如醉', icon: '🚀', changes: { intelligence: 4, happiness: 3 }, minAge: 8, maxAge: 16 },
  { text: '和朋友交换了最心爱的玩具', icon: '🧸', changes: { social: 4, happiness: 2 }, minAge: 4, maxAge: 10 },
  { text: '参加了学校的科学竞赛', icon: '🔬', changes: { intelligence: 5, charisma: 1 }, minAge: 8, maxAge: 18 },
  { text: '被邻居家的狗追了好远', icon: '🐕', changes: { health: 1, happiness: -2 }, minAge: 4, maxAge: 14 },

  // ══════ 少年 (12-18) ══════
  { text: '偷偷喜欢上了班里的同学', icon: '💗', changes: { happiness: 3, social: 1 }, minAge: 12, maxAge: 18 },
  { text: '和朋友通宵玩游戏，第二天上课打瞌睡', icon: '🎮', changes: { happiness: 3, health: -2, social: 3 }, minAge: 12, maxAge: 22 },
  { text: '在课堂上被点名回答问题，居然答对了', icon: '💡', changes: { intelligence: 2, charisma: 3, happiness: 2 }, minAge: 12, maxAge: 22 },
  { text: '组建了一支乐队，虽然还不太会弹', icon: '🎸', changes: { charisma: 3, social: 4, happiness: 3 }, minAge: 13, maxAge: 25 },
  { text: '第一次写了一首诗，虽然有点幼稚', icon: '📝', changes: { intelligence: 2, happiness: 2 }, minAge: 12, maxAge: 20 },
  { text: '和父母大吵了一架，摔门而出', icon: '🚪', changes: { happiness: -5, social: -3 }, minAge: 12, maxAge: 20 },
  { text: '参加了社团活动，认识了很多新朋友', icon: '🎭', changes: { social: 5, charisma: 2, happiness: 3 }, minAge: 12, maxAge: 22 },
  { text: '被老师选为班级干部', icon: '🏫', changes: { charisma: 3, social: 3, intelligence: 1 }, minAge: 10, maxAge: 18 },

  // ══════ 青年 (18-30) ══════
  { text: '参加了一场精彩的演讲比赛', icon: '🎤', changes: { charisma: 4, intelligence: 2 }, minAge: 15, maxAge: 40 },
  { text: '在社交媒体上的帖子意外火了', icon: '📱', changes: { charisma: 3, social: 4 }, minAge: 12, maxAge: 50 },
  { text: '健身坚持了一个月，身体明显好转', icon: '💪', changes: { health: 5, charisma: 2 }, minAge: 15, maxAge: 70 },
  { text: '投资的基金意外大涨', icon: '📈', changes: { wealth: 8, happiness: 3 }, minAge: 18, maxAge: 100 },
  { text: '钱包丢了，损失了一些钱', icon: '😰', changes: { wealth: -5, happiness: -3 }, minAge: 12, maxAge: 100 },
  { text: '第一次独自旅行，看到了不一样的风景', icon: '✈️', changes: { happiness: 5, intelligence: 3, charisma: 2 }, minAge: 18, maxAge: 60 },
  { text: '面试被拒了，有点受打击', icon: '😔', changes: { happiness: -4, charisma: -1 }, minAge: 18, maxAge: 45 },
  { text: '租的房子漏水了，折腾了一整天', icon: '🔧', changes: { happiness: -3, wealth: -2 }, minAge: 18, maxAge: 50 },
  { text: '学会了一门新的编程语言', icon: '👨‍💻', changes: { intelligence: 5, wealth: 2 }, minAge: 16, maxAge: 50 },
  { text: '在咖啡馆和一个陌生人聊得很投机', icon: '☕', changes: { social: 4, happiness: 3 }, minAge: 18, maxAge: 70 },
  { text: '半夜灵感来了，写了一首很棒的歌', icon: '🎵', changes: { intelligence: 2, happiness: 4 }, minAge: 16, maxAge: 60 },
  { text: '报名了马拉松比赛，坚持跑完了全程', icon: '🏃', changes: { health: 6, happiness: 5, charisma: 2 }, minAge: 18, maxAge: 55 },
  { text: '被闺蜜/兄弟背后说了坏话', icon: '🗣️', changes: { happiness: -5, social: -4 }, minAge: 15, maxAge: 50 },
  { text: '存了好久的钱买了心仪已久的东西', icon: '🎁', changes: { happiness: 5, wealth: -3 }, minAge: 16, maxAge: 60 },
  { text: '第一次做饭请朋友吃，大家都说好吃', icon: '👨‍🍳', changes: { social: 4, happiness: 4, charisma: 2 }, minAge: 18, maxAge: 60 },
  { text: '在网上学了一门免费课程，收获很多', icon: '🎓', changes: { intelligence: 4 }, minAge: 16, maxAge: 70 },

  // ══════ 壮年/中年 (30-65) ══════
  { text: '收到一封来自远方朋友的信', icon: '✉️', changes: { happiness: 3, social: 2 }, minAge: 18, maxAge: 100 },
  { text: '邻居送来了自己做的蛋糕', icon: '🎂', changes: { happiness: 3, social: 2 }, minAge: 10, maxAge: 100 },
  { text: '参加了一次志愿者活动', icon: '🤝', changes: { social: 4, happiness: 3, charisma: 1 }, minAge: 12, maxAge: 80 },
  { text: '意外中了个小奖！', icon: '🎰', changes: { wealth: 12, happiness: 5 }, minAge: 18, maxAge: 100, rare: true },
  { text: '体检发现一个小毛病，需要注意', icon: '🏥', changes: { health: -4, happiness: -2 }, minAge: 30, maxAge: 100 },
  { text: '老同学聚会，重温了旧时光', icon: '🥂', changes: { happiness: 4, social: 3 }, minAge: 25, maxAge: 100 },
  { text: '被公司裁员了，天塌了一半', icon: '📋', changes: { wealth: -8, happiness: -7, social: -2 }, minAge: 25, maxAge: 60, rare: true },
  { text: '孩子在学校获了奖，你比谁都骄傲', icon: '🏆', changes: { happiness: 6, social: 2 }, minAge: 30, maxAge: 65 },
  { text: '被推荐升职了！', icon: '🎉', changes: { wealth: 8, charisma: 3, happiness: 5 }, minAge: 25, maxAge: 58 },
  { text: '和老伴一起看了一场日出', icon: '🌄', changes: { happiness: 5, social: 2 }, minAge: 35, maxAge: 100 },
  { text: '在小区花园种的花开了', icon: '🌺', changes: { happiness: 3, health: 1 }, minAge: 25, maxAge: 100 },
  { text: '参加了一场同行交流会，开阔了眼界', icon: '🤔', changes: { intelligence: 3, social: 3 }, minAge: 25, maxAge: 65 },
  { text: '汽车半路抛锚，路过的人帮了大忙', icon: '🚗', changes: { happiness: -1, social: 3 }, minAge: 20, maxAge: 75 },
  { text: '发现了一家很棒的餐厅，决定常来', icon: '🍜', changes: { happiness: 3 }, minAge: 18, maxAge: 100 },
  { text: '工作压力太大，失眠了好几天', icon: '😫', changes: { health: -3, happiness: -4 }, minAge: 22, maxAge: 60 },
  { text: '炒股亏了一笔，心情低落', icon: '📉', changes: { wealth: -7, happiness: -4 }, minAge: 20, maxAge: 80 },
  { text: '获得了行业内的一个小奖项', icon: '🏅', changes: { charisma: 4, happiness: 5, wealth: 3 }, minAge: 25, maxAge: 65 },
  { text: '搬了新家，一切都是新的开始', icon: '🏡', changes: { happiness: 4, wealth: -5 }, minAge: 22, maxAge: 70 },
  { text: '周末去爬了座山，风景美极了', icon: '⛰️', changes: { health: 3, happiness: 4 }, minAge: 12, maxAge: 70 },
  { text: '被邀请去做了一次行业分享', icon: '🎙️', changes: { charisma: 4, social: 3, intelligence: 2 }, minAge: 28, maxAge: 65 },

  // ══════ 老年 (65+) ══════
  { text: '在公园下棋赢了好几局', icon: '♟️', changes: { intelligence: 2, happiness: 3 }, minAge: 50, maxAge: 100 },
  { text: '孙辈来看望，其乐融融', icon: '👨‍👧', changes: { happiness: 5, social: 3 }, minAge: 55, maxAge: 100 },
  { text: '翻出了年轻时的照片，回忆涌上心头', icon: '📸', changes: { happiness: 2, intelligence: 1 }, minAge: 55, maxAge: 100 },
  { text: '参加了社区太极拳班，认识了好几个老伙伴', icon: '🧘', changes: { health: 3, social: 4, happiness: 3 }, minAge: 55, maxAge: 100 },
  { text: '养的鹦鹉学会说"你好"了', icon: '🦜', changes: { happiness: 4 }, minAge: 50, maxAge: 100 },
  { text: '关节有点疼，上下楼不太方便了', icon: '🦵', changes: { health: -4, happiness: -2 }, minAge: 60, maxAge: 100 },
  { text: '写完了一本回忆录，满满的成就感', icon: '📔', changes: { intelligence: 3, happiness: 5, charisma: 2 }, minAge: 60, maxAge: 100 },
  { text: '被社区评为"最受欢迎的老邻居"', icon: '🏘️', changes: { social: 4, happiness: 4, charisma: 3 }, minAge: 60, maxAge: 100 },
  { text: '子女们凑钱给你办了场生日派对', icon: '🎈', changes: { happiness: 6, social: 3 }, minAge: 55, maxAge: 100 },
  { text: '学会了用智能手机和远方的老友视频通话', icon: '📲', changes: { intelligence: 2, social: 3, happiness: 3 }, minAge: 55, maxAge: 100 },
  { text: '清晨散步时遇到了鹿', icon: '🦌', changes: { happiness: 4 }, minAge: 50, maxAge: 100 },

  // ══════ 重大/稀有事件 ══════
  { text: '遭遇了一场地震，虽然没受伤，但心有余悸', icon: '🌍', changes: { health: -2, happiness: -6 }, minAge: 5, maxAge: 100, rare: true },
  { text: '中了彩票大奖！人生巅峰！', icon: '💰', changes: { wealth: 25, happiness: 8 }, minAge: 18, maxAge: 100, rare: true },
  { text: '在海边捡到了一颗完美的贝壳', icon: '🐚', changes: { happiness: 3 }, minAge: 3, maxAge: 100 },
  { text: '经历了一次食物中毒，在家躺了三天', icon: '🤮', changes: { health: -6, happiness: -4 }, minAge: 6, maxAge: 100, rare: true },
  { text: '被一位明星认出并合了影', icon: '🌟', changes: { happiness: 6, charisma: 3, social: 2 }, minAge: 10, maxAge: 80, rare: true },
  { text: '你的一条建议被采纳，改变了整个项目方向', icon: '💡', changes: { intelligence: 4, charisma: 5, happiness: 4 }, minAge: 22, maxAge: 65, rare: true },
  { text: '被人碰瓷了，虽然没赔钱但气得不行', icon: '😡', changes: { happiness: -5, wealth: -2 }, minAge: 18, maxAge: 80, rare: true },
  { text: '在跳蚤市场淘到了一件宝贝', icon: '🏺', changes: { wealth: 6, happiness: 4, intelligence: 2 }, minAge: 16, maxAge: 100, rare: true },
  { text: '你救了一个溺水的人，成了本地英雄', icon: '🦸', changes: { charisma: 8, social: 6, happiness: 5, health: -2 }, minAge: 16, maxAge: 65, rare: true },
  { text: '发现了一个绝美的隐秘花园', icon: '🌸', changes: { happiness: 5, intelligence: 1 }, minAge: 6, maxAge: 100, rare: true },
]

// ═══ 技能定义 ═══
const SKILL_DEFS = {
  technology:    { label: '科技', icon: '💻', color: '#3b82f6' },
  communication: { label: '沟通', icon: '🗣️', color: '#f97316' },
  creativity:    { label: '创造力', icon: '🎨', color: '#8b5cf6' },
  fitness:       { label: '体能', icon: '💪', color: '#10b981' },
  business:      { label: '商业', icon: '📈', color: '#f59e0b' },
  academic:      { label: '学术', icon: '📚', color: '#6366f1' },
}

// ═══ 职业路径 ═══
const CAREER_PATHS = {
  programmer:   { title: '程序员', icon: '💻', req: { technology: 3, academic: 2 }, next: 'senior_dev' },
  senior_dev:   { title: '高级工程师', icon: '🖥️', req: { technology: 5, communication: 2 }, next: 'tech_lead' },
  tech_lead:    { title: '技术总监', icon: '🏗️', req: { technology: 7, business: 3, communication: 4 }, next: 'cto' },
  cto:          { title: 'CTO', icon: '👑', req: { technology: 9, business: 5, communication: 5 } },
  teacher:      { title: '教师', icon: '🧑‍🏫', req: { academic: 3, communication: 3 }, next: 'professor' },
  professor:    { title: '教授', icon: '🎓', req: { academic: 7, communication: 4 } },
  artist:       { title: '艺术家', icon: '🎨', req: { creativity: 4 }, next: 'famous_artist' },
  famous_artist: { title: '知名艺术家', icon: '🌟', req: { creativity: 7, communication: 3 } },
  entrepreneur: { title: '创业者', icon: '🚀', req: { business: 4, communication: 3 }, next: 'ceo' },
  ceo:          { title: 'CEO', icon: '🏢', req: { business: 7, communication: 5, technology: 3 } },
  athlete:      { title: '运动员', icon: '⚽', req: { fitness: 5 }, next: 'champion' },
  champion:     { title: '冠军', icon: '🏆', req: { fitness: 8, communication: 3 } },
  doctor:       { title: '医生', icon: '🩺', req: { academic: 5, communication: 2 }, next: 'chief_doctor' },
  chief_doctor: { title: '主任医师', icon: '🏥', req: { academic: 8, communication: 4 } },
  writer:       { title: '作家', icon: '✍️', req: { creativity: 4, academic: 3 }, next: 'bestseller' },
  bestseller:   { title: '畅销作家', icon: '📖', req: { creativity: 7, communication: 5 } },
}

// ═══ 成就定义 ═══
const ACHIEVEMENT_DEFS = [
  { id: 'first_step', title: '第一步', icon: '👣', desc: '开始你的第一段人生', cat: 'explore' },
  { id: 'four_worlds', title: '世界旅者', icon: '🌍', desc: '在四个不同世界中开始人生', cat: 'explore' },
  { id: 'age_100', title: '百岁人瑞', icon: '🎂', desc: '活到100岁', cat: 'life' },
  { id: 'age_80', title: '长命百岁', icon: '🧓', desc: '活到80岁', cat: 'life' },
  { id: 'first_love', title: '初恋', icon: '💕', desc: '第一次恋爱', cat: 'relation' },
  { id: 'married', title: '步入婚姻', icon: '💍', desc: '结婚', cat: 'relation' },
  { id: 'parent', title: '为人父母', icon: '👶', desc: '有了第一个孩子', cat: 'relation' },
  { id: 'big_family', title: '大家庭', icon: '👨‍👩‍👧‍👦', desc: '有3个以上孩子', cat: 'relation' },
  { id: 'social_butterfly', title: '社交达人', icon: '🦋', desc: '认识20个以上NPC', cat: 'relation' },
  { id: 'rich', title: '财务自由', icon: '💰', desc: '财富值达到90以上', cat: 'attr' },
  { id: 'genius', title: '天才', icon: '🧠', desc: '智力值达到95以上', cat: 'attr' },
  { id: 'perfect_health', title: '铁人', icon: '❤️', desc: '健康值一直保持在80以上', cat: 'attr' },
  { id: 'all_max', title: '六边形战士', icon: '⬡', desc: '所有属性同时达到70以上', cat: 'attr' },
  { id: 'ceo_life', title: '商业帝国', icon: '👑', desc: '成为CEO', cat: 'career' },
  { id: 'professor_life', title: '学术巅峰', icon: '🎓', desc: '成为教授', cat: 'career' },
  { id: 'champion_life', title: '冠军之路', icon: '🏆', desc: '成为冠军', cat: 'career' },
  { id: 'five_milestones', title: '里程碑收集者', icon: '🏅', desc: '达成5个以上里程碑', cat: 'life' },
  { id: 'ten_milestones', title: '传奇人生', icon: '⭐', desc: '达成10个以上里程碑', cat: 'life' },
  { id: 'max_score', title: '完美人生', icon: '💎', desc: '人生评分达到85以上', cat: 'life' },
  { id: 'skill_master', title: '技能大师', icon: '🔮', desc: '任意技能达到8级', cat: 'skill' },
  { id: 'asset_collector', title: '资产大亨', icon: '🏠', desc: '拥有5个以上资产', cat: 'asset' },
  { id: 'ten_lives', title: '轮回', icon: '♻️', desc: '完成10次人生', cat: 'explore' },
]

// ═══ 资产定义 ═══
const ASSET_CATALOG = {
  // 房产
  apartment:  { name: '公寓', icon: '🏢', type: 'property', value: 30, effects: { happiness: 3 } },
  house:      { name: '别墅', icon: '🏡', type: 'property', value: 60, effects: { happiness: 5, social: 2 } },
  mansion:    { name: '豪宅', icon: '🏰', type: 'property', value: 95, effects: { happiness: 8, charisma: 3, social: 3 } },
  // 车辆
  bicycle:    { name: '自行车', icon: '🚲', type: 'vehicle', value: 5, effects: { health: 2 } },
  car:        { name: '轿车', icon: '🚗', type: 'vehicle', value: 25, effects: { social: 2 } },
  sports_car: { name: '跑车', icon: '🏎️', type: 'vehicle', value: 70, effects: { charisma: 3, happiness: 3 } },
  // 收藏
  painting:   { name: '名画', icon: '🖼️', type: 'collectible', value: 40, effects: { intelligence: 2, happiness: 2 } },
  antique:    { name: '古董', icon: '🏺', type: 'collectible', value: 50, effects: { intelligence: 3, wealth: 2 } },
  // 奢侈品
  watch:      { name: '名表', icon: '⌚', type: 'luxury', value: 35, effects: { charisma: 2 } },
  jewelry:    { name: '珠宝', icon: '💎', type: 'luxury', value: 55, effects: { charisma: 4, happiness: 2 } },
  yacht:      { name: '游艇', icon: '🛥️', type: 'luxury', value: 90, effects: { happiness: 5, social: 4, charisma: 3 } },
}

export const useGameStore = defineStore('game', {
  state: () => ({
    character: { name: '', gender: '', personality: [], backstory: '', avatar: '', startAge: 0 },
    attributes: { health: 70, intelligence: 50, charisma: 50, wealth: 30, happiness: 60, social: 40 },
    world: { setting: '', settingLabel: '', description: '' },
    age: 0,
    month: 1,
    totalMonths: 0,
    relationships: [],
    npcBonds: [],
    memories: [],
    recentEvents: [],
    currentNarrative: '',
    currentOptions: [],
    currentMood: '平静',
    timeline: [],
    milestones: [],
    career: '',
    location: '',
    family: { spouse: null, children: [] },
    attributeHistory: [],
    moodHistory: [],
    lifeStats: {
      totalChoices: 0, positiveEvents: 0, negativeEvents: 0,
      npcMet: 0, highestAttribute: '', lowestAttribute: '',
    },
    // 技能系统
    skills: {
      technology: { level: 0, exp: 0 },
      communication: { level: 0, exp: 0 },
      creativity: { level: 0, exp: 0 },
      fitness: { level: 0, exp: 0 },
      business: { level: 0, exp: 0 },
      academic: { level: 0, exp: 0 },
    },
    careerPath: null,  // 当前职业路径 ID
    // 资产系统
    assets: [],  // [{ id, name, icon, type, value, effects, acquiredAge }]
    // NPC 深度
    npcMemories: {},  // { npcName: [{ age, event }] }
    npcProactiveEvent: null,
    // 流式输出
    streamingNarrative: '',
    isStreaming: false,
    // 随机事件
    lastRandomEvent: null,
    // 多存档
    currentSlotId: 0,
    // 游戏状态
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
      if (state.character.avatar) return state.character.avatar
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
    sparklineData: (state) => (key, count = 20) => {
      return state.attributeHistory.slice(-count).map(h => h[key] || 0)
    },
    dominantMood(state) {
      if (!state.moodHistory.length) return '平静'
      const freq = {}
      state.moodHistory.forEach(m => { freq[m.mood] = (freq[m.mood] || 0) + 1 })
      return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0]
    },
    // 技能列表
    skillList(state) {
      return Object.entries(state.skills).map(([key, s]) => ({
        key, ...SKILL_DEFS[key], level: s.level, exp: s.exp, maxExp: (s.level + 1) * 20,
      }))
    },
    // 可达成的职业路径
    availableCareers(state) {
      return Object.entries(CAREER_PATHS).filter(([_, cp]) => {
        return Object.entries(cp.req).every(([sk, lv]) => state.skills[sk]?.level >= lv)
      }).map(([id, cp]) => ({ id, ...cp }))
    },
    // 总资产价值
    totalAssetValue(state) { return state.assets.reduce((s, a) => s + (a.value || 0), 0) },
    // 成就系统（全局）
    globalAchievements() {
      try {
        return JSON.parse(localStorage.getItem('lifeprocess_achievements') || '{}')
      } catch { return {} }
    },
    achievementList() {
      const unlocked = this.globalAchievements
      return ACHIEVEMENT_DEFS.map(a => ({ ...a, unlocked: !!unlocked[a.id], unlockedAt: unlocked[a.id] || null }))
    },
    achievementProgress() {
      const unlocked = Object.keys(this.globalAchievements).length
      return { unlocked, total: ACHIEVEMENT_DEFS.length }
    },
  },

  actions: {
    // ═══ 初始化 ═══
    initGame(character, world) {
      this.character = { ...character }
      this.world = { ...world }
      this.age = character.startAge ?? 0; this.month = 1; this.totalMonths = 0
      const age = this.age
      const r = () => Math.floor(Math.random() * 16 - 8)
      if (age < 6) {
        this.attributes = { health: 85 + r(), intelligence: 15 + r(), charisma: 30 + r(), wealth: 0, happiness: 80 + r(), social: 10 + r() }
      } else if (age < 18) {
        this.attributes = { health: 80 + r(), intelligence: 35 + r(), charisma: 40 + r(), wealth: 10 + r(), happiness: 70 + r(), social: 35 + r() }
      } else if (age < 40) {
        this.attributes = { health: 70 + r(), intelligence: 50 + r(), charisma: 50 + r(), wealth: 30 + r(), happiness: 60 + r(), social: 45 + r() }
      } else {
        this.attributes = { health: 55 + r(), intelligence: 60 + r(), charisma: 55 + r(), wealth: 50 + r(), happiness: 50 + r(), social: 50 + r() }
      }
      for (const k of Object.keys(this.attributes)) this.attributes[k] = Math.max(0, Math.min(100, this.attributes[k]))
      this.relationships = []; this.npcBonds = []; this.memories = []; this.recentEvents = []
      this.currentNarrative = ''; this.currentOptions = []; this.currentMood = '期待'
      this.streamingNarrative = ''; this.isStreaming = false; this.lastRandomEvent = null
      this.timeline = []; this.milestones = []; this.attributeHistory = []; this.moodHistory = []
      this.career = ''; this.location = ''; this.family = { spouse: null, children: [] }
      this.lifeStats = { totalChoices: 0, positiveEvents: 0, negativeEvents: 0, npcMet: 0, highestAttribute: '', lowestAttribute: '' }
      // 新系统重置
      this.skills = { technology: { level: 0, exp: 0 }, communication: { level: 0, exp: 0 }, creativity: { level: 0, exp: 0 }, fitness: { level: 0, exp: 0 }, business: { level: 0, exp: 0 }, academic: { level: 0, exp: 0 } }
      this.careerPath = null; this.assets = []; this.npcMemories = {}; this.npcProactiveEvent = null
      this.isPlaying = true; this.isGameOver = false; this.gameOverReason = ''
      this.recordSnapshot()
    },

    recordSnapshot() {
      this.attributeHistory.push({ totalMonths: this.totalMonths, ...this.attributes })
      this.moodHistory.push({ totalMonths: this.totalMonths, mood: this.currentMood })
    },

    updateLifeStats() {
      const entries = Object.entries(this.attributes)
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
      if (ageAfter != null && typeof ageAfter === 'number' && ageAfter > this.age) {
        const yearDiff = ageAfter - this.age
        monthsToAdd = yearDiff * 12 - this.month + 1
        if (monthsToAdd < 1) monthsToAdd = 12 * yearDiff
        monthsToAdd = Math.min(monthsToAdd, 1200)
      } else if (aiTimeSkip && aiTimeSkip > 1) {
        monthsToAdd = Math.min(Math.round(aiTimeSkip), 120)
      } else {
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

    parseAgeFromInput(input, currentAge) {
      if (!input) return null
      const ageMatch = input.match(/(?:我|到|快进到|跳到|已经|现在)?(\d{1,3})岁/)
      if (ageMatch) { const t = parseInt(ageMatch[1]); if (t > currentAge && t <= 120) return t }
      const yearsLater = input.match(/(\d{1,3})年(?:后|之后|以后)/)
      if (yearsLater) { const y = parseInt(yearsLater[1]); if (y > 0 && y <= 100) return currentAge + y }
      const kwMap = [
        [/读完大学|大学毕业|毕业了/, 22], [/读完高中|高中毕业/, 18],
        [/读完初中|初中毕业/, 15], [/读完小学|小学毕业/, 12],
        [/长大成人|成年/, 18], [/退休/, 60],
        [/上小学/, 6], [/上初中/, 12], [/上高中/, 15], [/上大学|考上大学/, 18],
      ]
      for (const [re, targetAge] of kwMap) {
        if (re.test(input) && targetAge > currentAge) return targetAge
      }
      return null
    },

    generateChildAttributes() {
      const a = this.attributes
      const inherit = (key) => {
        const parentVal = a[key] || 50
        const base = parentVal * (0.4 + Math.random() * 0.2)
        const mutation = (Math.random() - 0.5) * 30
        return Math.max(10, Math.min(90, Math.round(base + mutation)))
      }
      const potential = {
        health: inherit('health'), intelligence: inherit('intelligence'),
        charisma: inherit('charisma'), wealth: 0, happiness: inherit('happiness'), social: inherit('social'),
      }
      const parentTraits = this.character.personality || []
      const allTraits = ['勇敢', '谨慎', '善良', '冷酷', '聪明', '天真', '幽默', '严肃', '浪漫', '务实', '叛逆', '温顺']
      const numInherit = Math.min(parentTraits.length, 1 + Math.floor(Math.random() * 2))
      const shuffled = [...parentTraits].sort(() => Math.random() - 0.5)
      const inherited = shuffled.slice(0, numInherit)
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

    // ═══ 随机事件系统 ═══
    rollRandomEvent() {
      this.lastRandomEvent = null
      // 15% 基础触发率
      if (Math.random() > 0.15) return null
      const eligible = RANDOM_EVENTS.filter(e => {
        if (this.age < e.minAge || this.age > e.maxAge) return false
        if (e.rare && Math.random() > 0.3) return false // 稀有事件额外30%
        return true
      })
      if (!eligible.length) return null
      const event = eligible[Math.floor(Math.random() * eligible.length)]
      // 应用属性变化
      if (event.changes) {
        for (const [k, v] of Object.entries(event.changes)) {
          if (this.attributes[k] !== undefined) {
            this.attributes[k] = Math.max(0, Math.min(100, this.attributes[k] + v))
          }
        }
      }
      this.lastRandomEvent = { ...event, age: this.age }
      return event
    },

    // ═══ 流式输出中提取叙事 ═══
    extractNarrativeFromStream(fullText) {
      const idx = fullText.indexOf('"narrative"')
      if (idx === -1) return ''
      let colonIdx = fullText.indexOf(':', idx + 11)
      if (colonIdx === -1) return ''
      let start = colonIdx + 1
      while (start < fullText.length && (fullText[start] === ' ' || fullText[start] === '\n')) start++
      if (fullText[start] !== '"') return ''
      start++
      let result = ''
      let i = start
      while (i < fullText.length) {
        if (fullText[i] === '\\' && i + 1 < fullText.length) {
          const next = fullText[i + 1]
          if (next === 'n') result += '\n'
          else if (next === '"') result += '"'
          else if (next === '\\') result += '\\'
          else if (next === 't') result += '\t'
          else result += next
          i += 2
        } else if (fullText[i] === '"') {
          break
        } else {
          result += fullText[i]
          i++
        }
      }
      return result
    },

    // ═══ AI Prompts ═══
    buildSystemPrompt() {
      return `你是「人生进程」模拟人生游戏的叙事引擎。你要为玩家创造身临其境的人生故事。

## 核心规则
1. 叙事200-500字，要有画面感、对话、内心独白，像文学作品
2. 根据角色性格和当前处境合理推进，不要突兀转折
3. 保持世界观和人物性格一致性
4. 属性每次变化 -15 到 +15，重大事件可更大
5. 根据人生阶段调整叙事风格：
   - 婴幼儿(0-3岁)：以第三人称旁白讲述，从父母视角描写婴儿成长
   - 幼儿(3-6岁)：幼儿园、家庭互动、对世界的好奇探索
   - 童年(6-12岁)：小学生活、友谊、梦想萌芽
   - 少年(12-18岁)：中学、叛逆期、初恋、自我意识觉醒
   - 青年(18-30岁)：求学/恋爱/求职/独立
   - 壮年(30-50岁)：事业/家庭/子女教育/中年危机
   - 中老年(50+)：健康/退休/传承/回忆
6. 制造戏剧张力：伏笔、冲突、温情、意外
7. 3个选项要有实质差异，体现不同价值观
8. NPC应有鲜明性格、年龄和职业
9. 对话用「」标注，内心活动用"……"省略号渲染
10. 当发生人生重大转折时，请在 milestone 字段标记
11. NPC之间也有关系——在npc_bonds字段描述
12. 当角色结婚生子时，在family_event字段返回家庭事件
13. **时间跳跃**：根据玩家行动的语义决定时间推进
14. 根据剧情合理分配技能经验（skill_changes字段）。技能有：technology(科技), communication(沟通), creativity(创造力), fitness(体能), business(商业), academic(学术)。每次给3-10经验，20经验升1级
15. 当情节涉及获得或失去重要物品/资产时，返回asset_event字段
16. NPC应有延续性——对同一个NPC的描述要保持性格和记忆的一致性

## 叙事风格
- 运用五感描写
- 细节决定质量：天气、表情、小动作
- 适当留白
- NPC对话要有个性化的语气

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

      const skillsInfo = Object.entries(this.skills).map(([k, s]) =>
        `${SKILL_DEFS[k]?.label || k}:Lv${s.level}`).join(' | ')
      const assetsInfo = this.assets.length > 0
        ? this.assets.map(a => `${a.icon}${a.name}`).join('、')
        : '暂无'

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
## 技能等级：${skillsInfo}
## 拥有资产：${assetsInfo}
## 人际关系：${relInfo}
## NPC之间的关系：${bondsInfo}
## 家庭：${familyInfo}
## 已达成里程碑：${milestoneList}

## 近期经历
${recentMemory || (this.age === 0 ? '一个新生命刚刚来到这个世界' : this.age < 6 ? `${this.character.name}是一个${this.age}岁的孩子` : this.age < 18 ? `${this.character.name}正处于${this.age}岁的少年时期` : '刚刚开始新的人生旅程')}

## 重要记忆
${importantMemory || '尚无重要记忆'}

## 本回合
${playerAction ? `玩家选择：${playerAction}\n\n⚠️ 时间跳跃指令：仔细分析玩家输入中是否隐含时间跨度。\n如果玩家提到了具体年龄（如"我X岁了""到X岁"），请设置 age_after 为该年龄。\n如果隐含时间跨度（如"读完大学""工作三年"），请设置 age_after 为合理的目标年龄。\n当前角色 ${this.age} 岁，age_after 必须 >= ${this.age}。` : '自动推进（age_after设为null）'}

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
  "location_update": null,
  "skill_changes": {"technology":0,"communication":0,"creativity":0,"fitness":0,"business":0,"academic":0},
  "asset_event": null
}

new_relationships 格式：{"name":"姓名","relation":"关系","affection":50,"personality":"简短性格","age":25,"status":"当前状态"}
npc_bonds 格式：[{"from":"NPC名","to":"NPC名","type":"关系描述","tension":0}]
family_event 格式（仅发生家庭事件时）：{"type":"marry/child/divorce/death","target":"对象名","child_name":"孩子名(生子时)","child_gender":"男/女(生子时)"}
milestone 格式（仅重大事件时）：{"title":"里程碑名","icon":"emoji","description":"一句话描述"}
skill_changes 格式：各技能获得的经验值（3-10），0=无变化
asset_event 格式（仅获得/失去资产时）：{"action":"acquire/sell","asset_id":"ID","description":"描述"}
可选asset_id: apartment, house, mansion, bicycle, car, sports_car, painting, antique, watch, jewelry, yacht

**【重要】时间跳跃相关字段：**
age_after：本回合故事结束后角色应该是几岁（整数）。
  - 如果玩家说"我12岁了"或"到12岁"，age_after应该设为12
  - 如果玩家说"读完大学"且当前18岁，age_after应该设为22
  - 如果玩家说"三年后"且当前25岁，age_after应该设为28
  - 如果是普通日常推进，age_after设为null
  - age_after不能小于当前年龄
time_skip：备用字段，推进月数。仅当age_after为null时生效。默认1`
    },

    // ═══ 核心游戏循环（流式输出） ═══
    async playTurn(playerAction = null) {
      this.isLoading = true
      this.isStreaming = true
      this.streamingNarrative = ''
      this.lastRandomEvent = null
      try {
        const { recent, important } = this.memoryContext
        const messages = [
          { role: 'system', content: this.buildSystemPrompt() },
          { role: 'user', content: this.buildTurnPrompt(playerAction, recent, important) }
        ]

        // 流式请求，实时提取叙事
        const result = await aiService.chatStreamJSON(messages, {}, (fullText) => {
          const narrative = this.extractNarrativeFromStream(fullText)
          if (narrative) this.streamingNarrative = narrative
        })

        this.isStreaming = false
        this.currentNarrative = result.narrative || '这个月平静地度过了……'
        this.currentOptions = result.options || ['继续生活', '做出改变', '随遇而安']
        this.currentMood = result.mood || '平静'

        if (result.attribute_changes) this.applyAttributeChanges(result.attribute_changes)

        if (result.new_relationships && Array.isArray(result.new_relationships)) {
          for (const rel of result.new_relationships) {
            if (!rel.name) continue
            const existing = this.relationships.find(r => r.name === rel.name)
            if (existing) Object.assign(existing, rel)
            else {
              this.relationships.push({
                name: rel.name, relation: rel.relation || '认识的人',
                affection: rel.affection ?? 50, personality: rel.personality || '',
                age: rel.age || null, status: rel.status || '',
              })
              this.lifeStats.npcMet++
            }
          }
        }

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

        if (result.family_event && result.family_event.type) {
          const fe = result.family_event
          if (fe.type === 'marry' && fe.target) this.family.spouse = fe.target
          else if (fe.type === 'child' && fe.child_name) {
            const childAttrs = this.generateChildAttributes()
            this.family.children.push({
              name: fe.child_name, gender: fe.child_gender || '未知',
              birthAge: this.age, age: 0, inheritedTraits: childAttrs.traits, potential: childAttrs.potential,
            })
          } else if (fe.type === 'divorce') this.family.spouse = null
        }

        if (this.family.children.length > 0) {
          for (const child of this.family.children) child.age = this.age - child.birthAge
        }

        if (result.milestone && result.milestone.title) {
          this.milestones.push({ ...result.milestone, age: this.age, month: this.month })
        }

        if (result.career_update) this.career = result.career_update
        if (result.location_update) this.location = result.location_update

        // 技能经验
        if (result.skill_changes) this.applySkillChanges(result.skill_changes)
        this.autoSkillExp(result.scene_type || 'leisure')

        // 资产事件
        if (result.asset_event) this.processAssetEvent(result.asset_event)

        if (playerAction) this.lifeStats.totalChoices++
        const changes = result.attribute_changes || {}
        const total = Object.values(changes).reduce((s, v) => s + v, 0)
        if (total > 0) this.lifeStats.positiveEvents++
        else if (total < 0) this.lifeStats.negativeEvents++

        this.addMemory({
          month: this.totalMonths,
          summary: result.narrative_summary || result.narrative?.substring(0, 80) + '...',
          detail: result.narrative, importance: result.importance || 5
        })

        this.addTimelineEntry({
          title: result.title || '日常', narrative: result.narrative,
          choice: playerAction, mood: result.mood,
          sceneType: result.scene_type || 'leisure', weather: result.weather || ''
        })

        // 智能时间跳跃
        let finalAgeAfter = null
        const aiAge = (typeof result.age_after === 'number' && result.age_after > this.age) ? result.age_after : null
        const parsedAge = playerAction ? this.parseAgeFromInput(playerAction, this.age) : null
        if (aiAge && parsedAge) finalAgeAfter = Math.max(aiAge, parsedAge)
        else finalAgeAfter = parsedAge || aiAge || null

        this.advanceTime(result.time_skip, finalAgeAfter)
        this.recordSnapshot()
        this.updateLifeStats()

        // 随机事件
        this.rollRandomEvent()

        // NPC 深度交互
        this.rollNpcProactive()
        this.decayRelationships()

        // NPC 记忆
        if (result.new_relationships) {
          for (const rel of result.new_relationships) {
            if (rel.name) this.addNpcMemory(rel.name, result.narrative_summary || result.title || '')
          }
        }

        // 成就检测
        this.checkAchievements()

        if (this.settings.autoSave) this.saveGame()

      } catch (error) {
        console.error('AI turn failed:', error)
        this.isStreaming = false
        this.currentNarrative = '【系统提示】AI 响应出错，请检查网络和API设置。\n\n错误：' + error.message
        this.currentOptions = ['重试本回合']
      } finally {
        this.isLoading = false
      }
    },

    // ═══ 技能系统 ═══
    applySkillChanges(changes) {
      if (!changes || typeof changes !== 'object') return
      for (const [key, exp] of Object.entries(changes)) {
        if (!this.skills[key] || !exp) continue
        this.skills[key].exp += Math.abs(exp)
        const maxExp = (this.skills[key].level + 1) * 20
        while (this.skills[key].exp >= maxExp && this.skills[key].level < 10) {
          this.skills[key].exp -= (this.skills[key].level + 1) * 20
          this.skills[key].level++
        }
        if (this.skills[key].level >= 10) this.skills[key].exp = 0
      }
    },

    // 根据场景类型自动获得技能经验
    autoSkillExp(sceneType) {
      const map = {
        work: { business: 5, communication: 3 },
        study: { academic: 6, technology: 3 },
        love: { communication: 4, creativity: 2 },
        adventure: { fitness: 5, creativity: 3 },
        family: { communication: 3, business: 2 },
        health: { fitness: 4 },
        social: { communication: 5, business: 2 },
        crisis: { fitness: 3, communication: 2 },
        leisure: { creativity: 4 },
        milestone: { academic: 3, business: 3 },
      }
      const gains = map[sceneType]
      if (gains) this.applySkillChanges(gains)
    },

    // ═══ 资产系统 ═══
    acquireAsset(assetId) {
      const def = ASSET_CATALOG[assetId]
      if (!def) return false
      if (this.assets.find(a => a.id === assetId)) return false // 已拥有
      this.assets.push({ id: assetId, ...def, acquiredAge: this.age })
      return true
    },
    sellAsset(assetId) {
      const idx = this.assets.findIndex(a => a.id === assetId)
      if (idx === -1) return false
      this.assets.splice(idx, 1)
      return true
    },
    // AI 返回的资产事件
    processAssetEvent(event) {
      if (!event) return
      if (event.action === 'acquire' && event.asset_id) this.acquireAsset(event.asset_id)
      else if (event.action === 'sell' && event.asset_id) this.sellAsset(event.asset_id)
    },

    // ═══ NPC 深度系统 ═══
    addNpcMemory(npcName, event) {
      if (!this.npcMemories[npcName]) this.npcMemories[npcName] = []
      this.npcMemories[npcName].push({ age: this.age, event })
      // 保留最近20条
      if (this.npcMemories[npcName].length > 20) this.npcMemories[npcName].shift()
    },
    // NPC 主动互动事件（10%概率）
    rollNpcProactive() {
      this.npcProactiveEvent = null
      if (this.relationships.length < 1 || Math.random() > 0.10) return
      const npc = this.relationships[Math.floor(Math.random() * this.relationships.length)]
      const events = [
        `${npc.name}给你发了一条消息，想约你出来聊聊`,
        `${npc.name}邀请你参加一个聚会`,
        `你收到了${npc.name}寄来的一份小礼物`,
        `${npc.name}在朋友圈提到了你`,
        `${npc.name}向你求助一件事`,
      ]
      const text = events[Math.floor(Math.random() * events.length)]
      this.npcProactiveEvent = { npcName: npc.name, text, icon: '💬' }
      // 增加好感度
      npc.affection = Math.min(100, (npc.affection || 50) + 2)
      this.addNpcMemory(npc.name, text)
    },
    // 关系随时间自然衰减
    decayRelationships() {
      for (const r of this.relationships) {
        if (r.affection > 30 && Math.random() < 0.3) {
          r.affection = Math.max(20, r.affection - 1)
        }
      }
    },

    // ═══ 成就系统 ═══
    checkAchievements() {
      const unlocked = JSON.parse(localStorage.getItem('lifeprocess_achievements') || '{}')
      let newlyUnlocked = []
      const checks = {
        first_step: () => true,
        age_100: () => this.age >= 100,
        age_80: () => this.age >= 80,
        first_love: () => this.relationships.some(r => ['恋人', '男友', '女友', '伴侣'].some(k => r.relation?.includes(k))),
        married: () => !!this.family.spouse,
        parent: () => this.family.children.length > 0,
        big_family: () => this.family.children.length >= 3,
        social_butterfly: () => this.lifeStats.npcMet >= 20,
        rich: () => this.attributes.wealth >= 90,
        genius: () => this.attributes.intelligence >= 95,
        all_max: () => Object.values(this.attributes).every(v => v >= 70),
        ceo_life: () => this.career?.includes('CEO'),
        professor_life: () => this.career?.includes('教授'),
        champion_life: () => this.career?.includes('冠军'),
        five_milestones: () => this.milestones.length >= 5,
        ten_milestones: () => this.milestones.length >= 10,
        max_score: () => this.lifeScore >= 85,
        skill_master: () => Object.values(this.skills).some(s => s.level >= 8),
        asset_collector: () => this.assets.length >= 5,
      }
      for (const [id, check] of Object.entries(checks)) {
        if (!unlocked[id]) {
          try { if (check()) { unlocked[id] = new Date().toISOString(); newlyUnlocked.push(id) } } catch {}
        }
      }
      // 四世界成就特殊处理
      if (!unlocked.four_worlds) {
        const worlds = JSON.parse(localStorage.getItem('lifeprocess_worlds_played') || '[]')
        if (!worlds.includes(this.world.setting)) {
          worlds.push(this.world.setting)
          localStorage.setItem('lifeprocess_worlds_played', JSON.stringify(worlds))
        }
        if (worlds.length >= 4) { unlocked.four_worlds = new Date().toISOString(); newlyUnlocked.push('four_worlds') }
      }
      // 轮回成就
      if (!unlocked.ten_lives) {
        const count = parseInt(localStorage.getItem('lifeprocess_lives_count') || '0')
        if (count >= 10) { unlocked.ten_lives = new Date().toISOString(); newlyUnlocked.push('ten_lives') }
      }
      localStorage.setItem('lifeprocess_achievements', JSON.stringify(unlocked))
      return newlyUnlocked.map(id => ACHIEVEMENT_DEFS.find(a => a.id === id)).filter(Boolean)
    },

    // 记录完成一次人生
    recordLifeComplete() {
      const count = parseInt(localStorage.getItem('lifeprocess_lives_count') || '0') + 1
      localStorage.setItem('lifeprocess_lives_count', String(count))
    },

    // ═══ 人生报告 AI 总评 ═══
    async generateLifeReview() {
      try {
        const prompt = `你是一位人生回顾大师。请根据以下人生数据，用200-300字写一段深刻而感人的人生总评。要有文学性，有感悟，让人读了会有触动。

角色：${this.character.name}，${this.character.gender}
世界：${this.world.settingLabel}
活了${this.age}岁
职业：${this.career || '无固定职业'}
配偶：${this.family.spouse || '未婚'}
子女：${this.family.children.length}个
认识了${this.relationships.length}个人
达成了${this.milestones.length}个里程碑
关键里程碑：${this.milestones.slice(0, 5).map(m => m.title).join('、') || '无'}
人生评分：${this.lifeScore}/100
主导情绪：${this.dominantMood}
性格特征：${this.character.personality.join('、')}

请直接写总评文字，不要任何格式标记。`
        return await aiService.chat([
          { role: 'system', content: '你是一位富有洞察力的人生回顾大师，善于用优美的文字总结一个人的一生。' },
          { role: 'user', content: prompt }
        ], { max_tokens: 500, temperature: 0.9 })
      } catch (e) {
        return `${this.character.name}的一生，如同一首独特的乐章。${this.age}年的岁月里，有欢笑也有泪水，有收获也有遗憾。每一个选择都铸就了这段不可复制的人生旅程。`
      }
    },

    // ═══ 多存档系统 ═══
    getSaveSlotKey(slotId) {
      const baseKey = wallet.getSaveKey()
      const id = slotId ?? this.currentSlotId
      return id === 0 ? baseKey : `${baseKey}_s${id}`
    },

    listSaveSlots() {
      const slots = []
      for (let i = 0; i < 5; i++) {
        const key = this.getSaveSlotKey(i)
        const raw = localStorage.getItem(key)
        if (raw) {
          try {
            const d = JSON.parse(raw)
            slots.push({
              slotId: i, key,
              name: d.character?.name || '未知', age: d.age || 0,
              world: d.world?.settingLabel || '未知', savedAt: d.savedAt || '',
              lifeScore: d.attributes ? Math.round(Object.values(d.attributes).reduce((a, b) => a + b, 0) / 6) : 0,
              avatar: d.character?.avatar || '',
            })
          } catch { /* skip */ }
        } else {
          slots.push({ slotId: i, key, empty: true })
        }
      }
      return slots
    },

    saveGame(slotId) {
      const saveData = {
        character: this.character, attributes: this.attributes, world: this.world,
        age: this.age, month: this.month, totalMonths: this.totalMonths,
        relationships: this.relationships, npcBonds: this.npcBonds,
        memories: this.memories, recentEvents: this.recentEvents,
        currentNarrative: this.currentNarrative, currentOptions: this.currentOptions,
        currentMood: this.currentMood, timeline: this.timeline, milestones: this.milestones,
        career: this.career, location: this.location, family: this.family,
        attributeHistory: this.attributeHistory, moodHistory: this.moodHistory, lifeStats: this.lifeStats,
        skills: this.skills, careerPath: this.careerPath,
        assets: this.assets, npcMemories: this.npcMemories,
        isPlaying: this.isPlaying, isGameOver: this.isGameOver, gameOverReason: this.gameOverReason,
        settings: this.settings,
        savedAt: new Date().toISOString(), walletAddress: wallet.state.address || '',
      }
      const key = this.getSaveSlotKey(slotId ?? this.currentSlotId)
      localStorage.setItem(key, JSON.stringify(saveData))
    },

    loadGame(customKey, slotId) {
      if (slotId !== undefined) this.currentSlotId = slotId
      const key = customKey || this.getSaveSlotKey(slotId ?? this.currentSlotId)
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

    hasSaveData(slotId) {
      return !!localStorage.getItem(this.getSaveSlotKey(slotId ?? this.currentSlotId))
    },

    deleteSave(slotId) {
      localStorage.removeItem(this.getSaveSlotKey(slotId ?? this.currentSlotId))
    },

    getSaveInfo(slotId) {
      const data = localStorage.getItem(this.getSaveSlotKey(slotId ?? this.currentSlotId))
      if (!data) return null
      try {
        const s = JSON.parse(data)
        return {
          characterName: s.character?.name || '未知', age: s.age || 0,
          world: s.world?.settingLabel || '未知', savedAt: s.savedAt || '',
          walletAddress: s.walletAddress || '', avatar: s.character?.avatar || '',
        }
      } catch { return null }
    },
  }
})
