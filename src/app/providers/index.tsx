import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import '@/shared/i18n'
import { store } from './store'

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <BrowserRouter>{children}</BrowserRouter>
    </Provider>
  )
}
