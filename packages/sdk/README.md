# AI-Mask SDK

**Bring local inference into your app !**

[Download extension](#) | [Demo App](https://pacoccino.github.io/ai-mask/) | [Home Page](https://github.com/pacoccino/ai-mask/blob/main/packages/extension/icons/icon-128.png) | [Quick Start](#quick-start)

[![npm version](https://badge.fury.io/js/@ai-mask%2Fsdk.svg)](https://badge.fury.io/js/@ai-mask%2Fsdk)

> This is an alpha version

Easily support AI-Mask in your AI apps, and bring free and private local-inference to your users ! Do not store API keys again, and get rid of your backend and server costs. 

**Note**: App users must have the extension installed for this SDK to work on web pages

## Quick Start

### Install package:
```shell
npm install -S @ai-mask/sdk
```

### Run inference:
```typescript
import { AIMaskClient } from '@ai-mask'

const messages = [{ role: 'user', content: 'What is the capital of France ? ' }]

const aiMaskClient = new AIMaskClient()
const response = await aiMaskClient.chat(
    'gemma-2b-it-q4f32_1',
	{ messages },
)
```


## Integration examples

[demo-app code](/examples/demo-app/)

[chatbot-ui PR](https://github.com/pacoccino/chatbot-ui/pull/1/files)

## API

### AIMaskClient

```typescript
import { AIMaskClient } from '@ai-mask/sdk'

// List available models
async AIMaskClient.getModels(): Promise<Model[]>

type Model {
    id: string
    name: string
    task: string
}

// Chat with an OpenAI-like request
async AIMaskClient.chat(modelId: string, params: ChatCompletionParams, streamCallback?: MessagerStreamHandler): Promise<string>

type ChatCompletionParams = {
    messages: [{ role: 'user' | 'assistant', content: string }]
    max_tokens: number
    temperature: number
}
type MessagerStreamHandler = (new_text: string) => void

// Translate text from one language to another
async AIMaskClient.translate(modelId: string, params: TranslationParams, streamCallback?: MessagerStreamHandler): Promise<string>


type TranslationParams = {
    inputText: string
    sourceLang: string
    destLang: string
}

```

For `sourceLang` and `destLang`, see [languages](/packages/core/src/config/translation.ts)
