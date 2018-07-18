import Model from './model'
import db from '../config/database'

class Character extends Model {
    constructor (data) {
        super("characters");
        if (data) this.mapData(data);
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

    addXP (xp) {
        if (isNaN(xp)) { console.log('bad XP gains'); return; }

        this.data.xp += xp;
        this.data.total_xp += xp;

        let xpRequired = (this.data.level * 1.42) * 42;
        if (this.data.xp >= xpRequired) {
            this.data.xp -= xpRequired;
            this.levelUp();
        }

        console.log(this.data.name + " gained " + xp + "XP");

        this.update({xp: this.data.xp, total_xp: this.data.total_xp, level: this.data.level});
    }

    levelUp () {
        this.data.level++;
        
        let goldBonus = Math.floor((Math.random() * this.data.level) + (Math.random() * this.data.level));
        this.data.gold += goldBonus;

        console.log(this.data.name + " leveled up!  They are now level " + this.data.level + " and gained " + goldBonus + " gold.");
    }

    transferGold (to, amt) {
        const self = this;
        return new Promise((resolve, reject) => {
            if (self.data.gold < amt) { reject('you are a toy..you cant fly (or gift that amount)'); return; }
    
            self.data.gold -= amt;
            to.data.gold += amt;

            self.update({gold: self.data.gold});
            to.update({gold: to.data.gold});

            resolve(this.data.name + ' gave ' + amt + ' gold to ' + to.data.name + '. <:hanks:350378992550936586>');
        });
    }

    static allCharacters() {
        return new Promise((resolve, reject) => {
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
        let data = await super.lookup('characters', 'name', name);
        return new Character(data);
    }
}

module.exports = Character;