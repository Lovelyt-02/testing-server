const mongoose = require('mongoose');

const AboutFounderSchema = new mongoose.Schema({
  image: String,                 // Founder photo
  title: String,                 // "About VVVRK Yachendra"
  subTitle: String,              // "Founder & managing partner"
  highlights: [                  // Each highlight block is editable
    {
      heading: String,           // e.g. "Visionary Leadership & Systematic Transformation"
      description: String        // e.g. "VVGRK revolutionized SKC Mica Mines..."
    }
  ]
});

const AboutPageSchema = new mongoose.Schema({
  heroSection: {
    title: String,
    description: String,
    backgroundImage: String
  },
  legacySection: {
    heading: String,
    description: String
  },
  aboutFounderSection: AboutFounderSchema,
  journeySection: {
    image: String,
    title: String,
    description: String
  },
  reformEraSection: {
    image: String,
    title: String,
    description: String
  },
  modernEraSection: {
    title: String,
    description: String,
    stats: [
      {
        value: String,
        label: String
      }
    ],
    lastLine:String
  },
  missionSection: {
    image: String,
    title: String,
    description: String
  }
}, { timestamps: true });

module.exports = mongoose.model('AboutPage', AboutPageSchema);
