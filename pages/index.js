import { useState } from 'react'
import Head from 'next/head'

export default function Dashboard() {
  const [searchPii, setSearchPii] = useState('')
  const [processorId, setProcessorId] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('search')

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchPii.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/.netlify/functions/verification-search?piiData=${encodeURIComponent(searchPii)}&processorId=${processorId}`)
      const data = await response.json()
      
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setResults(data)
      }
    } catch (error) {
      alert('Search failed: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const [processorForm, setProcessorForm] = useState({
    companyName: '',
    email: '',
    plan: 'starter'
  })

  const [createdProcessor, setCreatedProcessor] = useState(null)

  const createProcessor = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/.netlify/functions/create-processor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processorForm)
      })
      const data = await response.json()
      
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        setCreatedProcessor(data)
        setProcessorForm({ companyName: '', email: '', plan: 'starter' })
      }
    } catch (error) {
      alert('Failed to create processor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Auditor Veritas - DPA Compliance Dashboard</title>
        <meta name="description" content="Immutable DPA Audit Ledger" />
      </Head>

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Auditor Veritas</h1>
              <p className="text-sm text-gray-600">Immutable DPA Audit Ledger</p>
            </div>
            <nav className="flex space-x-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'search' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Verify Compliance
              </button>
              <button
                onClick={() => setActiveTab('create')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'create' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Create Processor
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Verify DPA Compliance</h2>
              
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Processor ID (optional)
                  </label>
                  <input
                    type="text"
                    value={processorId}
                    onChange={(e) => setProcessorId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Filter by specific processor ID"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PII Data to Verify
                  </label>
                  <input
                    type="text"
                    value={searchPii}
                    onChange={(e) => setSearchPii(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email or other PII"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    This data is hashed locally and never stored in plain text.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-6 py-2 rounded-md font-medium"
                >
                  {loading ? 'Searching...' : 'Verify Compliance'}
                </button>
              </form>
            </div>

            {/* Results */}
            {results && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Results</h3>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>PII Hash:</strong> {results.piiHash}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Matches Found:</strong> {results.count}
                  </p>
                </div>

                {results.matches.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Processor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Event ID
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {results.matches.map((event) => (
                          <tr key={event.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                event.event_type === 'Data_Deletion' 
                                  ? 'bg-green-100 text-green-800'
                                  : event.event_type === 'Data_Access'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {event.event_type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(event.created_at).toLocaleString('sv-SE')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {event.processors?.company_name || 'Unknown'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {event.id.substring(0, 8)}...
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No audit events found for this PII data.</p>
                    <p className="text-sm text-gray-400 mt-2">
                      This may indicate that the processor has not logged any actions for this data subject.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Create Processor Tab */}
        {activeTab === 'create' && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Processor</h2>
            
            {createdProcessor ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">✅ Processor Created Successfully!</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Processor ID:</strong> {createdProcessor.processorId}</p>
                  <p><strong>Company Name:</strong> {createdProcessor.companyName}</p>
                  <p><strong>Plan:</strong> {createdProcessor.plan}</p>
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mt-3">
                    <p className="text-yellow-800 font-medium">🔐 API Key:</p>
                    <code className="block bg-black text-green-400 p-2 rounded mt-1 font-mono text-sm">
                      {createdProcessor.apiKey}
                    </code>
                    <p className="text-yellow-700 text-xs mt-2">{createdProcessor.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => setCreatedProcessor(null)}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Create Another Processor
                </button>
              </div>
            ) : (
              <form onSubmit={createProcessor} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={processorForm.companyName}
                    onChange={(e) => setProcessorForm({...processorForm, companyName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter company name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={processorForm.email}
                    onChange={(e) => setProcessorForm({...processorForm, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plan
                  </label>
                  <select
                    value={processorForm.plan}
                    onChange={(e) => setProcessorForm({...processorForm, plan: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="starter">Starter (10,000 events/mo)</option>
                    <option value="growth">Growth (100,000 events/mo)</option>
                    <option value="enterprise">Enterprise (1,000,000 events/mo)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white px-6 py-2 rounded-md font-medium"
                >
                  {loading ? 'Creating...' : 'Create Processor'}
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </div>
  )
}