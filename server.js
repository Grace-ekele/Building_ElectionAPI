const  express = require("express")
const mongoose = require("mongoose")
PORT = 9876

const app = express()
app.use(express.json())

app.get("/",(req,res)=>{res.status(200).json({message:"Welcome to this election API"})})

const electionSchema = mongoose.Schema({
    state: String,
    parties: {type:Array},
    result: {
        apc : {type:Number,required: [true, "Number is required"] },
        pdp : {type:Number,required: [true, "Number is required"] },
        lp : {type:Number,required: [true, "Number is required"] },
        apga : {type:Number,required: [true, "Number is required"] }
    },
    isRigged: {
        type: Boolean,
        default: function () {
          let totalVoters = 0;
          for (const [key, value] of Object.entries(this.result)) {
            totalVoters += value;
          }
          if (totalVoters > this.totalRegisteredVoters) {
            return true;
          } else {
            return false;
          }
        },
      },
      totalLg: Number,
      winner: {
          type: String,
          default: function () {
            let key = null;
            let keyValue = -Infinity;
            for (const [key, value] of Object.entries(this.result)) {
              if (value > maxValue) {
                maxValue = value;
                maxKey = key;
                
              }
            }if (this.isRigged === false)
            {return `is ${Key} with ${keyValue} votes`;}
            else {return "\n  there is no winner because it was rigged" }
          },
          required: false,
        },
        totalVoters: {
            type: Number,
            default: function () {
              let totalVoters = 0;
              for (const [key, value] of Object.entries(this.result)) {
                totalVoters += value;
              }
              return totalVoters;
            },
          },
          totalRegisteredVoters: {
            type: Number,
            required: [
              true,
              "Enter the total number of registerd voters in this state",
            ],
          },
    

})

const electionModel = mongoose.model("Presidential Election", electionSchema)

// create an entry
app.post("/create",async (req,res)=>{try {
    const newEntry = await electionModel.create(req.body)
    res.status(200).json({data:newEntry})
} catch (error) {res.send(error.message)
    console.log(error.message)
}
})

// get all the entries
app.get("/election", async (req, res) => {
    try {
      const entry = await electionModel.find();
      if (!entry) {
        res.status(404).json({
          message: "database not found",
        });
      } else if (entry.length == 0) {
        res.status(200).json({
          message: "no entry on the database",
        });
      } else {
        res.status(200).json({
          message: "successful",
          data: entry,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });   

// Getting where the election is rigged
app.get("/electionRigged", async (req, res) => {
    try {
      const riggedEntry = await electionModel.find({isRigged:true});
      if (!riggedEntry) {
        res.status(404).json({
          message: "database not found",
        });
      } else if (riggedEntry.length == 0) {
        res.status(200).json({
          message: "no entry on the database",
        });
      } else {
        res.status(200).json({
          message: "successful",
          data: riggedEntry,
        });
      }
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

// to delete the rigged elections
app.delete("/riggedElection", async (req,res)=>{
    try {
        const riggedElection = await electionModel.find({isRigged:true})
        const deletedEntry = await electionModel.deleteMany({isRigged:true})
        res.status(200).json({
            message:"These are the rigged Elections and will be deleted",
            data:riggedElection,
            status:deletedEntry
        })
    } catch (error) {
        console.log(error.message)
    }
})

// to get winner in a particular state
app.get("/winner/:state", async (req, res) => {
    try {
        const stateName = req.params.state
        const statePosition = await electionModel.find({state:stateName})
        const winningParty =statePosition[0].winner
        res.status(200).json({message:`The Winner of the Election in ${stateName} state ${winningParty} `})
    } catch (error) {
        
    }
})

const databaseUrl = 'mongodb://localhost/ElectionDB'

mongoose.connect(databaseUrl).then( () => {
    console.log("Successfully connected to the database");
} ).catch( ( error ) => {
    console.log(error.message)
} )

app.listen(PORT,()=>{console.log("This port is working")})