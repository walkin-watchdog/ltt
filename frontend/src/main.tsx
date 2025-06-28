import { createRoot } from 'react-dom/client'
import './index.css'
import { Provider } from 'react-redux';
import { store } from './store/store';
import App from './App.tsx'
import { Toaster } from 'react-hot-toast';

createRoot(document.getElementById('root')!).render(
    <Provider store={store}>
        <Toaster position="top-right" toastOptions={{
            duration: 4000,
            style: {
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            },
            success: {
                style: {
                    border: '1px solid #D1FAE5',
                    borderLeft: '4px solid #10B981',
                },
                iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                },
            },
            error: {
                style: {
                    border: '1px solid #FEE2E2',
                    borderLeft: '4px solid #EF4444',
                },
                iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                },
            },
        }} />
        <App />
    </Provider>
)