import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import '@/shared/i18n'
import { store } from './store'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <BrowserRouter>
        {children}
        <Toaster position="top-center" theme="dark" richColors closeButton />
      </BrowserRouter>
    </Provider>
  )
}
