const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    console.log("decoded", decoded);
    req.decoded = decoded;
    next();
  });

  
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wyqlabu.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const inventoryCollection = client
      .db("computer-world")
      .collection("product");

    const myItemCollection = client.db("computer-world").collection("myItem");

    // auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    app.get("/inventory", async (req, res) => {
      const query = {};
      const cursor = inventoryCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await inventoryCollection.findOne(query);
      res.send(product);
    });

    // post
    app.post("/inventory", async (req, res) => {
      const newProduct = req.body;
      const result = await inventoryCollection.insertOne(newProduct);
      res.send(result);
    });

    // update items quantity
    app.put('/inventory/:id', async(req,res)=>{
      const id = req.params.id;
      const updatedQuantity = req.body;
      const filter = {_id: ObjectId(id)};
      const option = {upsert: true};
      const updatedDoc = {
        $set: updatedQuantity
      };
      const result = await inventoryCollection.updateOne(filter, updatedDoc, option);
      res.send(result);

    })

    // delete
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await inventoryCollection.deleteOne(query);
      res.send(result);
    });

    // my item delete

    app.delete("/inventory/:id",   async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        const result = await myItemCollection.deleteOne(query);
        res.send(result);
      });

    // my items  api

    app.get("/myItem", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = myItemCollection.find(query);
        const items = await cursor.toArray();
        res.send(items);
      }
      else{
        res.status(403).send({message: 'forbidden access'})
      }
    });

    app.post("/myItem", async (req, res) => {
      const item = req.body;
      const result = await myItemCollection.insertOne(item);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running server");
});

app.listen(port, () => {
  console.log("listening", port);
});
