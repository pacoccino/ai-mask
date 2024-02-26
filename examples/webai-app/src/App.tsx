import Prompt from './Prompt';
import Models from './Models';
import { useWebAI } from './context';
import { useState } from 'react';
import { Model } from '@webai-ext/sdk';
import Translate from './Translate';

export default function App() {
  const { webAIClient, clientState } = useWebAI()
  const [task, setTask] = useState<Model['task']>('translation')
  return (
    <div className="flex flex-col items-center p-4">
      <h1>WebAI Example App</h1>
      <p className='mb-4'>Example app for WebAI using chome extension for AI inference</p>

      <div className='flex flex-col md:flex-row mb-4'>
        <div className='mb-2 md:mb-0 md:mr-2'>
          <h2 className='mb-2'>Task</h2>
          <select
            className='w-full max-w-lg'
            value={task}
            onChange={e => setTask(e.target.value as Model['task'])}
          >
            <option value='completion'>Completion</option>
            <option value='translation'>Translation</option>
          </select>
        </div>
        <Models task={task} />
      </div>
      {clientState === 'loaded' && webAIClient &&
        <>
          {task === 'completion' && <Prompt />}
          {task === 'translation' && <Translate />}
        </>
      }
      {clientState === 'error' &&
        <div className='text-red-500'>failed to connect, have you installed the extension ?</div>
      }
      {clientState === 'loading' &&
        <div className='text-orange-500'>Loading client...</div>
      }
    </div>
  )
}
