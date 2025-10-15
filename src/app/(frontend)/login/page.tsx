import LoginForm from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login Alumni',
  description: 'Login untuk mengakses dashboard alumni',
}

export default function LoginPage() {
  return <LoginForm />
}
