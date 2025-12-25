// ============ Donor Module ============

class DonorManager {
    constructor() {
        this.donations = [];
        this.matches = [];
    }

    /**
     * Submit a donation
     */
    async submitDonation(donationData) {
        const donation = {
            id: Date.now(),
            donorId: currentUser.id,
            foodType: donationData.foodType,
            quantity: donationData.quantity,
            expiryTime: new Date(donationData.expiryTime),
            freshness: donationData.freshness,
            description: donationData.description,
            location: donationData.location,
            status: 'posted',
            createdAt: new Date(),
            images: []
        };

        this.donations.push(donation);

        // Send notification
        notificationManager.notifyDonationPosted(donation);

        // Set up expiry alerts
        notificationManager.setupExpiryAlerts(donation);

        // Find and notify matches
        return this.findMatches(donation);
    }

    /**
     * Find matches for a donation
     */
    findMatches(donation) {
        const matches = matchingEngine.predictMatches({
            foodType: donation.foodType,
            quantity: donation.quantity,
            freshness: donation.freshness,
            expiryTime: donation.expiryTime,
            donorLocation: { lat: 19.0760, lon: 72.8777 } // Mock location
        });

        matches.forEach((match, index) => {
            // Notify each matched NGO
            notificationManager.notifyNGOOfDonation(donation, match.distance);
        });

        return matches;
    }

    /**
     * Get donor's donations
     */
    getDonations(donorId) {
        return this.donations.filter(d => d.donorId === donorId);
    }

    /**
     * Get donation details
     */
    getDonationDetails(donationId) {
        return this.donations.find(d => d.id === donationId);
    }

    /**
     * Cancel a donation
     */
    cancelDonation(donationId) {
        const donation = this.donations.find(d => d.id === donationId);
        if (donation && donation.status === 'posted') {
            donation.status = 'cancelled';
            return true;
        }
        return false;
    }

    /**
     * Update donation status
     */
    updateDonationStatus(donationId, status) {
        const donation = this.donations.find(d => d.id === donationId);
        if (donation) {
            donation.status = status;
            return true;
        }
        return false;
    }

    /**
     * Track donation delivery
     */
    trackDonation(donationId) {
        const donation = this.donations.find(d => d.id === donationId);
        return {
            donationId,
            status: donation?.status,
            currentLocation: '5 minutes away',
            eta: '10 minutes',
            driver: 'Volunteer Driver'
        };
    }

    /**
     * Get donor stats
     */
    getDonorStats(donorId) {
        const donations = this.getDonations(donorId);
        const totalDonated = donations.reduce((sum, d) => sum + d.quantity, 0);
        const successfulDonations = donations.filter(d => d.status === 'delivered').length;

        return {
            totalDonations: donations.length,
            totalQuantity: totalDonated,
            successfulDonations,
            successRate: donations.length > 0 ? (successfulDonations / donations.length * 100) : 0,
            impact: `${totalDonated}kg food saved`,
            rating: 4.8
        };
    }

    /**
     * Get donor profile
     */
    getDonorProfile(donorId) {
        return {
            id: donorId,
            name: currentUser.name,
            email: currentUser.email,
            phone: currentUser.phone,
            organizationName: currentUser.organizationName,
            address: currentUser.address,
            joinedDate: new Date('2025-01-15'),
            totalDonations: 24,
            totalQuantity: 156.5,
            rating: 4.8,
            badges: ['First Donor', 'Helper', 'Eco Warrior'],
            rewardPoints: 450
        };
    }

    /**
     * Upload donation images
     */
    uploadDonationImages(donationId, files) {
        // Mock image upload
        console.log(`Uploading ${files.length} images for donation ${donationId}`);
        return { success: true, uploadedCount: files.length };
    }

    /**
     * Request pickup
     */
    requestPickup(donationId, pickupType = 'volunteer') {
        notificationManager.sendNotification(
            'Pickup Requested',
            `Pickup requested: ${pickupType}`,
            'info'
        );
        return { success: true, pickupType };
    }

    /**
     * Add donation to favorites
     */
    addFavouriteNGO(ngoId) {
        if (!currentUser.favouriteNGOs) {
            currentUser.favouriteNGOs = [];
        }
        if (!currentUser.favouriteNGOs.includes(ngoId)) {
            currentUser.favouriteNGOs.push(ngoId);
            return true;
        }
        return false;
    }

    /**
     * Get trending food items
     */
    getTrendingFoodItems() {
        return [
            { name: 'Cooked Rice', donations: 156, quantity: 500 },
            { name: 'Vegetables', donations: 142, quantity: 480 },
            { name: 'Bread & Bakery', donations: 128, quantity: 450 },
            { name: 'Prepared Meals', donations: 95, quantity: 320 }
        ];
    }
}

// Initialize donor manager
const donorManager = new DonorManager();

// Export for use in other modules
window.donorManager = donorManager;
