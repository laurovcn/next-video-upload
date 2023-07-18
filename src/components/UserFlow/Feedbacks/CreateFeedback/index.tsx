import { useAuthStore } from '@/stores/AuthStore'
import { getUserToken } from '@/pages/api/providers/auth.provider'
import { useRouter } from 'next/router'
import {
  Box,
  FormControl,
  FormLabel,
  Text,
  Stack,
  Textarea,
  Input,
  Container,
  useToast,
} from '@chakra-ui/react'
import { useForm, SubmitHandler } from 'react-hook-form'
import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserFeedback } from '@/pages/api/providers/user-feedbacks.provider'
import { useUserNavigationStore } from '@/stores/UserStore/Navigation'
import React, { useState } from 'react'
import { Video } from '@/hooks/useVideos'
import { Mic2 } from 'lucide-react'
import { MainForm } from '@/components/MainForm'

const maxFileSize = 300 * 1024 * 1024
const imageTypes = ['video/mp4', 'video/3gp', 'video/quicktime']

const createFeedbackFormSchema = z.object({
  diet: z
    .string()
    .min(0)
    .max(200, { message: 'A mensagem deve ter no máximo 200 caracteres' })
    .optional(),
  workouts: z
    .string()
    .min(0)
    .max(200, { message: 'A mensagem deve ter no máximo 200 caracteres' })
    .optional(),
  weight: z.coerce
    .number()
    .min(1, { message: 'O peso deve ser informado' })
    .max(400, { message: 'Peso máximo 400KG' })
    .optional(),
  fatigue: z
    .string()
    .min(0)
    .max(200, { message: 'A mensagem deve ter no máximo 200 caracteres' })
    .optional(),
  others: z
    .string()
    .min(0)
    .max(200, { message: 'A mensagem deve ter no máximo 200 caracteres' })
    .optional(),
  videos: z
    .any()
    .refine(
      (obj) => {
        if (obj) {
          Object?.entries(obj)
          for (const file of obj) {
            if (file.size > maxFileSize) {
              return false
            }
          }
          return true
        }
      },
      { message: 'O tamanho de cada vídeo deve ser no máximo 300 megabytes.' },
    )
    .refine(
      (obj) => {
        if (obj) {
          Object?.entries(obj)
          for (const file of obj) {
            if (!imageTypes.includes(file.type)) {
              return false
            }
          }
          return true
        }
      },
      { message: 'Por favor, selecione apenas vídeos.' },
    )
    .optional(),
})

type createFeedbackFormSchemaType = z.infer<typeof createFeedbackFormSchema>

export default function CreatingFeedback() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { setIsShowingDashboard, setIsShowingCreateFeedbacks } =
    useUserNavigationStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<createFeedbackFormSchemaType>({
    resolver: zodResolver(createFeedbackFormSchema),
  })
  const toast = useToast()

  const [videos, setVideos] = useState<Map<string, Video>>(new Map())
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [step, setStep] = useState<'upload' | 'transcribe' | 'generate'>(
    'upload',
  )

  const onSubmit: SubmitHandler<createFeedbackFormSchemaType> = async (
    data,
  ) => {
    try {
      const token = getUserToken()
      console.log('teste')
      if (!token) {
        toast({
          title: 'Sua sessão expirou.',
          description: 'Por favor, faça login novamente.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        router.push('/login')
        return
      }

      setIsTranscribing(true)

      const formData = new FormData()
      formData.append('diet', String(data.diet))
      formData.append('workouts', String(data.workouts))
      formData.append('weight', String(data.weight))
      formData.append('fatigue', String(data.fatigue))
      formData.append('others', String(data.others))
      formData.append('userId', String(user?.id))

      await createUserFeedback(token, formData as any)
      toast({
        title: 'Feedback criado com sucesso',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao criar feedback',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsShowingCreateFeedbacks()
      setIsShowingDashboard()
      setIsTranscribing(false)
    }
  }

  return (
    <>
      <Container maxW="7xl" p={{ base: 3, md: 1 }} m={3}>
        <Box
          mt={3}
          mb={4}
          p={8}
          bgColor={'whiteAlpha.100'}
          rounded={'lg'}
          border={'1px'}
          borderColor={'whiteAlpha.200'}
          backdropBlur={'1rem'}
          backdropFilter="blur(15px)"
          boxShadow={'lg'}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack m={3}>
              <FormControl gridColumn="span 1">
                <FormLabel>Peso</FormLabel>
                <Input {...register('weight')} placeholder="Peso" isRequired />
                {errors.weight && <Text>{errors.weight.message}</Text>}
              </FormControl>

              <FormControl gridColumn="span 1">
                <FormLabel>Dieta</FormLabel>
                <Textarea {...register('diet')} placeholder="Dieta" />
                {errors.diet && <Text>{errors.diet.message}</Text>}
              </FormControl>

              <FormControl gridColumn="span 1">
                <FormLabel>Treinos</FormLabel>
                <Textarea {...register('workouts')} placeholder="Treinos" />
                {errors.workouts && <Text>{errors.workouts.message}</Text>}
              </FormControl>

              <FormControl gridColumn="span 1">
                <FormLabel>Fadiga</FormLabel>
                <Textarea {...register('fatigue')} placeholder="Fadiga" />
                {errors.fatigue && <Text>{errors.fatigue.message}</Text>}
              </FormControl>

              <FormControl gridColumn="span 1">
                <FormLabel>Outros</FormLabel>
                <Textarea {...register('others')} placeholder="Outros" />
                {errors.others && <Text>{errors.others.message}</Text>}
              </FormControl>

              <FormControl gridColumn="span 2" mt={3}>
                <MainForm/>
              </FormControl>
            </Stack>
          </form>
        </Box>
      </Container>
    </>
  )
}
