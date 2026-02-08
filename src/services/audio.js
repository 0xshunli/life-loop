/**
 * 音效系统 — 基于 Web Audio API 的程序化音频
 * 无需外部音频文件，全部实时生成
 */
class AudioService {
  constructor() {
    this.ctx = null
    this.masterGain = null
    this.bgmGain = null
    this.sfxGain = null
    this.bgmNodes = null
    this.enabled = localStorage.getItem('audio_enabled') !== 'false'
    this.bgmVolume = parseFloat(localStorage.getItem('audio_bgm_vol') || '0.25')
    this.sfxVolume = parseFloat(localStorage.getItem('audio_sfx_vol') || '0.5')
  }

  init() {
    if (this.ctx) return
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)()
      this.masterGain = this.ctx.createGain()
      this.masterGain.gain.value = this.enabled ? 1 : 0
      this.masterGain.connect(this.ctx.destination)

      this.bgmGain = this.ctx.createGain()
      this.bgmGain.gain.value = this.bgmVolume
      this.bgmGain.connect(this.masterGain)

      this.sfxGain = this.ctx.createGain()
      this.sfxGain.gain.value = this.sfxVolume
      this.sfxGain.connect(this.masterGain)
    } catch { /* Web Audio not supported */ }
  }

  _ensure() {
    if (!this.ctx) this.init()
    if (this.ctx?.state === 'suspended') this.ctx.resume()
    return !!this.ctx
  }

  // ═══ 设置 ═══
  setEnabled(v) {
    this.enabled = v
    localStorage.setItem('audio_enabled', v)
    if (this.masterGain) this.masterGain.gain.setTargetAtTime(v ? 1 : 0, this.ctx.currentTime, 0.3)
    if (!v) this.stopBGM()
  }
  setBGMVolume(v) {
    this.bgmVolume = v
    localStorage.setItem('audio_bgm_vol', v)
    if (this.bgmGain) this.bgmGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
  }
  setSFXVolume(v) {
    this.sfxVolume = v
    localStorage.setItem('audio_sfx_vol', v)
    if (this.sfxGain) this.sfxGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.1)
  }

  // ═══ BGM: 程序化环境音 ═══
  playBGM(world, sceneType) {
    if (!this.enabled || !this._ensure()) return
    this.stopBGM()

    const WT = {
      modern:  { base: 110, type: 'sine',     flt: 600  },
      ancient: { base: 82,  type: 'triangle', flt: 400  },
      fantasy: { base: 130, type: 'sine',     flt: 800  },
      scifi:   { base: 65,  type: 'sawtooth', flt: 1200 },
    }
    const SM = {
      work: 0, love: 300, study: 100, adventure: -200,
      family: 200, health: -100, social: 400, crisis: -400,
      leisure: 50, milestone: 500,
    }
    const wt = WT[world] || WT.modern
    const detune = SM[sceneType] ?? 50
    const t = this.ctx.currentTime

    // 主音
    const osc1 = this.ctx.createOscillator()
    osc1.type = wt.type; osc1.frequency.value = wt.base; osc1.detune.value = detune

    // 低音
    const osc2 = this.ctx.createOscillator()
    osc2.type = 'sine'; osc2.frequency.value = wt.base / 2

    // 泛音
    const osc3 = this.ctx.createOscillator()
    osc3.type = 'sine'; osc3.frequency.value = wt.base * 3
    const g3 = this.ctx.createGain(); g3.gain.value = 0.04

    // 滤波器
    const filter = this.ctx.createBiquadFilter()
    filter.type = 'lowpass'; filter.frequency.value = wt.flt; filter.Q.value = 1.5

    // LFO — 缓慢呼吸感
    const lfo = this.ctx.createOscillator(); lfo.frequency.value = 0.12
    const lfoG = this.ctx.createGain(); lfoG.gain.value = 25
    lfo.connect(lfoG); lfoG.connect(filter.frequency)

    // 延迟 — 空间感
    const delay = this.ctx.createDelay(); delay.delayTime.value = 0.35
    const dG = this.ctx.createGain(); dG.gain.value = 0.15

    // 连接
    osc1.connect(filter); osc2.connect(filter)
    osc3.connect(g3); g3.connect(filter)
    filter.connect(this.bgmGain)
    filter.connect(delay); delay.connect(dG); dG.connect(this.bgmGain)

    // 淡入
    this.bgmGain.gain.setValueAtTime(0, t)
    this.bgmGain.gain.linearRampToValueAtTime(this.bgmVolume, t + 2.5)

    osc1.start(t); osc2.start(t); osc3.start(t); lfo.start(t)
    this.bgmNodes = [osc1, osc2, osc3, lfo]
  }

  stopBGM() {
    if (!this.bgmNodes || !this.ctx) return
    const t = this.ctx.currentTime
    this.bgmGain.gain.setTargetAtTime(0, t, 0.5)
    const nodes = this.bgmNodes
    this.bgmNodes = null
    setTimeout(() => {
      nodes.forEach(n => { try { n.stop() } catch {} })
      if (this.bgmGain) this.bgmGain.gain.value = this.bgmVolume
    }, 2500)
  }

  // ═══ 音效 ═══
  /** UI 点击 */
  playClick() {
    if (!this.enabled || !this._ensure()) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = 880
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06)
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.06)
  }

  /** 属性通知：正面/负面 */
  playNotify(positive = true) {
    if (!this.enabled || !this._ensure()) return
    const notes = positive ? [523, 659, 784] : [392, 330, 262]
    notes.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.1
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
      o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.2)
    })
  }

  /** 里程碑 */
  playMilestone() {
    if (!this.enabled || !this._ensure()) return
    const notes = [523, 659, 784, 1047]
    notes.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.15
      const o = this.ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = f
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.12, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.45)
      o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.45)
    })
  }

  /** 游戏结束 */
  playGameOver() {
    if (!this.enabled || !this._ensure()) return
    const notes = [392, 349, 330, 262]
    notes.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.35
      const o = this.ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.1, t + 0.04)
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
      o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.7)
    })
  }

  /** 新回合 */
  playNewTurn() {
    if (!this.enabled || !this._ensure()) return
    const t = this.ctx.currentTime
    const o = this.ctx.createOscillator(); o.type = 'sine'
    o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.12)
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
    o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.15)
  }

  /** 随机事件 */
  playRandomEvent() {
    if (!this.enabled || !this._ensure()) return
    const notes = [660, 880, 660]
    notes.forEach((f, i) => {
      const t = this.ctx.currentTime + i * 0.08
      const o = this.ctx.createOscillator(); o.type = 'square'; o.frequency.value = f
      const g = this.ctx.createGain()
      g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1)
      o.connect(g); g.connect(this.sfxGain); o.start(t); o.stop(t + 0.1)
    })
  }
}

export const audioService = new AudioService()
export default audioService
