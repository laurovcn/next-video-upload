import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { UploadVideosStep } from './UploadVideosStep'
import { Video } from '@/hooks/useVideos'
import { useVideosStore } from '@/stores/VideoStore'

const formSchema = z.object({
  transcriptionPrompt: z.string(),
})

type FormSchema = z.infer<typeof formSchema>

export function MainForm() {
  const [videos, setVideos] = useState<Map<string, Video>>(new Map())
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [step, setStep] = useState<'upload' | 'transcribe' | 'generate'>(
    'upload',
  ) 

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),   
  })

  const { finalVideo } = useVideosStore()

  async function handleGenerate(data: FormSchema) {
    setIsTranscribing(true)
    console.log(finalVideo)      

    setIsTranscribing(false)
  }

  function handleUploaded(videos: Map<string, Video>) {
    setVideos(videos)
    setStep('transcribe')
  }

  return (
    <form onSubmit={handleSubmit(handleGenerate)}>
      {step === 'upload' && <UploadVideosStep onNextStep={handleUploaded} />}
      {step === 'transcribe' && (
        <div className="flex flex-col gap-2">
        
          <input
            id="transcription_prompt"    
            spellCheck={false}
            className="min-h-[160px] w-full flex-1 rounded border border-zinc-200 px-4 py-3 leading-relaxed text-zinc-900"
            {...register('transcriptionPrompt')}
          />
          
          <button
            type="submit"
            disabled={isTranscribing}
            className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >            
            Enviar feedback - {videos.size} Vídeos
          </button>
        </div>
      )}
    </form>
  )
}
