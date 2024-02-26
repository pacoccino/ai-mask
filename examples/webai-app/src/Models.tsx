import { ChangeEvent, useCallback, useEffect, useState } from 'react';
import { Model } from '@webai-ext/sdk';
import { useWebAI } from './context';

export default function Models({ task }: { task: Model['task'] }) {
  const { webAIClient, selectedModel, setSelectedModel } = useWebAI()

  const [models, setModels] = useState<Model[]>([])
  const [taskModels, setTaskModels] = useState<Model[]>([])

  useEffect(() => {
    if (!webAIClient) return
    webAIClient.getModels().then(models => {
      setModels(models)
      setSelectedModel(models[0])
    })
  }, [webAIClient, setModels, setSelectedModel])

  useEffect(() => {
    const taskModels = models.filter(m => m.task === task)
    setTaskModels(taskModels)
    setSelectedModel(taskModels[0])
  }, [task, models, setTaskModels])

  const changeModel = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    const modelId = e.target.value
    const model = models.find(m => m.id === modelId)
    if (model) setSelectedModel(model)
  }, [models, setSelectedModel])

  if (!webAIClient) {
    return (
      <div className="">
        <p>Not ready</p>
      </div>
    )
  }

  return (
    <div className="">
      <h2 className='mb-2'>Model</h2>
      <select
        className=''
        value={selectedModel?.id}
        onChange={changeModel}
      >
        {taskModels.map(model => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>
    </div>
  )
}
