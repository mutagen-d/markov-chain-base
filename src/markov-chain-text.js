const { MarkovChainBase, NGRAM_ORDER_DEFAULT } = require('./markov-chain-base');
const { MarkovChainTextTool: MarkovChainTextTool } = require('./markov-chain-text-tool');

/**
 * @typedef {import('./markov-chain-base').IMarkovChainBaseParams & {
 *  textTool?: import('./markov-chain-text-tool').ITextTool
 * }} IMarkovChainTextParams
 */

/**
 * Markov-chain text generator
 */
class MarkovChainText extends MarkovChainBase {
  /**
   * @param {number} [n] n-gram, default `2`
   * @param {IMarkovChainTextParams} [params]
   */
  constructor(n = NGRAM_ORDER_DEFAULT, params = null) {
    super(n, params)
    params = params || {}
    /** @private */
    this.textTool = new MarkovChainTextTool(params.textTool);
  }

  /** 
   * @param {string | string[]} text
   */
  train(text) {
    const words = this.textTool.tokenize(text)
    return super.train(words)
  }

  /** 
   * @param {string | string[]} initialTextOrWords input text to continue
   * @param {number | (generatedWords: string[], iterationIndex: number) => boolean} [numStepsOrStopCondition] number of generation steps or stop condition (default `1`)
   */
  generate(initialTextOrWords, numStepsOrStopCondition = 1) {
    const words = this.textTool.tokenize(initialTextOrWords)
    const generatedText = super.generate(words, numStepsOrStopCondition)
    return this.textTool.join(generatedText)
  }

  /**
   * @param {string | string[]} initialTextOrWords input text to continue
   * @param {number} [numSentences] amount of sentences to return (default `1`)
   */
  generateSentence(initialTextOrWords, numSentences = 1) {
    const stopCondition = (generatedWords) => this.textTool.countSentences(generatedWords) < numSentences
    return this.generate(initialTextOrWords, stopCondition)
  }
}

module.exports = { MarkovChainText }
