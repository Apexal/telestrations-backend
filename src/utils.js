/**
 * Utility methods for the backend.
 */

const dictionary = require('../dictionary.json')

/**
 * Choose random secret word(s) to assign to players.
 * Ensures no words are repeated.
 *
 * TODO: unit test this!
 *
 * @param count The number of secret words to grab
 */
module.exports.chooseNewRandomSecrets = function chooseNewRandomSecrets (count) {
  const selected = new Set()

  for (let i = 0; i < count; i++) {
    let word = dictionary[Math.floor(Math.random() * dictionary.length)]
    while (!selected.has(word)) {
      word = dictionary[Math.floor(Math.random() * dictionary.length)]
    }
    selected.add(word)
  }

  return Array.from(selected)
}
