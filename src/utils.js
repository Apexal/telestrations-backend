/**
 * Utility methods for the backend.
 */

const dictionary = require('../dictionary.json')
const config = require('./config')

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

/**
 * Given a desired display name, sanitize it by trimming white space and removing banned characters/words.
 * If too short, too long, or other issue, return false.
 * @param {string} displayName
 * @returns {boolean | string} `false` if invalid name, sanitized string otherwise
 */
module.exports.validatePlayerDisplayName = function cleanOrRejectPlayerDisplayName (displayName) {
  // First attempt to sanitize
  displayName = displayName
    .trim() // Remove whitespace at start and end
    .replace(/\s+/g, ' ') // Replace extra spaces with one space

  // Check if valid
  if (displayName.length < config.displayNames.minLength || displayName.length > config.displayNames.maxLength) {
    return false
  }

  return displayName
}
