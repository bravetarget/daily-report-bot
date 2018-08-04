import db from '../config/database';
import mongoose from 'mongoose';

const external = (mongoose.connection.readyState === 1 || process.env.DB_SERVER);

export default class Model {
    constructor(table) {
        this.table = table;
        this.data = {};
    }

    mapData (data) {
        Object.keys(data).forEach(key => { this.data[key] = data[key]; }) 
    }

    _model () {
        
    }

    create() {
        if (external) {
            let model = this._model(this.data);
            model.save().then(() => {
                console.log('creating char');
                console.log(this.data);
            }).catch(er => console.log(er));
            return;
        }

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

        return new Promise((resolve, reject) => {
            if (external) {
                self.model.findOneAndUpdate(
                    {id: self.data.id},
                    data)
                .then(() => {
                    self.mapData(data);
                    resolve(self.data);
                }).catch(err => console.log(err));
                
                return;
            }

            let assignments = [];
            Object.keys(data).forEach((key) => { assignments.push(`${key} = '${data[key]}'`); });

            let query = `UPDATE ${this.table} SET ${Object.values(assignments).join(',')} WHERE id = ${this.data.id}`;
            console.log(query);

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
            if (external) {
                self.model.findOne({id: id})
                .then(doc => {
                    if (!doc) {
                        resolve(null);
                        return;
                    }
                    self.mapData(doc._doc);
                    resolve(self.data);
                }).catch(err => console.log(err));

                return;
            }

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
            if (external) {
                if (!table.find) {
                    reject('No model passed');
                    return;
                }
                table.findOne({[key]: value})
                .then(doc => {
                    if (!doc) {
                        reject('No data found');
                        return;
                    }
                    resolve(doc._doc);
                }).catch(err => reject(err));

                return;
            }

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