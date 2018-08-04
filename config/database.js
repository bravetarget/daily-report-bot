require('dotenv').load();

import sqlite from 'sqlite3';
import mongoose from 'mongoose';

let db;
const server = process.env.DB_SERVER;

if (server) {
    const database = process.env.DB_NAME || 'lloyd';
    const user = process.env.DB_USER;
    const pass = process.env.DB_PASS;

    db = mongoose.connect(`mongodb://${user}:${pass}@${server}/${database}`, { useNewUrlParser: true })
       .then(() => {
         console.log('connected to external database');

         initMongo();
       })
       .catch(err => {
         console.error(err);
       });
}
else {
    db = new sqlite.Database("./data.sqlite", er => {
        if (er) {
            console.error(er);
            return;
        }
    
        console.log('connected to database');
    
        initSQL();
    });
}

function initMongo() {
    if (db.init) db.init();
}

function initSQL() {
    
    db.run("CREATE TABLE IF NOT EXISTS characters (id TEXT, name TEXT, xp REAL, total_xp REAL, gold INTEGER, level INTEGER, rank TEXT, demerits INTEGER, contributions INTEGER, checked_in INTEGER, latest_update TEXT, enlisted INTEGER, streak INTEGER, previous_demerits INTEGER)", (err) => {
        if (err) console.log(err);
        
        if (db.init) db.init();
    });

}


export default db;