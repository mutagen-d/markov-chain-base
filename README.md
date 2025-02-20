# Markov chain

A lightweight and flexible implementation of Markov chains with support for n-grams, text generation, and persistence.

## Features

- **N-Gram Support**: Use n-grams (e.g., bigrams, trigrams) for more coherent text generation
- **Text Generation**: Generate words or sentences based on trained data
- **Persistence**: Save and load Markov chain states to/from files or databases
- **Customizable**: Easily extend the library to implement custom persistence, transition logic, or text tokenizer/joiner
- **Browser Support**: Use the pre-built `markov-chain.min.js` for browser environments

## Installation

### NodeJs

```bash
npm install markov-chain-base
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/markov-chain-base/dist/markov-chain.min.js"></script>
```

## Usage

- [Quick Start](#quick-start)
- [Text Generation](#text-generation)
- [Custom Text Tokenizer/Joiner](#custom-text-tokenizer-joiner)
- [N-Grams](#n-grams)
- [Persistence](#persistence)

### Quick Start

Create a Markov chain with predefined transitions and generate sequences.
Transitions contain **weights** for the next states, which are automatically normalized to probabilities during generation.
You can also use the `train` method to incrementally update the transition weights.
During training, weights are **incremented by one** for each occurrence of a state transition.

#### NodeJs

```js
const { MarkovChainBase } = require('markov-chain-base')

const markovChain = new MarkovChainBase()
// Option 1: Set transitions manually
markovChain.setTransitions({
  sunny: [
    ['sunny', 5], // Weight for 'sunny' after 'sunny'
    ['rain', 3], // Weight for 'rain' after 'sunny'
    ['cloud', 2], // Weight for 'cloud' after 'sunny'
  ],
  rain: [
    ['sunny', 2],
    ['rain', 2],
    ['cloud', 6],
  ],
  cloud: [
    ['sunny', 2],
    ['rain', 4],
    ['cloud', 4],
  ],
})

// Option 2: Train the model with a sequence of states
markovChain.train(['sunny', 'rain', 'cloud', 'sunny', 'cloud', 'rain'])
// Weights for 'sunny -> rain', 'rain -> cloud', 'cloud -> sunny', etc., are incremented by 1

// Train again with additional data
markovChain.train(['sunny', 'sunny', 'rain', 'cloud'])
// Weights for 'sunny -> sunny', 'sunny -> rain', 'rain -> cloud' are incremented by 1

const generated = markovChain.generate(['sunny'], 3) // generate 3 new states
console.log(generated) // ['sunny', 'rain', 'cloud', 'cloud']
```

#### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/markov-chain-base/dist/markov-chain.min.js"></script>
<script>
  // Now you can use the library globally
  const markovChain = new MarkovChainBase()
</script>
```

### Text Generation

Train the Markov chain on a text corpus and generate new text.
The `train` method can be invoked multiple times to incrementally update the transition weights.
The `generate` method generates **up to a maximum of N words**,
and the `generateSentence` method generates **up to a maximum of N sentences**, depending on the stop condition.

**Note**: If no transition is found for the next word, generation stops **even if the stop condition is not met**.

```js
const { MarkovChainText } = require('markov-chain-base')

const markovChain = new MarkovChainText()
const sentences = [
  'The quick brown fox jumps over the lazy dog.',
  'The dog barks at the fox.',
  'The fox runs away.',
  'The dog chases the fox.',
  'The fox is quick and clever.',
  'The dog is slow but persistent.',
  'The fox escapes.',
  'The dog gives up.',
].join(' ')

// Train the model
markovChain.train(sentences)

// Train again with additional data
markovChain.train('The fox is very sneaky. The dog is very loud.')

// Generate up to 6 words
const returnedWords = markovChain.generate('The', (words) => words.length < 6)
console.log(returnedWords) // "The quick brown fox is slow"

// Generate up to 6 words (alternative)
const generatedWords = markovChain.generate('The', 5) // Add up to 5 words to initial word
console.log(generatedWords) // "The fox jumps over the fox."

// Generate up to 6 sentences
const generatedSentences = markovChain.generateSentence('The', 6)
console.log(generatedSentences)
```

### Custom Text Tokenizer-Joiner

You can provide a custom text tokenizer/joiner by implementing the `ITextTool` interface:

```typescript
interface ITextTool {
  tokenize?: (text: string) => string[]; // Tokenize text into words
  join?: (tokens: string[]) => string;   // Join tokens into a single string
  countSentences?: (tokens: string[]) => number; // Count sentences in tokens
}
```

#### Example

```js
const customTextTool = {
  tokenize: (text) => text.split(/\s+/), // Split text by whitespace
  join: (tokens) => tokens.join(' '),    // Join tokens with a space
  countSentences: (tokens) => tokens.filter((token) => token.endsWith('.')).length, // Count sentences
};

const markovChain = new MarkovChainText(2, {
  textTool: customTextTool
});
```

### N-Grams

Use n-grams to generate more coherent text by considering the context of previous words.

```js
const { MarkovChainText } = require('markov-chain-base')

// Trigrams (n=3)
const markovChain = new MarkovChainText(3)
const text = 'The quick brown fox jumps over the lazy dog. The dog barks at the fox.'
markovChain.train(text)

// Generate up to 6 words
const generatedWords = markovChain.generate('The dog', (words) => words.length < 6)
console.log(generatedWords) // "The dog is slow but persistent."

// Generate up to 6 sentences
const generatedSentences = markovChain.generateSentence('The fox', 6)
console.log(generatedSentences)
```

### Persistence

Save and load Markov chain states to/from files or databases by implementing the `IMarkovChainPersistence` interface.
Note that transition **weights** are saved and loaded, not probabilities.

#### Example: File-Based Persistence

```js
const fs = require('fs/promises')

const file = 'markov-chain.json'

class MyPersistence {
  async save(markovChain) {
    await fs.writeFile(file, JSON.stringify(markovChain.toJson()), 'utf-8')
  }

  async load(markovChain) {
    const json = await fs.readFile(file, 'utf-8')
    markovChain.fromJson(JSON.parse(json))
  }
}

// Create a Markov chain with persistence (with bigram)
const markovChain = new MarkovChainBase(2, {
  persistence: new MyPersistence(),
})

// Save to file
await markovChain.save()

// Load from file
await markovChain.load()
```

`IMarkovChainPersistence` Interface

```ts
interface IMarkovChainPersistence {
  save: (markovChain: MarkovChainBase) => Promise<void>
  load: (markovChain: MarkovChainBase) => Promise<void>
}
```

## API Reference

### `MarkovChainBase`

- `setTransitions(transitions: Record<string, [string, number][]>)`: Set transition weights.
  Weights are automatically normalized to probabilities during generation.
- `train(states: string[])`: Train the Markov chain on a sequence of states.
  For each state transition, the corresponding weight is **incremented by one**.
  This method can be invoked multiple times to incrementally update the transition weights.
- `generate(initialState: string[], numSteps: number)`: Generate up to `numSteps` amount of new states. Generation stops if no transition is found for the next state.
- `generate(initialState: string[], stopCondition: (generatedStates: string[], stepIndex: number) => boolean)`: Generate a sequence of states until the condition is met. Generation stops if no transition is found for the next state.
- `toJson()`: Export the Markov chain state as JSON.
- `fromJson(json: Record<string, any>)`: Import the Markov chain state from JSON.

### `MarkovChainText`

- inherited methods from `MarkovChainBase`
- `train(text: string | string[])`: Train the Markov chain on a text corpus.
  This method can also be invoked multiple times to incrementally update the transition weights.
- `generate(initialState: string | string[], numSteps?: number)`: Generate up to `numSteps` amount of new words. If no transition found for the next word then generation stops
- `generate(initialState: string | string[], stopCondition?: (generatedWords: string[], stepIndex: number) => boolean)`: Generate text until the condition is met or no transition is found for the next word.
- `generateSentence(initialState: string | string[], numSentences?: number)`: Generate up to `numSentences` amount of sentences. Generation stops if no transition is found for the next word.

## License

This project is licensed under the MIT License. See the [LICENCE](./LICENSE) file for details

## Contributing

Contributions are welcome! Please open an issue or submit a pull request on [GitHub](https://github.com/mutagen-d/markov-chain-base)
