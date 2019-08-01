const guard = require('./guard');

var camelCase = 0;
var PascalCase = 1;
var snake_case = 2;
var SHOUT_CASE = 3;

function isAlphaDigit_(c) {
  return /^[A-Za-z0-9_]$/.test(c);
}

// `str` must be trimmed
function nextWord(str) {
  var i, j;
  for (i = 0; i < str.length && !isAlphaDigit_(str[i]); i++) {
    // jump all non-identifier characters
  }
  j = i;
  for (; i < str.length && isAlphaDigit_(str[i]); i++) {
    // jump until non-identifier characters
  }
  return {
    word: str.slice(j, i),
    rest: str.slice(i)
  };
}

function words(str) {
  var _ = []
    , w;

  for (; str.length > 0;) {
    str = str.trim();
    w = nextWord(str);
    if (w.word)
      _.push(w.word);
    str = w.rest;
  }

  return _;
}

function isUpper(s) {
  return /^([A-Z]+$)/.test(s);
}
function isLower(s) {
  return /^([a-z]+$)/.test(s);
}
function hasUpper(s) {
  return /[A-Z]/.test(s);
}
function hasLower(s) {
  return /[a-z]/.test(s);
}

/**
 * Analyses a string and gives all cases found in the string.
 * @param {string} str
 * @returns {{camelCase: number, PascalCase: number, snake_case: number, SHOUT_CASE: number}} All kinds of cases found in the string, counted by words.
 */
function analyseCase(str) {
  var ws = words(str)
    , _  = {
      camelCase: false,
      PascalCase: false,
      snake_case: false,
      SHOUT_CASE: false
    }
    , i, word;

  for (i = 0; i < ws.length; i++) {
    word = ws[i];
    if (isCamelCase(word))   _.camelCase++;
    if (IsPascalCase(word))  _.PascalCase++;
    if (is_snake_case(word)) _.snake_case++;
    if (IS_SHOUT_CASE(word)) _.SHOUT_CASE++;
  }

  return _;
}

/*
Following ARE camelCase words
  (null string)
  i
  asAResult
  parseHTML
  asAResult1
  giveMe1Hand
  xFFF
  _x
  _a1
  __this
Following are NOT camelCase words
  0
  _     (snake_case)
  _1    (snake_case)
  _amd_ (snake_case)
  FFF   (SHOUT_CASE)
Unless it contains no letters, if a word is camelCase, it is definitely not
 PascalCase, and vice versa.
If a word is camelCase, then the word being truncated (all or partial)
 prefixing underscores is also camelCase. Not vice versa.
A word can be camelCase and also snake_case (_[a-z]+).
*/
function isCamelCaseWord(word) {
  word = word.trim();
  if (word.length === 0) return true;

  var _ = true;
  _ = _ && /^_*[a-z][a-z0-9]*([A-Z]+[a-z0-9]*)*$/.test(word);

  return _;
}

/*
Following ARE PascalCase words
  (null string)
  Num
  Html
  AsAResult
  HTMLParse
  _A1a
  __This
Following are NOT PascalCase words
  0
  N       (SHOUT_CASE)
  FFF     (SHOUT_CASE)
  _       (snake_case)
  _1      (snake_case)
  _A1     (SHOUT_CASE)
  __THIS  (SHOUT_CASE)
  _A1a_1  (not any case)
If a word is PascalCase, then the word being truncated (all or partial)
 prefixing underscores is also PascalCase. Not vice versa.
*/
function IsPascalCaseWord(word) {
  word = word.trim();
  if (word.length === 0) return true;

  var _ = true;
  _ = _ && hasLower(word);
  _ = _ && /^_*[A-Z][a-z0-9]*([A-Z]+[a-z0-9]*)*$/.test(word);

  return _;
}

/*
Following ARE snake_case words
  _
  __
  _1
  _k (also )
  _a_1
  a_1
  a_a
  a_1_2
  a___12__2
  a___
  a_12___
Following are NOT snake_case words
  1_1
  1_2_a
  a_B   (not any case)
  B_a   (not any case)
*/
function is_snake_case_word(word) {
  word = word.trim();
  if (word.length === 0) return true;

  var _ = true;
  _ = _ && /^[a-z_]+(_*[a-z0-9])*_*$/.test(word);

  return _;
}

function IS_SHOUT_CASE_WORD(word) {
  word = word.trim();
  if (word.length === 0) return true;
  if (!commonCheck(word, isUpper)) return false;

  var _ = true;
  _ = _ && !hasLower(word);
  _ = _ && /^[A-Z_]+(_*[A-Z0-9])*_*$/.test(word);

  return _;
}

function template(act, map, str) {
  var ws = words(str)
    , i
    , _ = true;

  for (i = 0; i < ws.length; i++) {
    _ = map(ws[i], act, _);
  }

  return _;
}

function mapperForIs(word, act, _) {
  return _ && act(word);
}

function isCamelCase(str) {
  return template(isCamelCaseWord, mapperForIs, str);
}

function IsPascalCase(str) {
  return template(IsPascalCaseWord, mapperForIs, str);
}

function is_snake_case(str) {
  return template(is_snake_case_word, mapperForIs, str);
}

function IS_SHOUT_CASE(str) {
  return template(IS_SHOUT_CASE_WORD, mapperForIs, str);
}

function mapperForTo(word, act, _) {
  return _ + act(word);
}

function toCamelCaseWord(word) {
  var FromPascalCase = (word) => {};
  var from_snake_case = (word) => {};
  var FROM_SHOUT_CASE = (word) => {};
  var fromMixedCase = (word) => {};
  return guard([
    { test: (word) => isCamelCaseWord(word), expression: word },
    { test: (word) => IsPascalCaseWord(word), expression: FromPascalCase },
    { test: (word) => is_snake_case_word(word), expression: from_snake_case },
    { test: (word) => IS_SHOUT_CASE_WORD(word), expression: FROM_SHOUT_CASE },
    { test: otherwise, expression: fromMixedCase },
  ])(word);
}

function ToPascalCaseWord(word) {
}

function to_snake_case_word(word) {
}

function TO_SHOUT_CASE_WORD(word) {
}

function toCamelCase(str) {
  return template(toCamelCaseWord, mapperForTo, str);
}

function ToPascalCase(str) {
  return template(ToPascalCaseWord, mapperForTo, str);
}

function to_snake_case(str) {
  return template(to_snake_case_word, mapperForTo, str);
}

function TO_SHOUT_CASE(str) {
  return template(TO_SHOUT_CASE_WORD, mapperForTo, str);
}

module.exports = {
  words,
  analyseCase,
  camelCase,
  PascalCase,
  snake_case,
  SHOUT_CASE,
  isCamelCase,
  IsPascalCase,
  is_snake_case,
  IS_SHOUT_CASE,
  toCamelCase,
  ToPascalCase,
  to_snake_case,
  TO_SHOUT_CASE
};
