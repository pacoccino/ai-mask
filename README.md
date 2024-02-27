
# AI-Mask
  ![AI-Mask Logo](/packages/extension/icons/icon-128.png)

**Bring local inference into web apps !**

[Download extension](#) | [Supported apps](#supported-apps) | [Integration guide](#for-integrators)

[![npm version](https://badge.fury.io/js/@ai-mask%2Fsdk.svg)](https://badge.fury.io/js/@ai-mask%2Fsdk)

> This is an experimental project at an MVP stage. 
> **[Feedback](https://github.com/pacoccino/ai-mask/discussions) will be greatly appreciated for the future of this project.**
 
## What ?

AI-Mask is a chrome **web extension** that serves as a gateway to  **AI** models execution. It runs model **on-device** for apps which needs it, for **free**, and with full-**privacy**. 

See it as the [Metamask](https://metamask.io/) of AI. 

[Try it !](https://pacoccino.github.io/ai-mask/)



[AI-Mask Demo.mp4](https://github.com/pacoccino/ai-mask/assets/1371207/f75e8b27-c91a-4bc6-bd14-8eae0d68050f)



## Why ?

On-device AI inference is getting quite a traction recently. Most of our devices are already capable of executing machine learning models and software compatibility is ready.

Thanks to some [amazing](https://github.com/mlc-ai/web-llm) [libraries](https://github.com/xenova/transformers.js), running **machine learning** models **in the browser** has become ridiculously easy, accelerated with **WASM** and **WebGPU**. This means they'll work and run nearly at **full-performance** on virtually **any device**, hardware and operating system.

**But** SOTA web inference libraries store models in the browser cache, which is per-domain. This means that if multiple web apps use the same models, it needs to be downloaded once per domain, which can use a **lot of disk space**.

With this extension, the models are **cached only once** and served to the websites conveniently though an **unified SDK**.

## Future

This is a test to see if it's interesting and getting traction from users and app developers.

Another major feature planned is also to proxy requests to OpenAI-like APIs. Users would store their API keys in the extension, and apps would query the extension to run models.

This would solve:
- Users won't have to share API keys with non-trusted apps anymore
- Users won't share private data with apps
- App developers won't need to have a backend server which proxies API request to alleviate cors problem and manipulate responses

## Supported Apps

Web apps that are compatible with this extension for local inference:
 
- [Demo App](https://pacoccino.github.io/ai-mask/)
- [chatbot-ui](https://github.com/pacoccino/chatbot-ui/pull/1)

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
  
## Contribute

### Developpement

Requirements:
- Node 18+
- pnpm 8+ (for monorepo workspace management)


#### Start development server for all packages (sdk/extension/demo-app)
```
pnpm dev
```
#### Typecheck and build for production
```
pnpm build
```

## Roadmap

- [X] Documentation
- [x] Deploy demo app
- [ ] Deploy extension
- [ ] Match OpenAI SDK API / Provide ReadableStream from AIMasklient
- [ ] Proxy OpenAI-like API requests and store user keys
- [ ] Interrupts
- [ ] Include react Hooks/utilities in SDK
- [ ] Pull request in one popular AI app
- [ ] Implement more tasks
- [ ] Add more models
- [ ] Unload model from memory after being inactive for a while
- [ ] Improve extension panel:
    - [ ] search/filter models
    - [ ] download/remove individual models
