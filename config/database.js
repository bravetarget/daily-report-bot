import sqlite from 'sqlite3';

let db = new sqlite.Database("./data.sqlite", er => {
    if (er) {
        console.error(er);
        return;
    }

    console.log('connected to database');

    init();
});

function init() {
    
    db.run("CREATE TABLE IF NOT EXISTS characters (id TEXT, name TEXT, xp REAL, total_xp REAL, gold INTEGER, level INTEGER, rank TEXT, demerits INTEGER, contributions INTEGER, checked_in INTEGER, latest_update TEXT, enlisted INTEGER, streak INTEGER, previous_demerits INTEGER)", (err) => {
        if (err) console.log(err);
        
        if (db.init) db.init();
    });

}


export default db;