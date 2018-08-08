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
        const dayOfWeek = date.getDay();
        const includeWeekends = process.env.INCLUDE_WEEKENDS || false;
        const isWeekend = dayOfWeek == 6 || dayOfWeek == 0;
        const isTallyWeekend = dayOfWeek == 0 || dayOfWeek == 1;
        const skipReporting = isWeekend ? includeWeekends : false; 
        const skipTally = isTallyWeekend ? includeWeekends : false;

        if (process.env.AUTO_REPORTING 
            && !skipReporting
            && typeof this.reporter == 'function'
            && date.getHours() == process.env.REPORT_HOUR 
            && date.getMinutes() == 0)
            this.reporter();

        let dayOfMonth = date.getDate();
        if (dayOfMonth == this.day) return;
        this.day = dayOfMonth;

        if (skipTally) return;

        console.log(`initiating tally for day ${this.day}`);

        let chars = await Character.allCharacters();

        Object.keys(chars).forEach(key => {
            let char = new Character(chars[key]);

            if (!char.data.enlisted) return true;

            if (!char.data.checked_in) {
                let demerits = char.data.demerits + 1;
                char.update({demerits: demerits, previous_demerits: char.data.demerits, streak: 0});
            }
            else {
                char.update({checked_in: 0, demerits: 0, previous_demerits: char.data.demerits});
                char.addXP(100 + (142 * char.data.streak));
            }
                
        });
    }
}