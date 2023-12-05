const express = require ('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const jwt = require('jsonwebtoken');
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
    const cartCollection = client.db('timesTalkDb').collection('carts');
    const usersCollection = client.db('timesTalkDb').collection('users');


       // jwt related api
       app.post('/jwt', async (req, res) => {
        const user = req.body;
        const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
        res.send({ token });
      })


      // middlewares 
      const verifyToken = (req, res, next) => {
        console.log('inside verify token', req.headers.authorization);
        if (!req.headers.authorization) {
          return res.status(401).send({ message: 'unauthorized access' });
        }
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
          if (err) {
            return res.status(401).send({ message: 'unauthorized access' })
          }
          req.decoded = decoded;
          next();
        })
    }



       // use verify admin after verifyToken
       const verifyAdmin = async (req, res, next) => {
        const email = req.decoded.email;
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        const isAdmin = user?.role === 'admin';
        console.log(isAdmin);
        if (!isAdmin) {
          return res.status(403).send({ message: 'forbidden access' });
        }
        next();
      }




      // carts collection
      app.get('/carts', async (req, res) => {
        const email = req.query.email;
        const query = { email: email };
        const result = await cartCollection.find(query).toArray();
        res.send(result);
      });
  
      app.post('/carts', async (req, res) => {
        const cartItem = req.body;
        const result = await cartCollection.insertOne(cartItem);
        res.send(result);
      });
  
      app.delete('/carts/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await cartCollection.deleteOne(query);
        res.send(result);
      })
   
      // users related api

    app.get('/users',  verifyToken, verifyAdmin, async (req, res) => {
        const result = await usersCollection.find().toArray();
        res.send(result);
    });

    app.get('/users/admin/:email', verifyToken, async (req, res) => {
        const email = req.params.email;

        if (email !== req.decoded.email) {
          return res.status(403).send({ message: 'forbidden access' })
        }
        const query = { email: email };
        const user = await usersCollection.findOne(query);
        let admin = true;
        if (user) {
            admin = user?.role === 'admin';
        }
        res.send({ admin });
    })

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


    app.patch('/users/admin/:id',  verifyToken, verifyAdmin, async (req, res) => {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedDoc = {
          $set: {
            role: 'admin'
          }
        }
        const result = await usersCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })


    app.delete('/users/:id',  verifyToken, verifyAdmin, async(req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await usersCollection.deleteOne(query);
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

