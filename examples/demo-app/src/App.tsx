import Chat from './Chat';
import Models from './Models';
import { useAIMask } from './context';
import { useState } from 'react';
import { Model } from '@ai-mask/sdk';
import Translate from './Translate';

export default function App() {
  const { aiMaskClient, clientState } = useAIMask()
  const [task, setTask] = useState<Model['task']>('chat')
  return (
    <div className="flex flex-col items-center p-4">
      <h1>AI-Mask Demo App</h1>
      <p className='mb-4'>Example app for using AI-Mask Chrome extension for AI inference</p>

      <div className='flex flex-col md:flex-row mb-4'>
        <div className='mb-2 md:mb-0 md:mr-2'>
          <h2 className='mb-2'>Task</h2>
          <select
            className='w-full max-w-lg'
            value={task}
            onChange={e => setTask(e.target.value as Model['task'])}
          >
            <option value='chat'>Chat</option>
            <option value='translation'>Translation</option>
          </select>
        </div>
        <Models task={task} />
      </div>
      {clientState === 'loaded' && aiMaskClient &&
        <>
          {task === 'chat' && <Chat />}
          {task === 'translation' && <Translate />}
        </>
      }
      {clientState === 'error' &&
        <div className='text-red-500'>failed to connect, have you installed the extension ?</div>
      }
      {clientState === 'loading' &&
        <div className='text-orange-500'>Loading client...</div>
      }

      <a
        href="https://github.com/pacoccino/ai-mask"
        target="_blank"
        rel="noreferrer"
        className="underline mt-4"
      >
        Source code
      </a>
    </div>
  )
}
