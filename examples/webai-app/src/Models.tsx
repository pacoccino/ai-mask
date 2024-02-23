import { useContext, useEffect, useState } from 'react';
import { Model } from '@webai-ext/sdk'
import { WebAIContext } from './context';

export default function Models() {
  const { webAIClient, selectedModel, setSelectedModel } = useContext(WebAIContext)

  const [models, setModels] = useState<Model[]>([])

  useEffect(() => {
    if (!webAIClient) return
    webAIClient.getModels().then(models => {
      setModels(models)
      setSelectedModel(models[0])
    })
  }, [webAIClient])

  if (!webAIClient) {
    return (
      <div className="">
        <p>Not ready</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center">
      <div className='mb-4'>
        <h2>Models</h2>
        <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}>
          {models.map(model => (
            <option key={model.id}>
              {model.id}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
