import { WebAIClient } from '../../../packages/sdk/src/WebAIClient'

const webAIClient = new WebAIClient()

function setLabel(id: string, text: string) {
  const label = document.getElementById(id);
  if (label == null) {
    throw Error("Cannot find label " + id);
  }
  label.innerText = text;
}

async function generate(prompt) {
  const model = 'RedPajama-INCITE-Chat-3B-v1-q4f32_1'

  setLabel("generate", 'generating...');
  const response = await webAIClient.generate(prompt, model);
  setLabel("generate", response);
}

async function main() {
  const generateButton = document.getElementById("generate-button");
  generateButton?.addEventListener("click", async () => {
    const prompt = (document.getElementById("prompt") as HTMLInputElement).value;
    await generate(prompt);
  })

  const models = await webAIClient.getModels()
  setLabel('models', JSON.stringify(models))
}

main().catch(console.error)
