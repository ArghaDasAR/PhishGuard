/**
 * src/services/gemmaAnalyzer.js — Client-Side API Wrapper for Gemma 4 Analyzer
 *
 * Member 3: AI / Social Engineering Analyzer
 *
 * Security:
 * - Never calls Gemini API directly from browser.
 * - Always routes through the serverless endpoint `/api/analyze-gemma`.
 * - Never uses or exposes GEMINI_API_KEY on the client.
 */

const API_ENDPOINT = '/api/analyze-gemma'
const DEFAULT_TIMEOUT_MS = 60000 // 60 seconds timeout for multimodal inference

/**
 * Downscales large images in the browser to optimize AI payload and latency.
 */
export async function prepareImageForAI(dataUrl, maxWidth = 800, maxHeight = 800) {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !dataUrl || !dataUrl.startsWith('data:image')) {
    return dataUrl
  }

  // SVG images do not need canvas rasterization
  if (dataUrl.includes('image/svg+xml')) {
    return dataUrl
  }

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height)
          height = maxHeight
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, width)
      canvas.height = Math.max(1, height)
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(dataUrl)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82)
      resolve(compressedDataUrl)
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

/**
 * Analyzes message text using Gemma 4 via the server-side API.
 *
 * @param {string} text - Untrusted message text to analyze
 * @returns {Promise<Object>} Normalized AI analysis result or fallback error object
 */
export async function analyzeWithGemma(text) {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return {
      success: false,
      aiAvailable: false,
      error: 'Empty text provided for AI analysis',
    }
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceType: 'text',
        text: text.trim(),
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        aiAvailable: false,
        error: `AI analysis service responded with status ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const isTimeout = error?.name === 'AbortError'
    return {
      success: false,
      aiAvailable: false,
      error: isTimeout
        ? 'AI analysis timed out. Showing technical analysis.'
        : 'AI service unreachable. Showing technical analysis.',
    }
  }
}

/**
 * Analyzes a screenshot/image using Gemma 4 multimodal capabilities via the server-side API.
 *
 * @param {string} imageData - Base64 data string or data URL
 * @param {string} [mimeType='image/png'] - Image MIME type hint (auto-detected from data URL)
 * @returns {Promise<Object>} Normalized AI analysis result or fallback error object
 */
export async function analyzeImageWithGemma(imageData, mimeType = 'image/png') {
  if (!imageData || typeof imageData !== 'string') {
    return {
      success: false,
      aiAvailable: false,
      error: 'Invalid image data provided for AI analysis',
    }
  }

  // Auto-detect actual MIME from data URL BEFORE compression (so we know what we have)
  let sourceMime = mimeType
  if (imageData.startsWith('data:image/')) {
    const mimeEnd = imageData.indexOf(';')
    if (mimeEnd !== -1) {
      sourceMime = imageData.substring(5, mimeEnd) // e.g. "image/webp"
    }
  }

  // Compress/downscale for fast inference (canvas always outputs JPEG)
  let finalData = imageData
  try {
    finalData = await prepareImageForAI(imageData)
  } catch {
    finalData = imageData
  }

  // Re-detect MIME from prepared data (canvas may have converted to JPEG)
  let detectedMime = sourceMime
  if (finalData.startsWith('data:image/jpeg') || finalData.startsWith('data:image/jpg')) {
    detectedMime = 'image/jpeg'
  } else if (finalData.startsWith('data:image/webp')) {
    detectedMime = 'image/webp'
  } else if (finalData.startsWith('data:image/png')) {
    detectedMime = 'image/png'
  }

  // Strip data URL prefix (e.g. data:image/png;base64,) to send RAW_BASE64_ONLY
  let rawBase64 = finalData
  if (rawBase64.startsWith('data:')) {
    const commaIndex = rawBase64.indexOf(',')
    if (commaIndex !== -1) {
      rawBase64 = rawBase64.substring(commaIndex + 1)
    }
  }
  rawBase64 = rawBase64.replace(/\s+/g, '')

  if (!rawBase64) {
    return {
      success: false,
      aiAvailable: false,
      error: 'Empty image base64 data payload',
    }
  }

  // Safe development logging — never log the actual image or base64 data
  if (import.meta.env.DEV) {
    console.log('[PhishGuard Client]', {
      sourceType: 'image',
      imagePresent: true,
      mimeType: detectedMime,
      base64Length: rawBase64.length,
    })
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sourceType: 'image',
        image: {
          data: rawBase64,
          mimeType: detectedMime,
        },
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return {
        success: false,
        aiAvailable: false,
        error: `AI image screening responded with status ${response.status}`,
      }
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    const isTimeout = error?.name === 'AbortError'
    return {
      success: false,
      aiAvailable: false,
      error: isTimeout
        ? 'AI image screening timed out.'
        : 'AI image screening unreachable.',
    }
  }
}
