const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema(
    {
        // Basic Information
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            validate: [validator.isEmail, 'Please provide a valid email'],
            index: true
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false // Don't return password in queries by default
        },

        // Personal Information
        firstName: {
            type: String,
            required: [true, 'First name is required'],
            trim: true,
            maxlength: [50, 'First name cannot exceed 50 characters']
        },
        lastName: {
            type: String,
            required: [true, 'Last name is required'],
            trim: true,
            maxlength: [50, 'Last name cannot exceed 50 characters']
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            validate: {
                validator: function (v) {
                    // Pakistani phone number format
                    return /^(\+92|0)?3[0-9]{9}$/.test(v);
                },
                message: 'Please provide a valid Pakistani phone number'
            },
            index: true
        },

        // Role & Type
        role: {
            type: String,
            enum: {
                values: ['lawyer', 'litigant', 'clerk', 'admin'],
                message: '{VALUE} is not a valid role'
            },
            required: [true, 'User role is required'],
            default: 'litigant'
        },

        // Lawyer-specific Information
        barLicenseNumber: {
            type: String,
            sparse: true, // Allows multiple null values but unique non-null values
            trim: true,
            index: true
        },
        barAssociation: {
            type: String,
            enum: [
                'Pakistan Bar Council',
                'Punjab Bar Council',
                'Sindh Bar Council',
                'KPK Bar Council',
                'Balochistan Bar Council',
                'Islamabad Bar Council',
                'Gilgit-Baltistan Bar Council',
                'Kashmir Bar Council',
                'Lahore High Court Bar',
                'Karachi Bar Association',
                'Other'
            ]
        },
        specializations: [{
            type: String,
            trim: true
        }],
        yearsOfExperience: {
            type: Number,
            min: 0,
            max: 70
        },
        firmName: {
            type: String,
            trim: true
        },
        officeAddress: {
            street: String,
            city: String,
            state: String,
            zipCode: String,
            country: { type: String, default: 'Pakistan' }
        },

        // Subscription & Tier
        subscriptionTier: {
            type: String,
            enum: ['standard', 'gold', 'premium', 'platinum'],
            default: 'standard',
            index: true
        },
        subscriptionStartDate: Date,
        subscriptionEndDate: Date,
        subscriptionActive: {
            type: Boolean,
            default: true
        },

        // Account Status
        isEmailVerified: {
            type: Boolean,
            default: false
        },
        isBarLicenseVerified: {
            type: Boolean,
            default: false
        },
        accountStatus: {
            type: String,
            enum: ['active', 'suspended', 'pending_verification', 'banned'],
            default: 'pending_verification'
        },

        // Profile Information
        profilePicture: {
            type: String, // URL or path to image
            default: null
        },
        bio: {
            type: String,
            maxlength: [500, 'Bio cannot exceed 500 characters']
        },

        // Preferences
        preferredLanguage: {
            type: String,
            enum: ['en', 'ur', 'sd', 'ps', 'bal', 'ar', 'zh', 'fr', 'nl'],
            default: 'en'
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: true
        },

        // Security
        passwordChangedAt: Date,
        passwordResetToken: String,
        passwordResetExpires: Date,
        emailVerificationToken: String,
        emailVerificationExpires: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lockUntil: Date,
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        twoFactorSecret: String,

        // Activity Tracking
        lastLogin: Date,
        lastActive: Date,

        // Ratings (for lawyers)
        averageRating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },
        totalReviews: {
            type: Number,
            default: 0
        },

        // Analytics
        profileViews: {
            type: Number,
            default: 0
        },
        casesHandled: {
            type: Number,
            default: 0
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        },
        deletedAt: Date
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, accountStatus: 1 });
userSchema.index({ barLicenseNumber: 1 }, { sparse: true });
userSchema.index({ subscriptionTier: 1, subscriptionActive: 1 });
userSchema.index({ isDeleted: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock check
userSchema.virtual('isLocked').get(function () {
    return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
    // Only hash password if it's modified
    if (!this.isModified('password')) return next();

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function (next) {
    if (!this.isModified('password') || this.isNew) return next();

    // Set passwordChangedAt to 1 second in the past to handle JWT timing
    this.passwordChangedAt = Date.now() - 1000;
    next();
});

// Method to check if password matches
userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        return JWTTimestamp < changedTimestamp;
    }
    return false;
};

// Method to handle login attempts
userSchema.methods.incLoginAttempts = async function () {
    // If lock has expired, reset attempts
    if (this.lockUntil && this.lockUntil < Date.now()) {
        return await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
    }

    // Increment attempts
    const updates = { $inc: { loginAttempts: 1 } };

    // Lock account after 5 failed attempts for 2 hours
    const maxAttempts = 5;
    const lockTime = 2 * 60 * 60 * 1000; // 2 hours

    if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked) {
        updates.$set = { lockUntil: Date.now() + lockTime };
    }

    return await this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = async function () {
    return await this.updateOne({
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });
};

// Static method to find active users
userSchema.statics.findActive = function () {
    return this.find({
        isDeleted: false,
        accountStatus: 'active'
    });
};

// Static method to find by role
userSchema.statics.findByRole = function (role) {
    return this.find({
        role,
        isDeleted: false
    });
};

// Query middleware to exclude deleted users
userSchema.pre(/^find/, function (next) {
    // Only apply if not explicitly querying deleted users
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
