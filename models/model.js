import db from '../config/database';

export default class Model {
    constructor(table) {
        this.table = table;
        this.data = {};
    }

    mapData (data) {
        Object.keys(data).forEach(key => { this.data[key] = data[key]; }) 
    }

    create() {
        let placeholders = Object.keys(this.data).map(() => '?').join(',');
        let query = `INSERT INTO ${this.table} (${Object.keys(this.data).join(',')}) VALUES (${placeholders})`;
        console.log(query);
        
        db.run(query, Object.values(this.data), err => {
            console.log(err);
        }); 
    }

    update(data) {
        const self = this;
        data = data || this.data;

        let assignments = [];
        Object.keys(data).forEach((key) => { assignments.push(`${key} = '${data[key]}'`); });

        let query = `UPDATE ${this.table} SET ${Object.values(assignments).join(',')} WHERE id = ${this.data.id}`;
        console.log(query);

        return new Promise((resolve, reject) => {
            db.run(query, err => {
                if (err) {
                    reject('Failed to update');
                    return;
                }

                self.mapData(data);
                resolve(self.data);
            });
        });
    }

    findById(id) {
        const self = this;
        id = id || this.data.id;

        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM ${self.table} WHERE id = ${id}`;
            console.log(query);
            db.get(query, (err, result) => {
                console.log(result);
                if (err || !result) {
                    console.log(err);
                    resolve(null);
                    return;
                }

                self.mapData(result);
                resolve(self.data);
            });
        });
    }

    static lookup(table, key, value) {
        return new Promise((resolve, reject) => {
            let query = `SELECT * FROM ${table} WHERE ${key} = '${value}'`;
            console.log(query);
            db.get(query, (err, result) => {
                console.log(result);
                if (err) {
                    console.log(err);
                    reject(err);
                    return;
                }

                if (!result) {
                    reject('No data found');
                    return;
                }

                resolve(result);
            });
        });
    }
}