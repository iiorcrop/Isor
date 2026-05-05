const mongoose = require('mongoose');

const headerSettingsSchema = new mongoose.Schema({
    logoUrl: { type: String, default: '' },
    title: { type: String, default: 'Indian Society of Oilseeds Research' },
    subTitle: { type: String, default: 'ICAR-Directorate of Oilseeds Research, Rajendranagar, Hyderabad – 500 030' },
    tagline: { type: String, default: 'ISOR — Promoting Oilseeds Research & Development Since 1984' },
    affiliationText: { type: String, default: 'An ICAR Affiliated Society' },
    estdText: { type: String, default: 'Estd. 1984 | Regd. No. 823/84' },
    journalTitle: { type: String, default: 'Journal of Oilseeds Research' },
    journalScore: { type: String, default: 'UGC-CARE Listed | NAAS Score: 7.16' }
}, { timestamps: true });

module.exports = mongoose.model('HeaderSettings', headerSettingsSchema);
