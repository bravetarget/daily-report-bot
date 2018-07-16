import Character from '../models/character'

export default class Warden {
    constructor() {
        let date = new Date();
        this.day = date.getDate();
    }

    watch (reporter) {
        let date = new Date();
        this.day = date.getDate();
        this.reporter = reporter;
        setInterval(() => { this.check(); }, 1000 * 77);
    }

    async check() {
        let date = new Date();
        if (date.getDay() == 6 || date.getDay() == 0) return;

        if (process.env.AUTO_REPORTING 
            && typeof this.reporter == 'function'
            && date.getHours() == process.env.REPORT_HOUR 
            && date.getMinutes() == 0)
            this.reporter();


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