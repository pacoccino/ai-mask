import Prompt from './Prompt';
import Models from './Models';
import { useContext } from 'react';
import { WebAIContext } from './context';

export default function App() {
  const { webAIClient, clientState } = useContext(WebAIContext)
  return (
    <div className="flex flex-col items-center p-4">
      <h1>WebAI Example App</h1>
      <p className='mb-4'>Example app for WebAI using chome extension for AI inference</p>

      {clientState === 'loaded' && webAIClient &&
        <>
          <Models />
          <Prompt />
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
