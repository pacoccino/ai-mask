
# AI-Mask
  ![AI-Mask Logo](/packages/extension/icons/icon-128.png)

**Bring local inference into web apps !**

[Download extension](#) | [Supported apps](#supported-apps) | [Integration guide](#for-integrators)

> This is an experimental project at an MVP stage. **Feedback will be greatly appreciated for the future of this project.**
 
## What ?

AI-Mask is a chrome **web extension** that execute **AI** models **in-browser** for apps which needs it, for **free**, and with full-**privacy**.

## Why ?

On-device AI inference is getting quite a traction recently. Most of our devices are already capable of executing machine learning models and software compatibility is ready.

  
Thanks to some [amazing](https://github.com/mlc-ai/web-llm) [libraries](https://github.com/xenova/transformers.js), running machine learning models in the browser has become ridiculously easy, accelerated with WASM and WebGPU. This means they'll work and exploit full capacity on virtually any device, hardware and operating system.

But SOTA web libraries store models in the browser cache, which is per-domain. This means that if multiple web apps use the same models, it needs to be downloaded once per domain, which can use a lot of disk space.

With this extension, the models are cached only once and served to the websites conveniently though an unified SDK.

## Usage

### For Users

Enjoy **free** and **private** execution of AI models !

Do not pay for using models again, do not leak private data, and do not give your API keys to third-party apps. 

**How To:**

1. Install the extension: *Coming soon*



2. Use a [Supported app](#supported-apps)


### For Integrators

Easily support AI-Mask in your AI apps, and bring free and private local-inference to your users ! Do not store API keys again, and get rid of your backend and server costs. 

**Quick Start**

Install package:
```shell
npm install -S @ai-mask/sdk
```
Run inference:
```typescript
import { AIMaskClient } from '@ai-mask'

const messages = [{ role: 'user', content: 'What is the capital of France ? ' }]

const aiMaskClient = new AIMaskClient()
const response = await aiMaskClient.chat(
    'gemma-2b-it-q4f32_1',
	{ messages },
)
```

For full reference, see [AI-Mask SDK Documentation](/packages/sdk)


You can see the [demo app code](/examples/demo-app/) and an [example pull request](https://github.com/pacoccino/chatbot-ui/pull/1/files) to see how it's easy to integrate into existing apps

**Note**: App users must have the extension installed for this to work. 

## Technology

AI-Mask is a ManifestV3 extension, heavily relying on the work of third party libraries to execute model inference:
  
- [web-llm](https://github.com/mlc-ai/web-llm) Inference with WASM/WebGPU via Apache TVM
-  [transformers.js](https://github.com/mlc-ai/web-llm) Inference with WASM via ONNX Runtime
  

## Supported Apps

All the web apps that are compatible with this extension:
 
- [Demo App](https://pacoccino.github.io/ai-mask/)
- [chatbot-ui](https://github.com/pacoccino/chatbot-ui/pull/1)

## Contribute

### Developpement

Requirements:
- Node 18+
- pnpm 8+ (for monorepo workspace management)


#### Start development server for all packages (sdk/extension/demo-app)
```
pnpm run dev
```
#### Typecheck and build for production
```
pnpm run build
```

## TODO

- [ ] Match OpenAI SDK API / Provide ReadableStream from AIMasklient
- [ ] Pull request in one popular AI app
- [ ] Implement more tasks
- [ ] Add more models
- [X] Documentation
- [ ] Unload model from memory after being inactive for a while
- [x] Deploy demo app
- [ ] Deploy extension
- [ ] Include react Hooks/utilities in SDK
- [ ] Improve extension panel:
    - [ ] search/filter models
    - [ ] download/remove individual models
