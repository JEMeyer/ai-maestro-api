    import express from 'express';
    import { createClient } from 'redis';
    import { MongoClient } from 'mongodb';

    const app = express();
    const redis = createClient();
    const mongoClient = new MongoClient('mongodb://localhost:27017');

    // Connect to Redis and MongoDB
    await redis.connect();
    await mongoClient.connect();
    const db = mongoClient.db('llm_manager');

    // API endpoint to get available models
    app.get('/api/models', async (req, res) => {
    const models = await db.collection('models').find().toArray();
    res.json(models);
    });

    // API endpoint to assign model to GPU
    app.post('/api/assign', async (req, res) => {
    const { modelId, serverId, gpuId, port } = req.body;

    // Update model assignment in DB
    await db.collection('models').updateOne(
        { _id: modelId },
        { $set: { serverId, gpuId, port } }
    );

    // Send command to child server to load model
    // ...

    res.sendStatus(200);
    });

    // Start server
    app.listen(3000, () => {
    console.log('Master server listening on port 3000');
    });
