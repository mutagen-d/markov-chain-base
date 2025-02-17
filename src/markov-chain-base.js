/** @type {'markov-chain-base'} */
const MarkovChainBaseJsonName = 'markov-chain-base'

/**
 * @typedef {{
 *  [nGramKey: string]: Array<[string, number]>
 * }} IMarkovChainTransitions
 */

/**
 * @typedef {{
 *  type: MarkovChainBaseJsonName
 *  n: number;
 *  transitions: IMarkovChainTransitions
 * }} IMarkovChainBaseJson
 */

/**
 * @typedef {{
 *  save: <T extends MarkovChainBase>(markovChain: T) => Promise<any>
 *  load: <T extends MarkovChainBase>(markovChain: T) => Promise<any>
 * }} IMarkovChainPersistence
 */

class MarkovChainBase {
  /**
   * @param {number} [n] n-gram size (default `2`)
   * @param {IMarkovChainPersistence} persistence 
   */
  constructor(n = 2, persistence = null) {
    /** @type {number} */
    this.n = Math.max(1, n || 1);
    /** @type {Map<string, Map<string, number>>} */
    this.transitions = new Map();
    /** @private */
    this.persistence = persistence
  }

  /** @private */
  get k() {
    return this.n - 1
  }

  /** @param {string[]} states */
  train(states) {
    for (let i = 0; i < states.length - this.n + 1; ++i) {
      const nGramKey = states.slice(i, i + this.n - 1).join(' ')
      const nextState = states[i + this.n - 1]

      if (!this.transitions.has(nGramKey)) {
        this.transitions.set(nGramKey, new Map())
      }
      const transition = this.transitions.get(nGramKey)
      transition.set(nextState, (transition.get(nextState) || 0) + 1)
    }
    return this
  }

  /**
   * @param {IMarkovChainTransitions} transitions 
   */
  setTransitions(transitions) {
    for (const [nGramKey, transition] of Object.entries(transitions)) {
      this.transitions.set(nGramKey, new Map(transition))
    }
    return this
  }

  /** 
   * @param {string[]} initialState input states
   * @param {number | (generatedStates: string[], stepIndex: number) => boolean } numStepsOrStopCondition number of generation steps or stop condition (default `1`)
   */
  generate(initialState, numStepsOrStopCondition = 1) {
    if (initialState.length < this.n - 1) {
      throw new Error(`need ${this.n - 1} or more states, but got ${initialState.length}`)
    }
    /**
     * @param {string[]} states
     * @param {number} count
     */
    const lastN = (states, count) => count > 0 ? states.slice(-count) : [];
    let currentNGram = lastN(initialState, this.n - 1)
    /** @type {string[]} */
    const generatedStates = [...initialState]
    const condition = typeof numStepsOrStopCondition === 'number'
      ? (_, index) => index < numStepsOrStopCondition
      : numStepsOrStopCondition;
    for (let i = 0; condition(generatedStates, i); ++i) {
      const nGramKey = currentNGram.join(' ')
      const transition = this.transitions.get(nGramKey)
      if (!transition || !transition.size) {
        break;
      }
      let total = 0
      for (const count of transition.values()) {
        total += count;
      }
      let cumulativeProbability = 0
      const random = Math.random()
      for (const [nextState, count] of transition) {
        cumulativeProbability += count / total;
        if (random <= cumulativeProbability) {
          generatedStates.push(nextState)
          currentNGram = lastN([...currentNGram, nextState], this.n - 1)
          break
        }
      }
    }
    return generatedStates
  }

  toJson() {
    const json = {
      type: MarkovChainBaseJsonName,
      n: this.n,
      /** @type {IMarkovChainTransitions} */
      transitions: {},
    }
    for (const [nGramKey, transition] of this.transitions) {
      json.transitions[nGramKey] = Array.from(transition.entries())
    }
    return json;
  }

  /**
   * @param {ReturnType<MarkovChainBase['toJson']>} json 
   */
  fromJson(json) {
    if (!json || json.type !== MarkovChainBaseJsonName) {
      return this
    }
    this.n = json.n || this.n
    return this.setTransitions(json.transitions)
  }

  async save() {
    if (!this.persistence) {
      throw new Error('persistor not defined')
    }
    await this.persistence.save(this)
  }

  async load() {
    if (!this.persistence) {
      throw new Error('persistor not defined')
    }
    await this.persistence.load(this)
  }
}

module.exports = { MarkovChainBase }
