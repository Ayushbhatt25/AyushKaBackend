import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '@clerk/clerk-react'
import { getProjects, refineProject, getConversation } from '../api'
import './ProjectPreview.css'

function isCode(str) {
  if (!str || typeof str !== 'string') return false
  const trimmed = str.trim()
  return (trimmed.startsWith('{') && trimmed.includes('"files"')) || trimmed.startsWith('```')
}

function parseCode(raw) {
  if (!raw || typeof raw !== 'string') return null
  try {
    let cleaned = raw.replace(/```[a-z]*\n?|```/gi, '').trim()
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
    if (jsonMatch) cleaned = jsonMatch[0]
    const parsed = JSON.parse(cleaned)
    const files = parsed?.files || parsed
    return files && files['index.html'] ? files : null
  } catch {
    return null
  }
}

export default function ProjectPreview() {
  const { id } = useParams()
  const { getToken } = useAuth()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refinePrompt, setRefinePrompt] = useState('')
  const [refining, setRefining] = useState(false)
  const [rightView, setRightView] = useState('preview') // 'preview' | 'code'
  const [conversation, setConversation] = useState([])
  const [leftTab, setLeftTab] = useState('chat') // 'chat' | 'history'
  const [expandedMsg, setExpandedMsg] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const projects = await getProjects(getToken)
        const p = Array.isArray(projects) ? projects.find((x) => x._id === id) : null
        if (!cancelled) {
          setProject(p || null)
          if (!p) setError('Project not found')
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id, getToken])

  async function refreshProject() {
    try {
      const projects = await getProjects(getToken)
      const p = Array.isArray(projects) ? projects.find((x) => x._id === id) : null
      if (p) setProject(p)
    } catch {}
  }

  useEffect(() => {
    if (!project || parseCode(project.current_code) || project.current_code?.startsWith('ERROR')) return
    const t = setInterval(refreshProject, 5000)
    return () => clearInterval(t)
  }, [id, getToken, project])

  async function loadConversation() {
    try {
      const msgs = await getConversation(id, getToken)
      setConversation(msgs)
    } catch {}
  }

  useEffect(() => {
    if (!id || !project) return
    loadConversation()
  }, [id, project?._id])

  async function handleRefine(e) {
    e.preventDefault()
    if (!refinePrompt.trim() || refining) return
    setRefining(true)
    setError(null)
    const previousCode = project?.current_code
    try {
      await refineProject(id, refinePrompt.trim(), getToken)
      setRefinePrompt('')
      const msgs = await getConversation(id, getToken)
      setConversation(msgs)
      const pollInterval = setInterval(async () => {
        try {
          const projects = await getProjects(getToken)
          const p = Array.isArray(projects) ? projects.find((x) => x._id === id) : null
          if (p?.current_code !== previousCode) {
            setProject(p)
            setRefining(false)
            clearInterval(pollInterval)
            const msgs = await getConversation(id, getToken)
            setConversation(msgs)
          }
        } catch { /* ignore */ }
      }, 3000)
      setTimeout(() => {
        clearInterval(pollInterval)
        setRefining(false)
      }, 120000)
    } catch (err) {
      setError(err.message)
      setRefining(false)
    }
  }

  function openInNewTab() {
    const f = parseCode(project?.current_code)
    if (!f) return
    const html = buildHtml(f)
    const blob = new Blob([html], { type: 'text/html' })
    window.open(URL.createObjectURL(blob), '_blank', 'noopener,noreferrer')
  }

  if (loading) {
    return (
      <div className="preview-page">
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="preview-page">
        <div className="error-state">
          <p>{error || 'Project not found'}</p>
          <Link to="/dashboard" className="btn-back">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const files = parseCode(project.current_code)
  const isGenerating = !files && !project.current_code?.startsWith('ERROR')
  const hasError = project.current_code?.startsWith('ERROR')

  const displayConversation = conversation

  return (
    <div className="preview-page preview-page-lovable">
      <div className="preview-split">
        {/* Left: Chat panel */}
        <div className="chat-panel chat-panel-lovable">
          <div className="chat-panel-tabs">
            <button
              type="button"
              className={`chat-tab ${leftTab === 'chat' ? 'active' : ''}`}
              onClick={() => setLeftTab('chat')}
            >
              Chat
            </button>
            <button
              type="button"
              className={`chat-tab ${leftTab === 'history' ? 'active' : ''}`}
              onClick={() => setLeftTab('history')}
            >
              History
            </button>
          </div>
          <div className="conversation-list">
            {displayConversation.map((msg, idx) => {
              const isCodeMsg = isCode(msg.content)
              const isExpanded = expandedMsg === msg._id
              const shortTitle = msg.role === 'user'
                ? msg.content.slice(0, 35) + (msg.content.length > 35 ? '...' : '')
                : isCodeMsg
                  ? 'Code updated'
                  : msg.content.slice(0, 35) + (msg.content.length > 35 ? '...' : '')
              return (
                <div
                  key={msg._id}
                  className={`edit-card edit-card-${msg.role} ${isExpanded ? 'expanded' : ''}`}
                >
                  <button
                    type="button"
                    className="edit-card-header"
                    onClick={() => setExpandedMsg(isExpanded ? null : msg._id)}
                  >
                    <span className="edit-card-icon">{'<>'}</span>
                    <span className="edit-card-title">
                      Edit #{idx + 1} • {shortTitle}
                    </span>
                    <span className="edit-card-arrow">{isExpanded ? '▼' : '›'}</span>
                  </button>
                  {isExpanded && (
                    <div className="edit-card-body">
                      <div className="edit-card-actions">
                        <button
                          type="button"
                          className={`edit-mode-btn ${rightView === 'preview' ? 'active' : ''}`}
                          onClick={() => setRightView('preview')}
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          className={`edit-mode-btn ${rightView === 'code' ? 'active' : ''}`}
                          onClick={() => setRightView('code')}
                        >
                          Code
                        </button>
                      </div>
                      <div className="chat-content">
                        {isCodeMsg ? (
                          <span className="chat-code-summary">Click to view code</span>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="chat-input-bar">
            {error && <div className="refine-error-inline">{error}</div>}
            <form onSubmit={handleRefine} className="chat-input-form">
              <input
                type="text"
                value={refinePrompt}
                onChange={(e) => setRefinePrompt(e.target.value)}
                placeholder="Ask MajdurAI..."
                disabled={refining}
                className="chat-input"
              />
              <div className="chat-input-actions">
                <button type="button" className="chat-input-btn" title="Attach">📎</button>
                <button type="submit" disabled={refining || !refinePrompt.trim()} className="chat-send-btn" title="Send">
                  ↑
                </button>
              </div>
            </form>
          </div>
        </div>
        {/* Right: Preview with browser bar */}
        <div className="output-panel output-panel-lovable">
          <div className="preview-top-bar">
            <Link to="/dashboard" className="preview-back-link">← Back</Link>
            <div className="browser-bar">
              <span className="browser-lock">🔒</span>
              <span className="browser-url">preview—{project.name?.slice(0, 20) || 'project'}.majdurai.app / index</span>
            </div>
            <div className="browser-actions">
              {files && (
                <button onClick={openInNewTab} className="browser-icon-btn" type="button" title="Open in new tab">
                  ↗
                </button>
              )}
            </div>
          </div>
          {isGenerating && (
            <div className="generating-banner">
              <span className="banner-spinner" />
              AI is building your website. This usually takes 30–60 seconds.
            </div>
          )}
          {refining && (
            <div className="generating-banner">
              <span className="banner-spinner" />
              Applying your changes... This usually takes 30–60 seconds.
            </div>
          )}
          {hasError && (
            <div className="error-banner">{project.current_code}</div>
          )}
          {files && (
            <div className="output-content">
              <div className="view-tabs view-tabs-right">
                <button
                  type="button"
                  className={`view-tab ${rightView === 'preview' ? 'active' : ''}`}
                  onClick={() => setRightView('preview')}
                >
                  Preview
                </button>
                <button
                  type="button"
                  className={`view-tab ${rightView === 'code' ? 'active' : ''}`}
                  onClick={() => setRightView('code')}
                >
                  Code
                </button>
              </div>
              {rightView === 'preview' && (
                <div className="preview-frame">
                  <iframe
                    title="Generated website"
                    srcDoc={buildHtml(files)}
                    sandbox="allow-scripts"
                  />
                </div>
              )}
              {rightView === 'code' && (
                <div className="code-view">
                  <CodeView files={files} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CodeView({ files }) {
  const html = files['index.html'] || ''
  const css = files['styles.css'] || files['style.css'] || ''
  const js = files['script.js'] || ''
  return (
    <div className="code-sections">
      <section>
        <h4>index.html</h4>
        <pre><code>{html}</code></pre>
      </section>
      {css && (
        <section>
          <h4>styles.css</h4>
          <pre><code>{css}</code></pre>
        </section>
      )}
      {js && (
        <section>
          <h4>script.js</h4>
          <pre><code>{js}</code></pre>
        </section>
      )}
    </div>
  )
}

function buildHtml(files) {
  let html = files['index.html'] || ''
  const css = files['styles.css'] || files['style.css'] || ''
  const js = files['script.js'] || ''
  html = html
    .replace(/<link[^>]*href=["']styles\.css["'][^>]*>/gi, '')
    .replace(/<script[^>]*src=["']script\.js["'][^>]*><\/script>/gi, '')
  const styleTag = `<style>${css}</style>`
  if (html.includes('</head>')) {
    html = html.replace('</head>', `${styleTag}</head>`)
  } else {
    html = `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${styleTag}</head><body>${html}</body></html>`
  }
  if (js) {
    html = html.includes('</body>')
      ? html.replace('</body>', `<script>${js}</script></body>`)
      : html.replace('</html>', `<script>${js}</script></html>`)
  }
  return html
}
