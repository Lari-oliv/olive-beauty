// Types for pending actions
export type PendingActionType = 'addToCart' | 'addToFavorites' | 'buyNow'

export interface PendingAction {
  type: PendingActionType
  productId: string
  productVariantId?: string
  quantity?: number
  url: string // URL where the action was attempted
}

const PENDING_ACTION_KEY = 'pending_action'
const PENDING_ACTION_EXPIRY = 30 * 60 * 1000 // 30 minutes

interface StoredPendingAction extends PendingAction {
  timestamp: number
}

/**
 * Save a pending action to localStorage
 */
export function savePendingAction(action: PendingAction): void {
  const stored: StoredPendingAction = {
    ...action,
    timestamp: Date.now(),
  }
  localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(stored))
}

/**
 * Get and clear pending action from localStorage
 */
export function getAndClearPendingAction(): PendingAction | null {
  try {
    const stored = localStorage.getItem(PENDING_ACTION_KEY)
    if (!stored) return null

    const action: StoredPendingAction = JSON.parse(stored)
    
    // Check if action has expired
    if (Date.now() - action.timestamp > PENDING_ACTION_EXPIRY) {
      localStorage.removeItem(PENDING_ACTION_KEY)
      return null
    }

    // Clear the action
    localStorage.removeItem(PENDING_ACTION_KEY)

    // Return action without timestamp
    const { timestamp, ...actionWithoutTimestamp } = action
    return actionWithoutTimestamp
  } catch (error) {
    console.error('Error getting pending action:', error)
    localStorage.removeItem(PENDING_ACTION_KEY)
    return null
  }
}

/**
 * Clear pending action without returning it
 */
export function clearPendingAction(): void {
  localStorage.removeItem(PENDING_ACTION_KEY)
}

