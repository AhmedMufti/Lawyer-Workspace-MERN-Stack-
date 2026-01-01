const Case = require('../models/Case');
const Document = require('../models/Document');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/responseFormatter');

exports.getDashboardStats = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    // 1. Get Cases Stats
    // Using Case.findByLawyer to ensure we only get cases accessible to the user
    // Note: findByLawyer is a static method we saw in Case.js
    const cases = await Case.findByLawyer(userId);

    const caseStats = {
        total: cases.length,
        active: cases.filter(c => ['In Progress', 'Filed', 'Hearing Scheduled', 'Under Review'].includes(c.caseStatus)).length,
        completed: cases.filter(c => ['Decided', 'Dismissed', 'Withdrawn', 'Settled'].includes(c.caseStatus)).length
    };

    // 2. Get Upcoming Hearings (from active cases)
    // We can filter the fetched cases for nextHearingDate
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const upcomingHearings = cases
        .filter(c => c.nextHearingDate && new Date(c.nextHearingDate) >= today)
        .sort((a, b) => new Date(a.nextHearingDate) - new Date(b.nextHearingDate))
        .slice(0, 5)
        .map(c => ({
            id: c._id,
            caseTitle: c.caseTitle,
            caseNumber: c.caseNumber,
            date: c.nextHearingDate,
            type: 'Hearing'
        }));

    // 3. Get Recent Documents
    // We need to find documents for these cases or uploaded by this user
    const caseIds = cases.map(c => c._id);
    const recentDocuments = await Document.find({
        $or: [
            { case: { $in: caseIds } },
            { uploadedBy: userId }
        ]
    })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('uploadedBy', 'firstName lastName');

    // 4. Compile Recent Activity Stream
    // Combine recent cases, recent documents, and maybe recent hearings/updates
    const activityStream = [];

    // Add recent cases
    cases.forEach(c => {
        activityStream.push({
            type: 'case_created',
            title: `Case filed: ${c.caseNumber}`,
            subtitle: c.caseTitle,
            date: c.createdAt,
            link: `/dashboard/cases/${c._id}`
        });
    });

    // Add recent documents
    recentDocuments.forEach(d => {
        activityStream.push({
            type: 'document_uploaded',
            title: `Document added: ${d.documentTitle}`,
            subtitle: d.case ? `Case: ${d.case}` : 'No Case', // We might need to populate case title if needed, or just use case ID
            date: d.createdAt,
            link: d.case ? `/dashboard/cases/${d.case}?tab=documents` : '#'
        });
    });

    // Sort by date desc
    activityStream.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Slice top 10
    const recentActivity = activityStream.slice(0, 10);

    sendSuccess(res, 200, 'Dashboard stats retrieved', {
        stats: {
            cases: caseStats,
            hearings: upcomingHearings.length,
            documents: recentDocuments.length // or total count if we did a separate count query
        },
        upcomingHearings,
        recentActivity
    });
});
