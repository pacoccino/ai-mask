import { AIAction, Model, TransformersStubParams } from "@ai-mask/core"
import { AIMaskClient } from "."

export class AIMaskPassTransformers {
    client: AIMaskClient
    constructor(client: AIMaskClient) {
        this.client = client
    }

    pipeline(task: Model['task'], modelId: string) {
        return async (texts: string[], options?: any) => {
            const request: AIAction<'engine_stub'> = {
                action: 'engine_stub',
                params: {
                    engine: 'transformers.js',
                    modelId,
                    engineParams: {
                        task: task,
                    },
                    callParams: [
                        texts,
                        options
                    ]
                }
            }
            const response = this.client.request(request)
            return response
        }
    }
}