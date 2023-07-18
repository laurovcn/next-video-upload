import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { UploadVideosStep } from './UploadVideosStep'
import { Video } from '@/hooks/useVideos'

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

  async function handleGenerate(data: FormSchema) {
    setIsTranscribing(true)
    console.log(videos)
    console.log('enviando form', data)

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
          <button
            type="submit"
            disabled={isTranscribing}
            className="mt-2 inline-flex cursor-pointer items-center justify-center gap-2 rounded bg-sky-500 px-4 py-3 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
          >        
            Enviar feedback - {videos.size} vídeos
          </button>
        </div>
      )}
    </form>
  )
}
