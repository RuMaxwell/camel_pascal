function otherwise() {
  return true;
}

// entry: { test: (a, b, c) => a === b, expression: (a, b, c) => c }
function guard(entries) {
  return function(...params) {
    var i
      , entry;
    for (i = 0; i < entries.length; i++) {
      entry = entries[i];
      test = entry.test;
      expression = entry.expression;
      if (test(...params)) {
        return expression(...params);
      }
    }
    throw new Error("guard: pattern not exhausive");
  }
}

module.exports = guard;

function fact(x) {
  return guard([
    { test: (x) => x <= 0, expression: () => 1 },
    { test: otherwise, expression: (x) => x * fact(x - 1) },
  ])(x);
}

console.log(fact(6));
