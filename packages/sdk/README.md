# AI-Mask SDK

**Bring local inference into your app !**

[Download extension](https://chromewebstore.google.com/detail/lkfaajachdpegnlpikpdajccldcgfdde) | [Demo App](https://pacoccino.github.io/ai-mask/) | [Home Page](https://github.com/pacoccino/ai-mask/blob/main/packages/extension/icons/icon-128.png) | [Quick Start](#quick-start)

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
	{ messages },
  { modelId: 'gemma-2b-it-q4f32_1' },
)
```


## Integration examples

- [demo-app code](/examples/demo-app/)
- [chatbot-ui PR](https://github.com/pacoccino/chatbot-ui/pull/1/files)
- [fully-local-pdf-chatbot PR](https://github.com/jacoblee93/fully-local-pdf-chatbot/pull/19)

## API

### AIMaskClient

```typescript
import { AIMaskClient } from '@ai-mask/sdk'

// Check if extension is installed
AIMaskClient.isExtensionAvailable(): boolean

// Instanciate
const aiMaskClient = new AIMaskClient({ name?: string }) // name of your app

// List available models
async aiMaskClient.getModels(): Promise<Model[]>

type Model {
    id: string
    name: string
    task: string
}

// Chat with an OpenAI-like request
async aiMaskClient.chat(params: ChatCompletionParams, options: InferOptions): Promise<string | ReadableStream<string>>

type ChatCompletionParams = {
    messages: [{ role: 'user' | 'assistant', content: string }]
    max_tokens: number
    temperature: number
}
type InferOptions = {
    modelId: string
    stream?: boolean
}

// Translate text from one language to another
async aiMaskClient.translate(params: TranslationParams, options: InferOptions): Promise<string>

type TranslationParams = {
    inputText: string
    sourceLang: string
    destLang: string
}

// Create embeddings
async aiMaskClient.featureExtraction(params: FeatureExtractionParams, options: InferOptions): Promise<number[][]>

type TranslationParams = {
    texts: string[]
    pooling?: 'none' | 'mean' | 'cls'
    normalize?: boolean
}
```

For `sourceLang` and `destLang`, see [languages](/packages/core/src/config/translation.ts)

### Usage in Workers

If you need to use AIMask from a Web Worker, some additional steps are required.

Please check the [demo app with worker](/examples/demo-app-worker/src) for an example implementation.


- In the worker, use `async AIMaskClient.getWorkerClient()` to get an AIMaskClient instance.  
- In the main thread, *just* after initializing your worker and having an AIMaskClient instance, call `aiMaskClient.providerWorkerPort(worker)`

```typescript
// main.ts
const aiMaskClient = new AIMaskClient()
const worker = new Worker(
    new URL('./worker.ts', import.meta.url), 
    {
        type: 'module',
    });
aiMaskClient.provideWorkerPort(worker)
```

```typescript
// worker.ts
const aiMaskClient = await AIMaskClient.getWorkerClient()
```