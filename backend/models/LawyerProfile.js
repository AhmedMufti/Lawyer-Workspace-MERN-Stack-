const mongoose = require('mongoose');

const lawyerProfileSchema = new mongoose.Schema(
    {
        // User Reference
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
            index: true
        },

        // Professional Information
        professionalTitle: {
            type: String,
            trim: true,
            maxlength: 100
        },
        tagline: {
            type: String,
            maxlength: 200
        },
        bio: {
            type: String,
            maxlength: 2000
        },

        // Specializations
        primarySpecialization: {
            type: String,
            required: true,
            trim: true
        },
        specializations: [{
            type: String,
            trim: true
        }],
        areasOfPractice: [{
            type: String,
            trim: true
        }],

        // Bar & Licensing
        barCouncil: {
            type: String,
            enum: [
                'Pakistan Bar Council',
                'Punjab Bar Council',
                'Sindh Bar Council',
                'KPK Bar Council',
                'Balochistan Bar Council',
                'Islamabad Bar Council',
                'Other'
            ],
            required: true
        },
        enrollmentNumber: {
            type: String,
            required: true,
            unique: true,
            index: true
        },
        enrollmentDate: Date,
        licenseStatus: {
            type: String,
            enum: ['Active', 'Suspended', 'Inactive'],
            default: 'Active'
        },

        // Experience
        yearsOfExperience: {
            type: Number,
            required: true,
            min: 0
        },
        practiceStartDate: {
            type: Date
        },

        // Courts
        courtsPracticing: [{
            courtName: String,
            since: Date,
            caseTypes: [String]
        }],

        // Firm/Organization
        firmName: {
            type: String,
            trim: true
        },
        isSoloPractitioner: {
            type: Boolean,
            default: true
        },
        firmRole: {
            type: String,
            enum: ['Partner', 'Associate', 'Senior Lawyer', 'Junior Lawyer', 'Solo'],
            default: 'Solo'
        },

        // Contact & Office
        officeAddress: {
            street: String,
            area: String,
            city: String,
            province: String,
            postalCode: String
        },
        officePhone: String,
        officeEmail: String,
        website: String,
        googleMapsLink: String,

        // Availability
        consultation: {
            available: {
                type: Boolean,
                default: true
            },
            fee: Number,
            currency: {
                type: String,
                default: 'PKR'
            },
            duration: Number, // in minutes
            mode: [{
                type: String,
                enum: ['In-Person', 'Online', 'Phone']
            }]
        },

        // Professional Achievements
        education: [{
            degree: String,
            institution: String,
            year: Number,
            field: String
        }],
        certifications: [{
            title: String,
            issuingOrganization: String,
            issueDate: Date,
            expiryDate: Date,
            credentialId: String
        }],
        awards: [{
            title: String,
            organization: String,
            year: Number,
            description: String
        }],
        memberships: [{
            organization: String,
            position: String,
            since: Date
        }],

        // Case Statistics
        statistics: {
            totalCases: {
                type: Number,
                default: 0
            },
            wonCases: {
                type: Number,
                default: 0
            },
            pendingCases: {
                type: Number,
                default: 0
            },
            winRate: {
                type: Number,
                default: 0,
                min: 0,
                max: 100
            }
        },

        // Media
        profilePicture: String,
        coverPhoto: String,
        galleryImages: [String],

        // Social Media
        socialLinks: {
            linkedin: String,
            facebook: String,
            twitter: String,
            instagram: String
        },

        // Languages
        languages: [{
            language: String,
            proficiency: {
                type: String,
                enum: ['Native', 'Fluent', 'Professional', 'Basic']
            }
        }],

        // Ratings & Reviews
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        },
        totalRatings: {
            type: Number,
            default: 0
        },

        // Profile Status
        isVerified: {
            type: Boolean,
            default: false
        },
        isPremium: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        },
        profileCompleteness: {
            type: Number,
            default: 0,
            min: 0,
            max: 100
        },

        // Visibility
        isPubliclyVisible: {
            type: Boolean,
            default: true
        },
        acceptingNewClients: {
            type: Boolean,
            default: true
        },

        // Analytics
        profileViews: {
            type: Number,
            default: 0
        },
        contactClicks: {
            type: Number,
            default: 0
        },

        // Metadata
        lastProfileUpdate: Date,
        verifiedAt: Date,
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes
lawyerProfileSchema.index({ enrollmentNumber: 1 });
lawyerProfileSchema.index({ 'officeAddress.city': 1 });
lawyerProfileSchema.index({ specializations: 1 });
lawyerProfileSchema.index({ isPremium: 1, isFeatured: 1 });
lawyerProfileSchema.index({ averageRating: -1 });

// Text index for search
lawyerProfileSchema.index({
    professionalTitle: 'text',
    bio: 'text',
    firmName: 'text',
    specializations: 'text',
    areasOfPractice: 'text'
});

// Virtual for full office address
lawyerProfileSchema.virtual('fullOfficeAddress').get(function () {
    if (!this.officeAddress) return '';
    const addr = this.officeAddress;
    return `${addr.street || ''}, ${addr.area || ''}, ${addr.city || ''}, ${addr.province || ''}`.replace(/, ,/g, ',').trim();
});

// Calculate win rate
lawyerProfileSchema.methods.calculateWinRate = function () {
    if (this.statistics.totalCases > 0) {
        this.statistics.winRate = Math.round(
            (this.statistics.wonCases / this.statistics.totalCases) * 100
        );
    }
};

// Calculate profile completeness
lawyerProfileSchema.methods.calculateCompleteness = function () {
    let score = 0;
    const fields = [
        'bio', 'specializations', 'education', 'profilePicture',
        'officeAddress', 'consultation.fee', 'yearsOfExperience'
    ];

    fields.forEach(field => {
        if (field.includes('.')) {
            const [obj, prop] = field.split('.');
            if (this[obj] && this[obj][prop]) score += 14;
        } else {
            if (this[field] && (Array.isArray(this[field]) ? this[field].length > 0 : true)) {
                score += 14;
            }
        }
    });

    this.profileCompleteness = Math.min(score, 100);
};

// Pre-save middleware
lawyerProfileSchema.pre('save', function (next) {
    this.calculateWinRate();
    this.calculateCompleteness();
    this.lastProfileUpdate = Date.now();
    next();
});

// Instance method to increment profile views
lawyerProfileSchema.methods.incrementViews = async function () {
    this.profileViews += 1;
    await this.save({ validateBeforeSave: false });
};

// Static method to search profiles
lawyerProfileSchema.statics.searchProfiles = function (query, filters = {}) {
    const searchQuery = {
        isPubliclyVisible: true
    };

    // Text search
    if (query) {
        searchQuery.$text = { $search: query };
    }

    // Filters
    if (filters.city) searchQuery['officeAddress.city'] = new RegExp(filters.city, 'i');
    if (filters.specialization) searchQuery.specializations = filters.specialization;
    if (filters.minExperience) searchQuery.yearsOfExperience = { $gte: parseInt(filters.minExperience) };
    if (filters.isPremium !== undefined) searchQuery.isPremium = filters.isPremium === 'true';
    if (filters.acceptingClients) searchQuery.acceptingNewClients = true;
    if (filters.minRating) searchQuery.averageRating = { $gte: parseFloat(filters.minRating) };

    return this.find(searchQuery).populate('user', 'firstName lastName email phone');
};

const LawyerProfile = mongoose.model('LawyerProfile', lawyerProfileSchema);

module.exports = LawyerProfile;
