import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <App />
    </Provider>
)