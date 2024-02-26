# WebAI Extension

> This is an ongoing experimentation

A chrome web extension that serves inference to websites. 
Run models on your device for free.


### Technology

Model inference is done by the browser thanks to the amazing [Web-LLM](https://github.com/mlc-ai/web-llm) 

It can run on any device via WASM and can be accelerated by WebGPU on [compatible devices](https://webgpureport.org/)

Transformers.js will be supported next. 

### Why an extension ?
Inference in the browser is getting quite a traction, but the current libraries (web-llm, transformers.js) store models in the browser cache, which is per-domain. This means that if multiple web apps use the same models, it needs to be downloaded once per domain, which can use a lot of disk space.

With this extension, the models are cached only once and served to the websites conveniently though an unified SDK


## TODO
- [ ] Match OpenAI SDK API / Provide ReadableStream from WebAIClient
- [ ] Pull request in one popular AI app
- [ ] Implement more tasks
- [ ] Add more models
- [ ] Documentation
- [ ] Unload model from memory after being inactive for a while
- [ ] Deploy demo app
- [ ] Deploy extension