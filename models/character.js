import Model from './model'
import db from '../config/database'
import mongoose from 'mongoose'
import ext from './character.model'

const external = (mongoose.connection.readyState === 1 || process.env.DB_SERVER);

class Character extends Model {
    constructor (data) {
        super("characters");
        if (data) this.mapData(data);

        this.model = ext;
    }

    static creationTemplate(author) {
        return {
            id: author.id, 
            name: author.username,
            xp: 0, total_xp: 0,
            gold: 0, 
            demerits: 0, 
            previous_demerits: 0,
            contributions: 0,
            checked_in: 0,
            enlisted: 0,
            streak: 0,
            level: 1,
        }
    }

    _model(data) {
        return new ext(data);
    }

    addXP (xp) {
        if (isNaN(xp)) { console.log('bad XP gains'); return; }

        this.data.xp += xp;
        this.data.total_xp += xp;

        let xpRequired = (this.data.level * 1.21) * 42;
        if (this.data.xp >= xpRequired) {
            this.data.xp -= xpRequired;
            this.levelUp();
        }

        console.log(this.data.name + " gained " + xp + "XP");

        this.update({xp: this.data.xp, total_xp: this.data.total_xp});
    }

    levelUp () {
        this.data.level++;
        
        let goldBonus = Math.floor((Math.random() * this.data.level) + (Math.random() * this.data.level));
        this.data.gold += goldBonus;

        console.log(this.data.name + " leveled up!  They are now level " + this.data.level + " and gained " + goldBonus + " gold.");

        this.update({level: this.data.level, gold: this.data.gold});
    }

    transferGold (to, amt) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.data.gold < amt) { reject('you are a toy..you cant fly (or gift that amount)'); return; }
    
            self.data.gold -= amt;
            to.data.gold += amt;

            self.update({gold: self.data.gold});
            to.update({gold: to.data.gold});

            resolve('```css\n' + `${this.data.name} gave ${amt} gold to ${to.data.name}. 💰 -> 📀` + '\n```');
        });
    }

    static allCharacters() {
        return new Promise((resolve, reject) => {
            if (external) {
                ext.find({})
                .then(docs => {
                    resolve(docs.map(doc => doc._doc));
                }).catch(err => reject(err));

                return;
            }

            db.all('SELECT * FROM characters', (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(res);
            });
        });
    }

    static async byName(name) {
        try {
            let data = await super.lookup(!external ? 'characters' : ext, 'name', name);
            return new Character(data);
        }
        catch (er) {
            console.log(er);
        }
    }
}

module.exports = Character;