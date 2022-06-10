const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//auth verify
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorize Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "Forbidden Access" });
    }
    req.decoded = decoded;
    next();
  });

  
}

// mongoDB
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@autovio.8ysza.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

// product api

async function run() {
  try {
    await client.connect();
    const productCollection = client.db("autoVio01").collection("products");
    const projectCollection = client.db("autoVio01").collection("projects");

    //auth
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "12h",
      });
      res.send({ accessToken });
    });

    //Get single project: Send data to client
    app.get("/project/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await projectCollection.findOne(query);
      res.send(product);
    });

    //Get Project: Send data to client
    app.get("/project", async (req, res) => {
      const query = {};
      const cursor = projectCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });
    //Get product: Send data to client
    app.get("/product", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });
    //Get product: by search user email Send data to client
    app.get("/myproduct", verifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (email === decodedEmail) {
        const query = { email: email };
        const cursor = productCollection.find(query);
        const myProduct = await cursor.toArray();
        res.send(myProduct);
      } else {
        res.status(403).send({ message: "Forbidden Access" });
      }
    });

    //Get single product: Send data to client
    app.get("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    //POST product: receive data from client
    app.post("/product", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    //update product: receive data from client
    app.put("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          email: updatedProduct.email,
          img: updatedProduct.img,
          carouselImg: updatedProduct.carouselImg,
          price: updatedProduct.price,
          supplier: updatedProduct.supplier,
          name: updatedProduct.name,
          description: updatedProduct.description,
          quantity: updatedProduct.quantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });
    //replacement product: receive data from client
    app.patch("/product/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProduct = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          quantity: updatedProduct.quantity,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //Delete product : delete product from database and client
    app.delete("/product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // await client.close()
  }
}
run().catch(console.dir);

// content api

async function content() {
  try {
    await client.connect();
    const productCollection = client.db("autoVio01").collection("content");

    //Get product: Send data to client
    app.get("/content", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const product = await cursor.toArray();
      res.send(product);
    });
  } finally {
    // await client.close()
  }
}
content().catch(console.dir);

// root app
app.get("/", (req, res) => {
  res.send("Running Auto-vio Server for heroku");
});

app.listen(port, () => {
  console.log(`Listing AutoVio - ${port}`);
});
