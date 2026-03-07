const { GoogleAuth } = require('google-auth-library');
const logger = require('./logger');

/**
 * @param {string} query The user's question or search query.
 * @returns {Promise<string>} The concatenated text of the retrieved documents.
 */
async function searchRAG(query) {
    try {
        logger.info(`Buscando en RAG (Discovery Engine) para la query: "${query}"`);
        const auth = new GoogleAuth({
            scopes: ['https://www.googleapis.com/auth/cloud-platform'],
            keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS_RAG || process.env.GOOGLE_APPLICATION_CREDENTIALS
        });
        const client = await auth.getClient();
        const token = await client.getAccessToken();

        if (!token || !token.token) {
            throw new Error('No se pudo obtener el Access Token para Google Cloud');
        }

        const projectId = 'project-2581b264-5d72-4eff-937';
        const engineId = 'goodpawies-rag_1771982117627';
        
        const url = `https://discoveryengine.googleapis.com/v1alpha/projects/${projectId}/locations/global/collections/default_collection/engines/${engineId}/servingConfigs/default_search:search`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: query,
                pageSize: 5,
                queryExpansionSpec: { condition: "AUTO" },
                spellCorrectionSpec: { mode: "AUTO" }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            logger.error('Error de API Discovery Engine', { status: response.status, error: errorData });
            return '';
        }

        const data = await response.json();
        
        // Extract text snippets from results
        let contextText = '';
        if (data.results && data.results.length > 0) {
            contextText = data.results.map((r, i) => {
                let snippet = '';
                if (r.document && r.document.derivedStructData && r.document.derivedStructData.extractive_answers) {
                    snippet = r.document.derivedStructData.extractive_answers.map(a => a.content).join(' ');
                } else if (r.document && r.document.derivedStructData && r.document.derivedStructData.snippets) {
                    snippet = r.document.derivedStructData.snippets.map(s => s.snippet).join(' ');
                } else if (r.document && r.document.structData) {
                    snippet = JSON.stringify(r.document.structData);
                }
                
                // Limpiar HTML tags si vienen en el snippet
                snippet = snippet.replace(/<[^>]*>?/gm, '');

                return `--- Documento ${i+1} ---\n${snippet}`;
            }).join('\n\n');
            
            logger.info(`Documentos de RAG recuperados exitosamente: ${data.results.length} resultados.`);
        } else {
            logger.info('No se encontraron documentos en RAG para esta query.');
        }
        
        return contextText;

    } catch (error) {
        logger.error('Error al ejecutar searchRAG', { error: error.message });
        return ''; // Return empty so the regular model can still try to answer
    }
}

module.exports = {
    searchRAG
};
