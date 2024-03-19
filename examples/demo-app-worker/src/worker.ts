
import { AIMaskClient } from '@ai-mask/sdk';

async function main() {
    const aiMaskClient = await AIMaskClient.getWorkerClient()


    self.addEventListener("message", async ({ data }) => {
        if (data.type === 'chat') {
            aiMaskClient.chat({
                messages: data.messages
            }, {
                modelId: data.model
            }).then(response => self.postMessage({
                type: 'chat_response',
                response,
            }))
        }
    })

}

main().catch(console.error)