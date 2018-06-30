import Character from '../models/character'

export default class Warden {
    constructor() {
        let date = new Date();
        this.day = date.getDate();
    }

    watch () {
        setInterval(this.check, 1000 * 60);
    }

    async check() {
        let date = new Date();
        if (date.getDay() == 6 || date.getDay() == 0) return;

        let day = date.getDate();
        if (day == this.day) return;
        this.day = day;

        let chars = await Character.allCharacters();

        Object.keys(chars).forEach(key => {
            let char = new Character(chars[key]);

            if (!char.data.enlisted) return true;

            if (!char.data.checked_in) {
                let demerits = char.data.demerits + 1;
                char.update({demerits: demerits, previous_demerits: char.data.demerits, streak: 0});
            }
            else {
                let streak = char.data.streak;
                if (char.data.previous_demerits == char.data.demerits) streak++;

                char.update({checked_in: 0, demerits: 0, previous_demerits: char.data.demerits, streak: streak});
                char.addXP(100 + (142 * streak));
            }
                
        });
    }
}