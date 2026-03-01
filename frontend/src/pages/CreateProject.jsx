import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { createProject } from '../api'
import './CreateProject.css'

export default function CreateProject() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    try {
      const { projectId } = await createProject(prompt.trim(), user, getToken)
      navigate(`/project/${projectId}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-page">
      <div className="create-container">
        <h1>Describe your website</h1>
        <p className="create-subtitle">
          Tell the AI what you want—e.g. "A portfolio for a photographer with dark theme and gallery"
        </p>
        <form onSubmit={handleSubmit} className="create-form">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A modern landing page for a coffee shop with hero section, menu, and contact form..."
            rows={5}
            disabled={loading}
            className="create-textarea"
          />
          {error && <div className="error-msg">{error}</div>}
          <button type="submit" disabled={loading} className="btn-generate">
            {loading ? (
              <>
                <span className="btn-spinner" />
                Generating...
              </>
            ) : (
              'Generate website'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
