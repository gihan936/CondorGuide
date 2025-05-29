const { MongoClient } = require('mongodb');
require('dotenv').config({path: './config.env'});

async function connectToDatabase() {

    const Db = process.env.ATLAS_URL 
    const client = new MongoClient(Db)

    try {
        await client.connect()
        const collections =  await client.db('CondorGuide').collections()
        console.log('Connected to database')
    } catch (error) {
        console.error('Error connecting to database:', error)
    } finally {
        await client.close()
    }
}

connectToDatabase()
module.exports = connectToDatabase;