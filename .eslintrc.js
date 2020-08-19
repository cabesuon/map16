module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    __rp: true
  },
  parserOptions: {
    ecmaVersion: 11
  },
  rules: {
    semi: ['error', 'always', { omitLastInOneLineBlock: true }]
  }
};
