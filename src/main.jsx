import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import FlowEditor from './FlowEditor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <FlowEditor />
  </StrictMode>,
)
