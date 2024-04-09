import Chat from './Chat';
import ModelSelector from './Models';
import { useAIMask } from './context';

export default function App() {
  const { aiMaskClient, clientState } = useAIMask()
  return (
    <div className="flex flex-col items-center p-4 h-screen">
      <h1>AI-Mask Demo App (worker)</h1>
      <p className='mb-4'>Example app for using AI-Mask Chrome extension within a web worker for AI inference</p>

      <div className='flex flex-row mb-4 w-full justify-center space-x-2'>
        <div className="w-1/2 max-w-64">
          <h2 className='mb-2'>Model</h2>
          <ModelSelector task="chat" />
        </div>
      </div>
      <div className='flex-1 w-full overflow-auto flex flex-col items-center'>
        {clientState === 'loaded' && aiMaskClient &&
          <Chat />
        }
        {clientState === 'not-available' &&
          <div className='bg-orange-100 border border-orange-400 rounded-md p-4'>
            <p>😟 AI-Mask extension not found, have you <a href="https://chromewebstore.google.com/detail/lkfaajachdpegnlpikpdajccldcgfdde" target='_blank' className='underline'>installed it</a> ?</p>
          </div>
        }
        {clientState === 'loading' &&
          <div className='text-orange-500'>Loading client...</div>
        }
      </div>

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
