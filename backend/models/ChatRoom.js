const mongoose = require('mongoose');

const chatRoomSchema = new mongoose.Schema(
    {
        // Room Identification
        roomName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        roomType: {
            type: String,
            enum: ['BarCouncil', 'District', 'HighCourt', 'SupremeCourt', 'Clerks', 'General', 'Private'],
            required: true,
            index: true
        },

        // Bar Association
        barAssociation: {
            type: String,
            enum: [
                'Pakistan Bar Council',
                'Supreme Court Bar',
                'Lahore High Court Bar',
                'Sindh High Court Bar',
                'Peshawar High Court Bar',
                'Balochistan High Court Bar',
                'Islamabad High Court Bar',
                'District Bar',
                'Clerks Association',
                'General'
            ]
        },
        district: String,

        // Access Control
        isPublic: {
            type: Boolean,
            default: false
        },
        requiresVerification: {
            type: Boolean,
            default: true // Bar license verification required
        },
        allowedRoles: [{
            type: String,
            enum: ['lawyer', 'clerk', 'admin']
        }],

        // Members
        members: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            joinedAt: {
                type: Date,
                default: Date.now
            },
            role: {
                type: String,
                enum: ['admin', 'moderator', 'member'],
                default: 'member'
            }
        }],

        // Room Admins/Moderators
        admins: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Room Settings
        description: {
            type: String,
            maxlength: 500
        },
        rules: [String],
        maxMembers: {
            type: Number,
            default: 1000
        },

        // Activity
        lastMessageAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        messageCount: {
            type: Number,
            default: 0
        },

        // Status
        isActive: {
            type: Boolean,
            default: true,
            index: true
        },

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
chatRoomSchema.index({ roomType: 1, barAssociation: 1 });
chatRoomSchema.index({ isActive: 1, lastMessageAt: -1 });

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);

module.exports = ChatRoom;
