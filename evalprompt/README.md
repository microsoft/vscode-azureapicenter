# Evaluation Prompt Guide

## Local Debug

### In VSCode
1. install [Command Variable](https://marketplace.visualstudio.com/items?itemName=rioj7.command-variable)
1. `F1` -> `Tasks: Run Task` -> `evaluate prompt`
1. select the target folder

### Terminal
1. Switch to target folder
1. run `npx promptfoo eval`
1. run `npx promptfoo view -y`

## GitHub CI Pipeline
When submitting a PR on GitHub, if there are code changes in the evalprompt folder, this pipeline will be triggered.
The GitHub bot will reply under the PR with the results of the evaluation prompt. You can click on the hyperlink in the results to view more detailed content.

## Case Guide
### Prompts
- prompt from raw text
```yaml
prompts:
  - 'Translate the following text to French: "{{name}}: {{text}}"'
  - 'Translate the following text to German: "{{name}}: {{text}}"'
```

- prompts as file
```yaml
prompts:
  - file://path/to/prompts.json
  - file://path/to/prompts.txt
  - file://path/to/prompts.js
  - file://path/to/prompts.py
```

### Provider
- built-in provider
```yaml
providers:
  - id: azure:chat:gpt-4o
    config:
      apiHost: "apicevaluationtestai.openai.azure.com"
```

### custom provider
```yaml
providers:
  - id: file://customProvider.ts
     label: "My custom provider"
```

### Asserts (or Evaluation)
- Default  Evaluation for all tests
```yaml
defaultTest:
  assert:
    - type: javascript
      value: file://spectral.mjs
```

### Evaluation for each test
```yaml
tests:
  - description: 'Test that the output is cheap and fast'
    vars:
      example: 'Hello, World!'
    assert:
      - type: assert-set
        assert:
          - type: cost
            threshold: 0.001
          - type: latency
            threshold: 200
```

### Tests (User inputs)
- test from raw file
```yaml
tests:
  - file://relative/path/to/normal_test.yaml
```

- tests from script (javascript, python, go or others)
```yaml
tests:
  - file://path/to/tests.js
```

