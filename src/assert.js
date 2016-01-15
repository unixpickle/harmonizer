function assert(flag) {
  if (!flag) {
    throw new Error('Assertion failure.');
  }
}
