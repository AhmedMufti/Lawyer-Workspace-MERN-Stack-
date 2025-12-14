const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        // Chat Room
        room: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ChatRoom',
            required: true,
            index: true
        },

        // Sender
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        // Message Content
        content: {
            type: String,
            required: true,
            maxlength: 5000
        },
        messageType: {
            type: String,
            enum: ['text', 'file', 'image', 'document'],
            default: 'text'
        },

        // File Attachment
        attachment: {
            fileName: String,
            filePath: String,
            fileSize: Number,
            mimeType: String
        },

        // Message Status
        isEdited: {
            type: Boolean,
            default: false
        },
        editedAt: Date,
        isDeleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,

        // Read Receipts
        readBy: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            readAt: Date
        }],

        // Reply/Thread
        replyTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Message'
        }
    },
    {
        timestamps: true
    }
);

// Indexes
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });

// Update room's last message time
messageSchema.post('save', async function () {
    const ChatRoom = mongoose.model('ChatRoom');
    await ChatRoom.findByIdAndUpdate(this.room, {
        lastMessageAt: this.createdAt,
        $inc: { messageCount: 1 }
    });
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
