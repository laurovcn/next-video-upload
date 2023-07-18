import { Header } from "@/components/Home/Header";
import { MainForm } from "@/components/MainForm";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6">   
    <div className="flex w-full max-w-xl flex-col gap-4 rounded-lg bg-white p-6 shadow">
      <MainForm />
    </div>
  </div>
  )
}
