const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(" plant server running");
});

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
console.log(process.env.DB_USER, process.env.DB_PASS);
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@clusteralpha.2srbfo8.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAlpha`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const plantDatabase = client.db("plantDatabase");
    const plantCollection = plantDatabase.collection("plants");
    const usersCollection = plantDatabase.collection("usersInfo");
    // app post

    app.post("/plants", async (req, res) => {
      const newPlant = req.body;
      console.log(newPlant);
      const result = await plantCollection.insertOne(newPlant);
      res.send(result);
    });

    // app get
    app.get("/plants", async (req, res) => {
      const cursor = plantCollection.find();
      const result = await cursor.toArray();
      console.log(result);
      res.send(result);
    });

    app.get("/myplants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.findOne(query);
      res.send(result);
    });
    app.get("/plants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.findOne(query);
      res.send(result);
    });

    // app UPDATE
    app.put("/myplants/:id", async (req, res) => {
      const _id = req.params.id;
      const filter = { _id: new ObjectId(_id) };
      const option = { upsert: true };
      const updatedPlantDetails = req.body;
      const updatedDoc = {
        $set: updatedPlantDetails,
      };
      const result = await plantCollection.updateOne(
        filter,
        updatedDoc,
        option
      );
      res.send(result);
    });

    // app delete
    app.delete("/myplants/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await plantCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });

    // user api
    app.get("/users", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        return res
          .status(400)
          .send({ error: "Email query parameter is required" });
      }
      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(user);
    });

    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const userProfile = req.body;
      const result = await usersCollection.insertOne(userProfile);
      res.send(result);
    });

    // Add a GET endpoint if needed for the loader
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid user ID format" });
      }
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedUser = { $set: req.body };
      try {
        const result = await usersCollection.updateOne(
          filter,
          updatedUser,
          option
        );
        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Update Failed" });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 2 });
    console.log("You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`plant server runnig port: ${port}`);
});
