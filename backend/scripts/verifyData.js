const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Models
const Act = require('../models/Act');
const CaseLaw = require('../models/CaseLaw');
const CourtForm = require('../models/CourtForm');

// Load environment variables
dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected for verification...');

        const acts = await Act.countDocuments();
        const cases = await CaseLaw.countDocuments();
        const forms = await CourtForm.countDocuments();

        console.log(`📊 Current Database Counts:`);
        console.log(`- Acts: ${acts}`);
        console.log(`- Case Laws: ${cases}`);
        console.log(`- Court Forms: ${forms}`);

        if (acts > 0) {
            const sample = await Act.findOne({}, 'title');
            console.log(`- Sample Act: ${sample.title}`);
        }

    } catch (err) {
        console.error('❌ Verification failed:', err);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

verify();
