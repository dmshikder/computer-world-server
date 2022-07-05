const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wyqlabu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        await client.connect();
        const inventoryCollection = client.db('computer-world').collection('product');

        const myItemCollection = client.db('computer-world').collection('myItem');

        app.get('/inventory', async(req,res)=>{
            const query = {};
            const cursor = inventoryCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

app.get('/inventory/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const product = await inventoryCollection.findOne(query);
    res.send(product);
});

// post 
app.post('/inventory', async(req,res)=>{

   

    const newProduct = req.body;
    const result = await inventoryCollection.insertOne(newProduct);
    res.send(result);
});

// delete 
app.delete('/inventory/:id', async(req,res)=>{
    const id = req.params.id;
    const query = {_id: ObjectId(id)};
    const result = await inventoryCollection.deleteOne(query);
    res.send(result);
});

// my items  api 

    app.get('/myItem', async(req,res)=>{
        const email = req.query.email;
        const query ={email};
        const cursor = myItemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
    })





    app.post('/myItem', async(req,res) =>{
        const item = req.body;
        const result = await myItemCollection.insertOne(item);
        res.send(result);
    });

// app.get('/inventory', async(req,res)=>{
//     const email = req.query.email;
//     console.log(email);
//     const query = {email:email};
   
//     const cursor = inventoryCollection.find(query);
//     const myItems = await cursor.toArray();
//     res.send(myItems);
// })

    }
    finally{

    }

}
run().catch(console.dir);



app.get('/', (req,res)=>{
    res.send('running server')
});

app.listen(port, ()=>{
    console.log('listening', port)
})