import { useState } from 'react'

const ApiTest = () => {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      setResult(`✅ Connection works! Response: ${JSON.stringify(data)}`)
    } catch (error) {
      setResult(`❌ Connection failed: ${error.message}`)
    }
    setLoading(false)
  }

  const testRegister = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          role: 'buyer'
        })
      })
      const data = await response.json()
      setResult(`✅ Register test: ${JSON.stringify(data)}`)
    } catch (error) {
      setResult(`❌ Register failed: ${error.message}`)
    }
    setLoading(false)
  }

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', margin: '20px' }}>
      <h3>🔧 API Connection Test</h3>
      <button onClick={testConnection} disabled={loading}>
        Test Connection
      </button>
      <button onClick={testRegister} disabled={loading} style={{ marginLeft: '10px' }}>
        Test Register
      </button>
      {loading && <p>Testing...</p>}
      {result && <pre style={{ background: 'white', padding: '10px', marginTop: '10px' }}>{result}</pre>}
    </div>
  )
}

export default ApiTest
