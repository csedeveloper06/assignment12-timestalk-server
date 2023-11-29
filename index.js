const express = require ('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middlewares 
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jwzzltb.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const articlesCollection = client.db('timesTalkDb').collection('articles');
    const reviewCollection = client.db('timesTalkDb').collection('review');
    const usersCollection = client.db('timesTalkDb').collection('users');


   
      // users related api

      app.post('/users', async(req,res)=> {
        const user = req.body;
        // insert email if user doesnt exists: 
        // you can do this many ways (1. email unique, 2. upsert 3. simple checking)
        const query = { email: user.email }
        const existingUser = await usersCollection.findOne(query);
        if (existingUser) {
            return res.send({ message: 'user already exists', insertedId: null })
        }
        const result = await usersCollection.insertOne(user);
        res.send(result);
    })
 

    app.get('/articles', async(req,res) => {
        const result = await articlesCollection.find().toArray();
        res.send(result);
    })

    app.get('/review', async(req,res) => {
        const result = await reviewCollection.find().toArray();
        res.send(result);
    })

   

    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    
  }
}
run().catch(console.dir);



app.get('/', (req,res)=> {
    res.send('Times Talk is running')
})

app.listen(port, () => {
    console.log(`Times Talk is running on port ${port}`)
})

