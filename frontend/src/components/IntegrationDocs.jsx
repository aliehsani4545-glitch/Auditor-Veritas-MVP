// src/components/IntegrationDocs.jsx

import React, { useState } from 'react';
import { Code, Server, Check, Copy } from 'lucide-react';

// Funktion för att simulera syntax-highlighting
const highlightCode = (code, lang) => {
    // Förenklad highlighting (använd riktigt bibliotek som Prism/Highlight.js i prod)
    let output = code
        .replace(/(\/\/.*)/g, '<span style="color:#7d8c93;">$1</span>') // Kommentarer
        .replace(/(import|const|let|var|function|return|new|await|async|class|if|else|try|catch|fetch|require|def|print|json|then)/g, '<span style="color:#007bff;font-weight:600;">$1</span>') // Nyckelord
        .replace(/(".*?"|'.*?')/g, '<span style="color:#28a745;">$1</span>') // Strängar
        .replace(/(av_[a-f0-9]{32})/g, '<span style="color:#ffc107;">$1</span>'); // API Key Placeholder
    
    // Specifika språkfärger
    if (lang === 'json') {
         output = output.replace(/(\{|\}|\[|\])/g, '<span style="color:#ced4da;font-weight:bold;">$1</span>');
    }

    return <div dangerouslySetInnerHTML={{ __html: output }} />;
};

const CodeBlock = ({ language, code }) => {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(code.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#21212c] rounded-lg shadow-xl overflow-hidden mt-4">
            <div className="flex justify-between items-center bg-[#282a36] px-4 py-2 border-b border-white/10">
                <span className="text-sm font-medium text-white/70">{language} Example</span>
                <button 
                    onClick={copyToClipboard}
                    className="flex items-center gap-1 text-xs font-medium px-3 py-1 rounded transition-colors"
                    style={{ backgroundColor: copied ? '#28a745' : '#4d4f64', color: 'white' }}
                >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? 'Kopierat!' : 'Kopiera'}
                </button>
            </div>
            <pre className="p-4 text-xs overflow-x-auto custom-scrollbar leading-relaxed font-mono">
                {highlightCode(code, language.toLowerCase())}
            </pre>
        </div>
    );
};

// --- Huvudkomponenten ---
const IntegrationDocs = ({ setActiveTab }) => {
    const [selectedLanguage, setSelectedLanguage] = useState('Node.js');

    const examples = {
        'Node.js': `
// POST /api/events
// Använder standard 'fetch' (eller Axios)
const API_KEY = "av_0123456789abcdef0123456789abcdef"; // Byt ut
const API_ENDPOINT = "https://auditor-veritas-mvp.onrender.com/api/events";

// Viktigt: user_identifier måste hashade (t.ex. med SHA-256) innan API-anrop!
const userEmail = "alice.smith@example.com";
const userHash = crypto.createHash('sha256').update(userEmail).digest('hex');

const eventData = {
    event_type: "user.login.success",
    user_identifier: userHash, 
    event_data: { 
        ip_address: "203.0.113.45",
        region: "EU-West-1"
    }
};

try {
    const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': API_KEY, 
        },
        body: JSON.stringify(eventData),
    });

    const result = await response.json();
    if (!response.ok) {
        throw new Error(result.error || 'API call failed');
    }
    console.log("Audit log skapad:", result.eventId);
} catch (error) {
    console.error("Fel vid loggning:", error.message);
}
        `,
        'Python': `
# POST /api/events
# Använder standardbiblioteket 'requests'
import requests
import hashlib
import json

API_KEY = "av_0123456789abcdef0123456789abcdef" # Byt ut
API_ENDPOINT = "https://auditor-veritas-mvp.onrender.com/api/events"

# Viktigt: user_identifier måste hashade (t.ex. med SHA-256)
user_email = "bob.jones@example.com"
user_hash = hashlib.sha256(user_email.encode('utf-8')).hexdigest()

event_payload = {
    "event_type": "transaction.created",
    "user_identifier": user_hash, 
    "event_data": { 
        "amount": 99.99,
        "product_id": "PROD-2309"
    }
}

headers = {
    "Content-Type": "application/json",
    "x-api-key": API_KEY
}

try:
    response = requests.post(API_ENDPOINT, headers=headers, data=json.dumps(event_payload))
    response.raise_for_status() # Utlöser undantag för 4xx/5xx fel

    result = response.json()
    print("Audit log skapad:", result['eventId'])

except requests.exceptions.HTTPError as err:
    print(f"HTTP fel vid loggning: {err}")
except Exception as e:
    print(f"Generellt fel: {e}")
        `,
        'cURL (Bash)': `
# POST /api/events
# Används ofta för snabb testning eller i CLI-miljöer
API_KEY="av_0123456789abcdef0123456789abcdef"

# OBS: cURL stöder inte SHA-256 hashing inbyggt. Hasha separat:
# user_hash=$(echo -n "user@test.com" | sha256sum | awk '{print $1}')
USER_HASH="35a9f3b1451f153f3e790a36183d294d13a697669d05a4155551f332d73d611b" 

curl -X POST 'https://auditor-veritas-mvp.onrender.com/api/events' \\
-H 'Content-Type: application/json' \\
-H "x-api-key: $API_KEY" \\
-d '{
    "event_type": "document.viewed",
    "user_identifier": "$USER_HASH",
    "event_data": {
        "document_id": "D-7788",
        "access_level": "read_only"
    }
}'
        `,
    };

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 bg-white">
            <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 bg-purple-100/50 px-3 py-1 rounded-full text-purple-600 text-sm font-bold border border-purple-200 mb-4">
                     <Code size={16} /> <span>Developer Integrations</span>
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 mb-3">Seamless & Secure Integration</h2>
                <p className="text-slate-600 max-w-3xl mx-auto text-lg">
                    Implementera Auditor Veritas på minuter. Vår API accepterar hashad (pseudonymiserad) användardata och returnerar omedelbart bekräftelse på loggad händelse.
                </p>
            </div>

            <div className="max-w-4xl mx-auto">
                {/* Språkflikar */}
                <div className="flex border-b border-slate-200 bg-slate-50/50 rounded-t-lg p-2 gap-2">
                    {Object.keys(examples).map((lang) => (
                        <button
                            key={lang}
                            onClick={() => setSelectedLanguage(lang)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
                                selectedLanguage === lang 
                                    ? 'bg-slate-900 text-white shadow-md' 
                                    : 'text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>

                {/* Kodblock */}
                <CodeBlock 
                    language={selectedLanguage} 
                    code={examples[selectedLanguage].trim()} 
                />

                {/* Dokumentationsanteckning */}
                <div className="mt-8 p-5 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-1">
                        <Server size={16} /> API Endpoint och Hashing
                    </h3>
                    <p className="text-xs text-blue-600 leading-relaxed">
                        Alla API-anrop ska riktas mot vår EU-baserade endpoint och måste inkludera `x-api-key` i headern. För GDPR-efterlevnad måste alla personligt identifierbara data (som e-postadresser eller namn) **hashas (SHA-256)** innan de skickas i fältet `user_identifier`.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IntegrationDocs;