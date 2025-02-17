const { MarkovChainBase } = require('./markov-chain-base')

/**
 * Markov-chain text generator
 */
class MarkovChainText extends MarkovChainBase {
  /**
   * @param {ConstructorParameters<typeof MarkovChainBase>} args
   */
  constructor(...args) {
    super(...args)
    /**
     * word separator
     * @private
     */
    this.sep = /(?:\s|\r?\n)+/g
  }

  /** 
   * @param {string} text
   */
  train(text) {
    const words = text.split(this.sep)
    return super.train(words)
  }

  /** 
   * @param {string} initialState input text to continue
   * @param {number | (generatedWords: string[], iterationIndex: number) => boolean} [numStepsOrStopCondition] number of generation steps or stop condition (default `1`)
   */
  generate(initialState, numStepsOrStopCondition = 1) {
    const words = initialState.trim().split(this.sep)
    const generatedText = super.generate(words, numStepsOrStopCondition)
    return generatedText.join(' ')
  }

  /**
   * @param {string} initialState input text to continue
   * @param {number} [numSentences] amount of sentences to return (default `1`)
   */
  generateSentence(initialState, numSentences = 1) {
    const stopCondition = (generatedWords) => {
      return generatedWords.filter(word => word.endsWith('.')).length < numSentences
    }
    return this.generate(initialState, stopCondition)
  }
}

module.exports = { MarkovChainText }
