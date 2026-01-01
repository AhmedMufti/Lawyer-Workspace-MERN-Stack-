const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('../config/db');

// Models
const Act = require('../models/Act');
const CaseLaw = require('../models/CaseLaw');
const CourtForm = require('../models/CourtForm');

// Load environment variables
dotenv.config(); // Load from .env in current directory (backend/)

// Connect to Database
const connect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Connected...');
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
};

const seedActs = [
    {
        title: 'The Constitution of the Islamic Republic of Pakistan',
        shortTitle: 'Constitution of Pakistan',
        year: 1973,
        actNumber: 'N/A',
        category: 'Constitutional Law',
        jurisdiction: 'Federal',
        status: 'Active',
        fullText: 'The Constitution of the Islamic Republic of Pakistan is the supreme law of Pakistan...',
        preamble: 'Whereas sovereignty over the entire Universe belongs to Almighty Allah alone, and the authority to be exercised by the people of Pakistan within the limits prescribed by Him is a sacred trust...',
        keywords: ['constitution', 'fundamental rights', 'parliament', 'judiciary'],
        isDeleted: false
    },
    {
        title: 'Pakistan Penal Code',
        shortTitle: 'PPC',
        year: 1860,
        actNumber: 'XLV',
        category: 'Criminal Law',
        jurisdiction: 'Federal',
        status: 'Active',
        fullText: 'An Act to provide a general Penal Code for Pakistan...',
        preamble: 'Whereas it is expedient to provide a general Penal Code for Pakistan; It is enacted as follows...',
        keywords: ['crime', 'punishment', 'offences', 'theft', 'fraud', 'murder'],
        isDeleted: false
    },
    {
        title: 'Code of Civil Procedure',
        shortTitle: 'CPC',
        year: 1908,
        actNumber: 'V',
        category: 'Civil Law',
        jurisdiction: 'Federal',
        status: 'Active',
        fullText: 'An Act to consolidate and amend the laws relating to the Procedure of the Courts of Civil Judicature...',
        keywords: ['civil procedure', 'courts', 'suits', 'decree', 'judgment'],
        isDeleted: false
    },
    {
        title: 'Code of Criminal Procedure',
        shortTitle: 'CrPC',
        year: 1898,
        actNumber: 'V',
        category: 'Criminal Law',
        jurisdiction: 'Federal',
        status: 'Active',
        fullText: 'An Act to consolidate and amend the law relating to the Criminal Procedure...',
        keywords: ['criminal procedure', 'arrest', 'bail', 'investigation', 'trial'],
        isDeleted: false
    },
    {
        title: 'Family Courts Act',
        shortTitle: 'Family Courts Act',
        year: 1964,
        actNumber: 'XXXV',
        category: 'Family Law',
        jurisdiction: 'Federal',
        status: 'Active',
        fullText: 'An Act to provide for the establishment of Family Courts for the expeditious settlement and disposal of disputes relating to marriage and family affairs...',
        keywords: ['family', 'marriage', 'divorce', 'custody', 'dower'],
        isDeleted: false
    }
];

const seedCases = [
    {
        caseTitle: 'Asma Jilani vs. The Government of the Punjab',
        citation: 'PLD 1972 SC 139',
        petitioner: 'Asma Jilani',
        respondent: 'Government of the Punjab',
        court: 'Supreme Court of Pakistan',
        decisionDate: new Date('1972-04-20'),
        caseType: 'Constitutional',
        year: 1972,
        judgmentText: 'The Doctrine of Necessity was declared invalid...',
        summary: 'A landmark decision by the Supreme Court of Pakistan declaring the martial law of Yahya Khan illegal and overturning the Dosso case precedent regarding the doctrine of necessity.',
        importance: 'Landmark',
        keywords: ['martial law', 'constitutional', 'rights', 'usurpation'],
        disposition: 'Allowed',
        isDeleted: false
    },
    {
        caseTitle: 'Al-Jehad Trust vs. Federation of Pakistan',
        citation: 'PLD 1996 SC 324',
        petitioner: 'Al-Jehad Trust',
        respondent: 'Federation of Pakistan',
        court: 'Supreme Court of Pakistan',
        decisionDate: new Date('1996-03-20'),
        caseType: 'Constitutional',
        year: 1996,
        judgmentText: 'Principles regarding the appointment of judges to the superior judiciary...',
        summary: 'This case established the primacy of the Chief Justice\'s opinion in the appointment of judges and addressed the independence of the judiciary.',
        importance: 'Landmark',
        keywords: ['judges case', 'judicial independence', 'appointments'],
        disposition: 'Allowed',
        isDeleted: false
    },
    {
        caseTitle: 'Suo Moto Case No. 4 of 2010',
        citation: 'PLD 2011 SC 997',
        petitioner: 'Registrar Supreme Court',
        respondent: 'State',
        court: 'Supreme Court of Pakistan',
        decisionDate: new Date('2011-06-08'),
        caseType: 'Criminal',
        year: 2011,
        judgmentText: 'Regarding the law and order situation in Karachi...',
        summary: 'The Supreme Court took notice of the deteriorating law and order situation in Karachi and issued comprehensive directions to the government and law enforcement agencies.',
        importance: 'Important',
        keywords: ['karachi', 'law and order', 'human rights', 'terrorism'],
        disposition: 'Other',
        isDeleted: false
    }
];

const seedForms = [
    {
        formNumber: 'CP-01',
        formTitle: 'Plaint in a Civil Suit',
        category: 'Civil Procedure',
        purpose: 'To initiate a civil lawsuit in a court.',
        instructions: 'Fill in the details of the plaintiff, defendant, cause of action, and relief claimed.',
        pdfPath: '/uploads/forms/dummy-civil-plaint.pdf',
        isFillable: true,
        jurisdiction: 'All',
        status: 'Active',
        isDeleted: false
    },
    {
        formNumber: 'CrP-12',
        formTitle: 'Bail Application (Post-Arrest)',
        category: 'Criminal Procedure',
        purpose: 'To apply for bail after an arrest has been made.',
        instructions: 'State the grounds for bail, FIR number, and police station details.',
        pdfPath: '/uploads/forms/dummy-bail-application.pdf',
        isFillable: true,
        jurisdiction: 'All',
        status: 'Active',
        isDeleted: false
    },
    {
        formNumber: 'Fam-05',
        formTitle: 'Petition for Dissolution of Marriage (Khula)',
        category: 'Family Courts',
        purpose: 'For a wife to seek dissolution of marriage from the court.',
        instructions: 'Provide details of marriage, dower, and reasons for seeking Khula.',
        pdfPath: '/uploads/forms/dummy-khula-form.pdf',
        isFillable: true,
        jurisdiction: 'All',
        status: 'Active',
        isDeleted: false
    }
];

const fs = require('fs');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('seed_log.txt', msg + '\n');
};

const seedData = async () => {
    await connect();

    try {
        log('🚀 Starting seed process...');

        // Insert Acts
        for (const act of seedActs) {
            const exists = await Act.findOne({ title: act.title });
            if (!exists) {
                await Act.create(act);
                log(`✅ Act added: ${act.title}`);
            } else {
                log(`⚠️  Act exists: ${act.title}`);
            }
        }

        // Insert Cases
        for (const caseLaw of seedCases) {
            const exists = await CaseLaw.findOne({ citation: caseLaw.citation });
            if (!exists) {
                await CaseLaw.create(caseLaw);
                log(`✅ Case Law added: ${caseLaw.citation}`);
            } else {
                log(`⚠️  Case Law exists: ${caseLaw.citation}`);
            }
        }

        // Insert Forms
        for (const form of seedForms) {
            const exists = await CourtForm.findOne({ formNumber: form.formNumber });
            if (!exists) {
                await CourtForm.create(form);
                log(`✅ Form added: ${form.formTitle}`);
            } else {
                log(`⚠️  Form exists: ${form.formTitle}`);
            }
        }

        log('🎉 Seeding completed successfully!');
    } catch (error) {
        log(`❌ Seeding failed: ${error.message}`);
    } finally {
        mongoose.connection.close();
        process.exit();
    }
};

seedData();
