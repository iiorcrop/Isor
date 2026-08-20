const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    action: { type: String, required: true },
    performedBy: { type: String, required: true },
    performedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, required: true },
    comments: { type: String },
    timestamp: { type: Date, default: Date.now }
});

const manuscriptSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    
    // Author information
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    
    // Overall Manuscript Lifecycle Status
    status: { 
        type: String, 
        enum: [
            'Pending Editor Review', 
            'Approved by Editor', 
            'Rejected by Editor', 
            'Approved by Reviewer', 
            'Rejected by Reviewer', 
            'Resubmitted'
        ], 
        default: 'Pending Editor Review' 
    },

    // Editor Review Metadata
    editorReview: {
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewerName: { type: String },
        comments: { type: String },
        status: { type: String, enum: ['Approved', 'Rejected'] },
        reviewedAt: { type: Date }
    },

    // Reviewer (Peer Review) Metadata
    reviewerReview: {
        reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewerName: { type: String },
        comments: { type: String },
        status: { type: String, enum: ['Approved', 'Rejected'] },
        reviewedAt: { type: Date }
    },

    // Optional assigned reviewer
    assignedReviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Audit Log / Workflow History
    history: [historySchema]
}, { timestamps: true });

module.exports = mongoose.model('Manuscript', manuscriptSchema);
