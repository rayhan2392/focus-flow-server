import { Server } from "http";
import app from "./app.js";


let server:Server;

const startServer = ()=>{
    try {

        server = app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
        
    } catch (error) {
        console.log(error);
    }
}


startServer();


//signal termination error(comes from virtual server)
process.on("SIGTERM", () => {
    console.log('Signal termination detected...server shuting down...')
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

//signal initialization error(comes from sudden off of local server)
process.on("SIGINT", () => {
    console.log('Signal initialization detected...server shuting down...')
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})


//managing unhandled error

process.on("unhandledRejection", (err) => {
    console.log('Unhandled Rejection detected...server shuting down...', err)
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})

//managing uncaght error

process.on("uncaughtException", (err) => {
    console.log('Uncaught exception detected...server shuting down...', err)
    if (server) {
        server.close(() => {
            process.exit(1)
        })
    }
    process.exit(1)
})
