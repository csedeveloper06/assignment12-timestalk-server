const express = require ('express');
const app = express();
require('dotenv').config()
const cors = require('cors');
const port = process.env.PORT || 5000;

// middlewares 
app.use(cors());
app.use(express.json());

app.get('/', (req,res)=> {
    res.send('Times Talk is running')
})

app.listen(port, ()=>{
    console.log(`Times Talk is running on port ${port}`)
})

