const mongoose = require('mongoose');

const marketplaceItemSchema = new mongoose.Schema(
    {
        // Basic Information
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: 200,
            index: true
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            maxlength: 5000
        },

        // Category
        category: {
            type: String,
            enum: {
                values: [
                    'Books & Publications',
                    'Legal Software',
                    'Office Equipment',
                    'Furniture',
                    'Gowns & Attire',
                    'Legal Services',
                    'Consultation',
                    'Free Stuff',
                    'Other'
                ],
                message: '{VALUE} is not a valid category'
            },
            required: true,
            index: true
        },
        subcategory: {
            type: String,
            trim: true
        },

        // Pricing
        price: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'PKR'
        },
        isFree: {
            type: Boolean,
            default: false
        },
        isNegotiable: {
            type: Boolean,
            default: false
        },

        // Item Details
        condition: {
            type: String,
            enum: ['New', 'Like New', 'Good', 'Fair', 'For Parts'],
            default: 'Good'
        },
        quantity: {
            type: Number,
            default: 1,
            min: 0
        },

        // Seller Information
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sellerType: {
            type: String,
            enum: ['Individual', 'Firm', 'Vendor'],
            default: 'Individual'
        },

        // Location
        location: {
            city: {
                type: String,
                required: true,
                index: true
            },
            province: String,
            address: String,
            meetupPreference: {
                type: String,
                enum: ['Buyer Location', 'Seller Location', 'Public Place', 'Delivery Available'],
                default: 'Public Place'
            }
        },

        // Media
        images: [{
            url: String,
            caption: String
        }],
        mainImage: {
            type: String
        },

        // Contact
        contactPreference: {
            showPhone: {
                type: Boolean,
                default: true
            },
            showEmail: {
                type: Boolean,
                default: true
            },
            preferredMethod: {
                type: String,
                enum: ['Phone', 'Email', 'In-App Chat'],
                default: 'Phone'
            }
        },

        // Status
        status: {
            type: String,
            enum: ['Active', 'Sold', 'Reserved', 'Expired', 'Removed'],
            default: 'Active',
            index: true
        },
        isPremiumListing: {
            type: Boolean,
            default: false
        },
        isFeatured: {
            type: Boolean,
            default: false
        },

        // Expiry
        expiresAt: {
            type: Date,
            index: true
        },
        autoRenew: {
            type: Boolean,
            default: false
        },

        // Analytics
        views: {
            type: Number,
            default: 0
        },
        inquiries: {
            type: Number,
            default: 0
        },
        favorites: {
            type: Number,
            default: 0
        },

        // User Interactions
        favoritedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Tags
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        // Moderation
        isApproved: {
            type: Boolean,
            default: true
        },
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reportCount: {
            type: Number,
            default: 0
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes
marketplaceItemSchema.index({ category: 1, status: 1 });
marketplaceItemSchema.index({ 'location.city': 1, category: 1 });
marketplaceItemSchema.index({ price: 1 });
marketplaceItemSchema.index({ createdAt: -1 });

// Text index
marketplaceItemSchema.index({
    title: 'text',
    description: 'text',
    tags: 'text'
});

// Virtual for age of listing
marketplaceItemSchema.virtual('listingAge').get(function () {
    return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Instance methods
marketplaceItemSchema.methods.incrementViews = async function () {
    this.views += 1;
    await this.save({ validateBeforeSave: false });
};

marketplaceItemSchema.methods.addFavorite = async function (userId) {
    if (!this.favoritedBy.includes(userId)) {
        this.favoritedBy.push(userId);
        this.favorites += 1;
        await this.save({ validateBeforeSave: false });
    }
};

marketplaceItemSchema.methods.removeFavorite = async function (userId) {
    const index = this.favoritedBy.indexOf(userId);
    if (index > -1) {
        this.favoritedBy.splice(index, 1);
        this.favorites -= 1;
        await this.save({ validateBeforeSave: false });
    }
};

// Static methods
marketplaceItemSchema.statics.searchItems = function (query, filters = {}) {
    const searchQuery = {
        status: 'Active',
        isDeleted: false
    };

    if (query) {
        searchQuery.$text = { $search: query };
    }

    if (filters.category) searchQuery.category = filters.category;
    if (filters.city) searchQuery['location.city'] = new RegExp(filters.city, 'i');
    if (filters.isFree !== undefined) searchQuery.isFree = filters.isFree === 'true';
    if (filters.minPrice) searchQuery.price = { ...searchQuery.price, $gte: parseFloat(filters.minPrice) };
    if (filters.maxPrice) searchQuery.price = { ...searchQuery.price, $lte: parseFloat(filters.maxPrice) };
    if (filters.condition) searchQuery.condition = filters.condition;

    return this.find(searchQuery).populate('seller', 'firstName lastName phone email');
};

// Query middleware
marketplaceItemSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const MarketplaceItem = mongoose.model('MarketplaceItem', marketplaceItemSchema);

module.exports = MarketplaceItem;
