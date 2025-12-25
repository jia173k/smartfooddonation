const { User, Match, Donation } = require('../models');

/**
 * Calculate distance using Haversine formula
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

/**
 * Calculate freshness score
 */
const calculateFreshnessScore = (freshness, expiryTime) => {
    const freshnessMap = {
        'fresh': 100,
        'good': 75,
        'fair': 50
    };

    const baseScore = freshnessMap[freshness] || 50;
    const timeUntilExpiry = new Date(expiryTime) - new Date();
    const hoursLeft = timeUntilExpiry / (1000 * 60 * 60);

    // Deduct points as expiry approaches
    let score = baseScore - Math.max(0, (24 - hoursLeft) * 2);
    return Math.max(0, Math.min(100, score));
};

/**
 * Calculate match score for an NGO
 */
const calculateMatchScore = (donation, ngo, distance) => {
    let score = 100;

    // Distance penalty (1.5 point per km, max 30 points)
    const distancePenalty = Math.min(30, distance * 1.5);
    score -= distancePenalty;

    // Freshness bonus
    const freshnessScore = calculateFreshnessScore(donation.freshness, donation.expiryTime);
    score += (freshnessScore / 100) * 15;

    // Capacity check
    if (donation.quantity <= ngo.dailyCapacity) {
        score += 10;
    } else if (donation.quantity <= ngo.dailyCapacity * 1.5) {
        score += 5;
    }

    // NGO rating bonus
    score += (ngo.rating / 5) * 10;

    // Food type preference
    if (ngo.foodPreferences && ngo.foodPreferences.length > 0) {
        if (ngo.foodPreferences.includes(donation.foodType.toLowerCase()) || 
            ngo.foodPreferences.includes('all')) {
            score += 5;
        }
    }

    return Math.max(0, Math.min(100, score));
};

/**
 * Find best matching NGOs for a donation
 */
exports.getMatchedNGOs = async (donation) => {
    try {
        // Get all active NGOs
        const ngos = await User.find({ role: 'ngo', status: 'active' });

        // Calculate scores for each NGO
        const matches = ngos.map(ngo => {
            const distance = calculateDistance(
                donation.location.latitude || 19.0760,
                donation.location.longitude || 72.8777,
                ngo.location.latitude || 19.0760,
                ngo.location.longitude || 72.8777
            );

            const matchScore = calculateMatchScore(donation, ngo, distance);

            return {
                ngoId: ngo._id,
                ngo,
                distance,
                matchScore,
                eta: Math.ceil(distance / 30 * 60) // ETA in minutes
            };
        });

        // Sort by score and filter
        return matches
            .filter(m => m.matchScore > 50)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

    } catch (error) {
        console.error('Error finding matches:', error);
        return [];
    }
};

/**
 * Create match between donation and NGO
 */
exports.createMatch = async (req, res) => {
    try {
        const { donationId, ngoId } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        const ngo = await User.findById(ngoId);
        if (!ngo) {
            return res.status(404).json({ error: 'NGO not found' });
        }

        // Calculate match details
        const distance = calculateDistance(
            donation.location.latitude,
            donation.location.longitude,
            ngo.location.latitude,
            ngo.location.longitude
        );

        const matchScore = calculateMatchScore(donation, ngo, distance);

        const match = new Match({
            donationId,
            donorId: donation.donorId,
            ngoId,
            matchScore,
            distance,
            eta: Math.ceil(distance / 30 * 60)
        });

        await match.save();

        // Update donation status
        donation.status = 'matched';
        await donation.save();

        res.status(201).json({
            message: 'Match created successfully',
            match
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Accept match (NGO accepts donation)
 */
exports.acceptMatch = async (req, res) => {
    try {
        const matchId = req.params.id;

        const match = await Match.findByIdAndUpdate(
            matchId,
            { status: 'accepted', acceptedAt: new Date() },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Update donation status
        await Donation.findByIdAndUpdate(match.donationId, { status: 'accepted', matchedNGO: match.ngoId });

        res.json({ message: 'Match accepted', match });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Decline match (NGO declines donation)
 */
exports.declineMatch = async (req, res) => {
    try {
        const matchId = req.params.id;

        const match = await Match.findByIdAndUpdate(
            matchId,
            { status: 'declined', declinedAt: new Date() },
            { new: true }
        );

        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }

        // Donation returns to posted status for other matches
        await Donation.findByIdAndUpdate(match.donationId, { status: 'posted' });

        res.json({ message: 'Match declined', match });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get all matches
 */
exports.getAllMatches = async (req, res) => {
    try {
        const matches = await Match.find()
            .populate('donorId', 'name rating')
            .populate('ngoId', 'name rating')
            .populate('donationId', 'foodType quantity')
            .sort({ createdAt: -1 });

        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get user's matches
 */
exports.getUserMatches = async (req, res) => {
    try {
        const matches = await Match.find({
            $or: [{ donorId: req.user.id }, { ngoId: req.user.id }]
        })
            .populate('donorId', 'name rating')
            .populate('ngoId', 'name rating')
            .populate('donationId', 'foodType quantity')
            .sort({ createdAt: -1 });

        res.json(matches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get match statistics
 */
exports.getMatchStatistics = async (req, res) => {
    try {
        const totalMatches = await Match.countDocuments();
        const acceptedMatches = await Match.countDocuments({ status: 'accepted' });
        const avgMatchScore = await Match.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$matchScore' } } }
        ]);

        res.json({
            totalMatches,
            acceptedMatches,
            acceptanceRate: ((acceptedMatches / totalMatches) * 100).toFixed(2),
            avgMatchScore: avgMatchScore[0]?.avgScore.toFixed(2) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
