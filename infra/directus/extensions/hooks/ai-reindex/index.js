module.exports = ({ filter, action }, { services, exceptions }) => {
    const { ItemsService } = services;

    // Hook into products and spare_parts changes
    const collections = ['products', 'spare_parts'];

    action('items.create', async ({ collection, payload, key }) => {
        if (!collections.includes(collection)) return;

        console.log(`[AI-Index] New item created in ${collection}: ${key}`);
        await triggerReindex(collection, key);
    });

    action('items.update', async ({ collection, keys }) => {
        if (!collections.includes(collection)) return;

        for (const key of keys) {
            console.log(`[AI-Index] Item updated in ${collection}: ${key}`);
            await triggerReindex(collection, key);
        }
    });

    async function triggerReindex(collection, id) {
        const endpoint = collection === 'products' ? 'reindex' : 'reindex-spare';
        // Using internal docker network name 'backend'
        const url = `http://backend:8000/catalog/${endpoint}/${id}`;

        try {
            const response = await fetch(url, { method: 'POST' });
            if (response.ok) {
                console.log(`[AI-Index] Successfully triggered reindex for ${id}`);
            } else {
                console.error(`[AI-Index] Failed to trigger reindex for ${id}: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.error(`[AI-Index] Error triggering reindex for ${id}:`, error.message);
        }
    }
};
