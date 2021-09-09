const patchOrder = require('./order');
const { patch: requirePatch } = require('require-tools');

const _patches = new Map();

/**
 * Registers a patch for discord.js file
 * @param {DiscordFile} path
 * @param {Function} patcher 
 */
function registerPatch(path, patcher) {
  if (patchOrder.indexOf(path) === -1) throw new Error(`Invalid discord.js path: ${path}`);

  if (_patches.has(path)) {
    const prevPatch = _patches.get(path);
    const newPatch = m => patcher(prevPatch(m));
    _patches.set(path, newPatch);
  } else {
    _patches.set(path, patcher);
  }
}

/**
 * Registers an array of patches for discord.js files
 * @param {[DiscordFile, Function][]} patches 
 */
function registerPatches(...patches) {
  for (const [path, patcher] of patches) {
    registerPatch(path, patcher);
  }
}

/**
 * Applies all the registered patches for discord.js files
 * @returns {require('discord.js')}
 */
function finalizePatches() {
  for (const path of patchOrder) {
    if (_patches.has(path)) {
      requirePatch(`discord.js/src/${path}`, _patches.get(path));
    }
  }
  return require('discord.js');
}

module.exports = {
  registerPatch,
  registerPatches,
  finalizePatches,
};
