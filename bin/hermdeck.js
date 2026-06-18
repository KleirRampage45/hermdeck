#!/usr/bin/env node
/**
 * HermDeck — CLI entry point shim
 * 
 * This is a CommonJS .js file so npm's bin validation accepts it.
 * It loads the compiled HermDeck module from dist/.
 */
'use strict';
require('../dist/index.js');
