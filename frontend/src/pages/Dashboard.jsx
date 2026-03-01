import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useUser, useAuth } from '@clerk/clerk-react'
import { getProjects, syncUser } from '../api'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function load() {
      try {
        if (user) {
          await syncUser(user, getToken)
          const data = await getProjects(getToken)
          setProjects(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, getToken])

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Your Projects</h1>
        <Link to="/create" className="btn-create">+ New Project</Link>
      </div>
      {error && <div className="error-banner">{error}</div>}
      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◇</div>
          <h2>No projects yet</h2>
          <p>Create your first AI-generated website in seconds.</p>
          <Link to="/create" className="btn-create">Create your first site</Link>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <Link key={p._id} to={`/project/${p._id}`} className="project-card">
              <div className="card-preview">
                {p.current_code ? (
                  <div className="preview-placeholder ready">✓</div>
                ) : (
                  <div className="preview-placeholder loading">Generating...</div>
                )}
              </div>
              <div className="card-info">
                <h3>{p.name || 'Untitled'}</h3>
                <p className="card-prompt">{p.initial_prompt?.slice(0, 60)}...</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
