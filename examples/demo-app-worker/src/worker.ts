
import { AIMaskClient } from '@ai-mask/sdk';

async function main() {
    const aiMaskClient = await AIMaskClient.getWorkerClient()


    self.addEventListener("message", async ({ data }) => {
        if (data.type === 'chat') {
            aiMaskClient.chat(data.model, {
                messages: data.messages
            }).then(response => self.postMessage({
                type: 'chat_response',
                response,
            }))
        }
    })

}

main().catch(console.error)