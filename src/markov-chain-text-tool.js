
/**
 * @typedef {{
 *  tokenize?: (text: string) => string[]
 *  join?: (tokens: string[]) => string
 *  countSentences?: (tokens: string[]) => number
 * }} ITextTool
 */

/**
 * Text tokenizer/joiner for markov-chain text generator
 */
class MarkovChainTextTool {
  /**
   * @param {ITextTool} [tool]
   */
  constructor(tool) {
    /** @private */
    this.tool = tool
    /**
     * word separator
     * @private
     */
    this.sep = /(?:\s|\r?\n)+/g
  }

  /**
   * split text into words
   * @param {string | string[]} text
   * @returns {string[]}
   */
  tokenize(text) {
    if (Array.isArray(text)) {
      return text.map(t => this.tokenize(t)).flat()
    }
    const tool = this.tool;
    // custom tokenizer
    if (tool && typeof tool.tokenize === 'function') {
      return tool.tokenize(text)
    }
    // default tokenizer
    const texts = Array.isArray(text) ? text : [text]
    const tokens = texts.map(text => text.split(this.sep)).flat()
    return tokens;
  }

  /**
   * join words into text
   * @param {string | string[]} tokens 
   */
  join(tokens) {
    if (!Array.isArray(tokens)) {
      return tokens;
    }
    const tool = this.tool;
    // custom joiner
    if (tool && typeof tool.join === 'function') {
      return tool.join(tokens)
    }
    // default joiner
    return tokens.join(' ')
  }

  /**
   * count sentences based on counting words ending with dot
   * @param {string | string[]} tokens 
   */
  countSentences(tokens) {
    tokens = this.tokenize(tokens)
    const tool = this.tool;
    // custom counter
    if (tool && typeof tool.countSentences === 'function') {
      return tool.countSentences(tokens)
    }
    // default counter
    return tokens.filter(word => word.endsWith('.')).length
  }
}

module.exports = { MarkovChainTextTool }
