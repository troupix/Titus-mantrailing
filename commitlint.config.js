module.exports = { extends: ['@commitlint/config-conventional'],
rules: {
    'type-enum': [2, 'always', [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'chore',
        'revert',
        'build',
        'ci',
        'breaking',
        'update',
        'temp'
    ]],
    'header-max-length': [2, 'always', 500]
    }
};