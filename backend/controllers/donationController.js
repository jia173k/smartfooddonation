const { Donation, Match, User, Notification } = require('../models');
const { getMatchedNGOs } = require('./matchController');

// Create donation
exports.createDonation = async (req, res) => {
    try {
        const { foodType, quantity, expiryTime, freshness, description, location } = req.body;

        const donation = new Donation({
            donorId: req.user.id,
            foodType,
            quantity,
            expiryTime,
            freshness,
            description,
            location
        });

        await donation.save();

        // Find and notify matching NGOs
        const matches = await getMatchedNGOs(donation);

        // Create notifications for matched NGOs
        for (const match of matches) {
            const notification = new Notification({
                userId: match.ngoId,
                title: 'New Donation Available',
                message: `${quantity}kg of ${foodType} available ${match.distance}km away`,
                type: 'donation',
                relatedEntityId: donation._id
            });
            await notification.save();
        }

        res.status(201).json({
            message: 'Donation posted successfully',
            donation,
            matches: matches.slice(0, 5)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all donations (with filters)
exports.getDonations = async (req, res) => {
    try {
        const { status, donorId, location, radius } = req.query;

        let filter = {};

        if (status) filter.status = status;
        if (donorId) filter.donorId = donorId;

        // Geo-spatial query if location provided
        if (location) {
            const [latitude, longitude] = location.split(',');
            const radiusKm = radius || 10;

            filter['location'] = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude]
                    },
                    $maxDistance: radiusKm * 1000 // Convert to meters
                }
            };
        }

        const donations = await Donation.find(filter)
            .populate('donorId', 'name rating')
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get donation by ID
exports.getDonationById = async (req, res) => {
    try {
        const donation = await Donation.findById(req.params.id)
            .populate('donorId', 'name email phone rating')
            .populate('matchedNGO', 'name email');

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update donation status
exports.updateDonationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json({ message: 'Donation status updated', donation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cancel donation
exports.cancelDonation = async (req, res) => {
    try {
        const donation = await Donation.findByIdAndUpdate(
            req.params.id,
            { status: 'cancelled', updatedAt: new Date() },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ error: 'Donation not found' });
        }

        res.json({ message: 'Donation cancelled', donation });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get donor's donations
exports.getDonorDonations = async (req, res) => {
    try {
        const donations = await Donation.find({ donorId: req.user.id })
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get donation statistics
exports.getDonationStats = async (req, res) => {
    try {
        const totalDonations = await Donation.countDocuments();
        const successfulDonations = await Donation.countDocuments({ status: 'delivered' });
        const totalQuantity = await Donation.aggregate([
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        res.json({
            totalDonations,
            successfulDonations,
            totalQuantity: totalQuantity[0]?.total || 0,
            successRate: (successfulDonations / totalDonations * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
