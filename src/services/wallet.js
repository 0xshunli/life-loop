/**
 * 钱包连接服务
 * 支持 MetaMask 及任何 EIP-1193 兼容钱包
 */
import { reactive } from 'vue'

const state = reactive({
  address: localStorage.getItem('wallet_address') || '',
  connected: !!localStorage.getItem('wallet_address'),
  chainId: '',
  error: '',
})

/**
 * 检查是否有可用的钱包提供者
 */
function hasProvider() {
  return typeof window !== 'undefined' && !!window.ethereum
}

/**
 * 连接钱包
 */
async function connect() {
  state.error = ''

  if (!hasProvider()) {
    state.error = '未检测到钱包，请安装 MetaMask'
    throw new Error(state.error)
  }

  try {
    // 请求连接
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    })

    if (accounts.length === 0) {
      state.error = '未授权任何账户'
      throw new Error(state.error)
    }

    state.address = accounts[0].toLowerCase()
    state.connected = true
    localStorage.setItem('wallet_address', state.address)

    // 获取链 ID
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    state.chainId = chainId

    // 监听账户切换
    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return state.address
  } catch (err) {
    if (err.code === 4001) {
      state.error = '用户拒绝了连接请求'
    } else {
      state.error = err.message || '连接失败'
    }
    throw err
  }
}

/**
 * 断开连接（仅清除本地状态，不会断开 MetaMask）
 */
function disconnect() {
  state.address = ''
  state.connected = false
  state.chainId = ''
  state.error = ''
  localStorage.removeItem('wallet_address')

  if (hasProvider()) {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    window.ethereum.removeListener('chainChanged', handleChainChanged)
  }
}

/**
 * 尝试自动重连（如果之前连接过）
 */
async function tryReconnect() {
  if (!hasProvider() || !state.address) return false

  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (accounts.length > 0 && accounts[0].toLowerCase() === state.address) {
      state.connected = true

      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      state.chainId = chainId

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      window.ethereum.on('chainChanged', handleChainChanged)
      return true
    } else {
      // 之前的地址不再授权
      disconnect()
      return false
    }
  } catch {
    return false
  }
}

/**
 * 处理账户切换
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnect()
  } else {
    state.address = accounts[0].toLowerCase()
    localStorage.setItem('wallet_address', state.address)
  }
}

/**
 * 处理链切换
 */
function handleChainChanged(chainId) {
  state.chainId = chainId
}

/**
 * 获取缩短的地址显示
 */
function shortAddress(addr) {
  const a = addr || state.address
  if (!a) return ''
  return a.slice(0, 6) + '···' + a.slice(-4)
}

/**
 * 获取基于钱包地址的存档 key
 */
function getSaveKey() {
  if (state.address) {
    return `lifeprocess_save_${state.address}`
  }
  return 'lifeprocess_save'
}

/**
 * 获取该钱包地址下所有存档列表
 */
function listSaves() {
  const saves = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith('lifeprocess_save_0x')) {
      try {
        const data = JSON.parse(localStorage.getItem(key))
        const addr = key.replace('lifeprocess_save_', '')
        saves.push({
          key,
          address: addr,
          shortAddress: shortAddress(addr),
          characterName: data.character?.name || '未知',
          age: data.age || 0,
          world: data.world?.settingLabel || '未知',
        })
      } catch {
        // skip invalid saves
      }
    }
  }
  return saves
}

export const wallet = {
  state,
  hasProvider,
  connect,
  disconnect,
  tryReconnect,
  shortAddress,
  getSaveKey,
  listSaves,
}

export default wallet
