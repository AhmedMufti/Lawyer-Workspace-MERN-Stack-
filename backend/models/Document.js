const mongoose = require('mongoose');
const crypto = require('crypto');

const documentSchema = new mongoose.Schema(
    {
        // Document Identification
        documentTitle: {
            type: String,
            required: [true, 'Document title is required'],
            trim: true,
            maxlength: [200, 'Document title cannot exceed 200 characters']
        },
        documentType: {
            type: String,
            enum: {
                values: [
                    'Petition',
                    'Reply',
                    'Evidence',
                    'Order Sheet',
                    'Judgment',
                    'Notice',
                    'Affidavit',
                    'Power of Attorney',
                    'Contract',
                    'Correspondence',
                    'Court Order',
                    'Legal Opinion',
                    'Research Document',
                    'Other'
                ],
                message: '{VALUE} is not a valid document type'
            },
            required: [true, 'Document type is required'],
            index: true
        },
        category: {
            type: String,
            enum: ['Court Filing', 'Internal', 'Client Document', 'Evidence', 'Reference'],
            default: 'Internal'
        },

        // Associated Case
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Case',
            required: [true, 'Case reference is required'],
            index: true
        },

        // File Information
        fileName: {
            type: String,
            required: [true, 'File name is required'],
            trim: true
        },
        originalFileName: {
            type: String,
            required: true
        },
        filePath: {
            type: String,
            required: [true, 'File path is required']
        },
        fileSize: {
            type: Number, // in bytes
            required: true
        },
        mimeType: {
            type: String,
            required: true
        },
        fileExtension: {
            type: String,
            required: true,
            lowercase: true
        },
        fileHash: {
            type: String, // SHA256 hash for integrity
            required: true,
            unique: true
        },

        // Document Metadata
        description: {
            type: String,
            maxlength: [1000, 'Description cannot exceed 1000 characters']
        },
        keywords: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        // OCR and Processing
        isScanned: {
            type: Boolean,
            default: false
        },
        ocrText: {
            type: String, // Extracted text from OCR
            select: false // Don't return by default
        },
        ocrProcessed: {
            type: Boolean,
            default: false
        },
        ocrProcessedAt: Date,
        isProcessed: {
            type: Boolean,
            default: true
        },
        processingStatus: {
            type: String,
            enum: ['Pending', 'Processing', 'Completed', 'Failed'],
            default: 'Completed'
        },
        processingError: String,

        // Versioning
        version: {
            type: Number,
            default: 1
        },
        isLatestVersion: {
            type: Boolean,
            default: true
        },
        previousVersion: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },
        versionHistory: [{
            version: Number,
            documentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Document'
            },
            uploadedAt: Date,
            uploadedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            changeNote: String
        }],

        // Upload Information
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Uploader information is required'],
            index: true
        },
        uploadDate: {
            type: Date,
            default: Date.now,
            index: true
        },
        uploadSource: {
            type: String,
            enum: ['Web Upload', 'Mobile Scan', 'Email', 'API', 'System Generated'],
            default: 'Web Upload'
        },

        // Access Control
        visibility: {
            type: String,
            enum: ['Private', 'Team Only', 'Client Access', 'Public'],
            default: 'Team Only'
        },
        allowedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isConfidential: {
            type: Boolean,
            default: false
        },

        // Document Status
        status: {
            type: String,
            enum: ['Draft', 'Under Review', 'Approved', 'Filed', 'Archived'],
            default: 'Draft'
        },
        isFiled: {
            type: Boolean,
            default: false
        },
        filedDate: Date,

        // Court Filing Information
        filingNumber: String,
        filingDate: Date,
        courtStamp: String,

        // Signatures and Authentication
        isSigned: {
            type: Boolean,
            default: false
        },
        signatures: [{
            signedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            signedAt: Date,
            signatureType: {
                type: String,
                enum: ['Digital', 'Wet Signature Scanned', 'E-Signature']
            },
            signaturePath: String
        }],

        // Review and Approval
        reviewers: [{
            reviewer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            reviewedAt: Date,
            status: {
                type: String,
                enum: ['Pending', 'Approved', 'Rejected', 'Changes Requested']
            },
            comments: String
        }],

        // Important Dates
        expiryDate: Date,
        reminderDate: Date,
        importance: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Critical'],
            default: 'Medium'
        },

        // Analytics
        viewCount: {
            type: Number,
            default: 0
        },
        downloadCount: {
            type: Number,
            default: 0
        },
        lastAccessedAt: Date,
        lastAccessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Thumbnail
        thumbnailPath: String,
        hasThumbnail: {
            type: Boolean,
            default: false
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        },
        deletedAt: Date,
        deletedBy: {
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

// Indexes for performance
documentSchema.index({ case: 1, documentType: 1 });
documentSchema.index({ uploadedBy: 1, uploadDate: -1 });
documentSchema.index({ fileHash: 1 });
documentSchema.index({ keywords: 1 });
documentSchema.index({ isDeleted: 1 });

// Virtual for file size in MB
documentSchema.virtual('fileSizeMB').get(function () {
    return (this.fileSize / (1024 * 1024)).toFixed(2);
});

// Virtual for file age
documentSchema.virtual('ageInDays').get(function () {
    return Math.floor((Date.now() - this.uploadDate) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate file hash
documentSchema.pre('save', function (next) {
    if (this.isNew && !this.fileHash) {
        // Generate hash based on file name and timestamp
        const hashString = `${this.fileName}${this.uploadDate}${this.uploadedBy}`;
        this.fileHash = crypto.createHash('sha256').update(hashString).digest('hex');
    }
    next();
});

// Instance method to check if user can access document
documentSchema.methods.canAccess = async function (userId) {
    // Populate case if not already populated
    if (!this.populated('case')) {
        await this.populate('case');
    }

    // Check if user is uploader
    if (this.uploadedBy.toString() === userId.toString()) {
        return true;
    }

    // Check if user has access to the case
    if (this.case && typeof this.case.canAccess === 'function') {
        return this.case.canAccess(userId);
    }

    // Check allowed users
    const isAllowed = this.allowedUsers.some(
        user => user.toString() === userId.toString()
    );

    return isAllowed;
};

// Instance method to increment view count
documentSchema.methods.incrementViewCount = async function (userId) {
    this.viewCount += 1;
    this.lastAccessedAt = Date.now();
    this.lastAccessedBy = userId;
    await this.save({ validateBeforeSave: false });
};

// Instance method to increment download count
documentSchema.methods.incrementDownloadCount = async function () {
    this.downloadCount += 1;
    await this.save({ validateBeforeSave: false });
};

// Static method to find by case
documentSchema.statics.findByCase = function (caseId) {
    return this.find({
        case: caseId,
        isDeleted: false
    }).sort({ uploadDate: -1 });
};

// Static method to find by document type
documentSchema.statics.findByType = function (documentType, caseId = null) {
    const query = {
        documentType,
        isDeleted: false
    };

    if (caseId) {
        query.case = caseId;
    }

    return this.find(query).sort({ uploadDate: -1 });
};

// Static method to search documents
documentSchema.statics.searchDocuments = function (searchTerm, caseId = null) {
    const searchRegex = new RegExp(searchTerm, 'i');

    const query = {
        $or: [
            { documentTitle: searchRegex },
            { description: searchRegex },
            { keywords: searchRegex },
            { tags: searchRegex }
        ],
        isDeleted: false
    };

    if (caseId) {
        query.case = caseId;
    }

    return this.find(query).sort({ uploadDate: -1 });
};

// Query middleware to exclude deleted documents
documentSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
