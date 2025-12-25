// ============ NGO Receiver Module ============

class NGOManager {
    constructor() {
        this.receivedDonations = [];
        this.inventory = [];
        this.pickupRequests = [];
    }

    /**
     * View available donations near NGO
     */
    getAvailableDonations(ngoId, radius = 10) {
        // Mock data - in real app, fetch from backend
        return [
            {
                id: 1,
                type: 'Cooked Rice',
                quantity: 5,
                freshness: 'fresh',
                donor: 'Restaurant ABC',
                distance: 1.5,
                expiryIn: 120,
                rating: 4.8,
                location: { lat: 19.0760, lon: 72.8777 }
            },
            {
                id: 2,
                type: 'Vegetables Mix',
                quantity: 8,
                freshness: 'good',
                donor: 'Hotel XYZ',
                distance: 2.3,
                expiryIn: 210,
                rating: 4.6,
                location: { lat: 19.0761, lon: 72.8900 }
            },
            {
                id: 3,
                type: 'Bread & Bakery',
                quantity: 12,
                freshness: 'fair',
                donor: 'Bakery PQR',
                distance: 3.1,
                expiryIn: 240,
                rating: 4.5,
                location: { lat: 19.0900, lon: 72.8777 }
            }
        ];
    }

    /**
     * Accept a donation
     */
    acceptDonation(donationId, ngoId) {
        const acceptance = {
            id: Date.now(),
            donationId,
            ngoId,
            acceptedAt: new Date(),
            status: 'accepted',
            deliveryMethod: 'pending' // 'volunteer', 'ngo', 'donor'
        };

        // Add to received donations
        this.receivedDonations.push(acceptance);

        // Notify about acceptance
        notificationManager.sendNotification(
            'Donation Accepted',
            'Delivery will be arranged shortly',
            'success'
        );

        return acceptance;
    }

    /**
     * Decline a donation
     */
    declineDonation(donationId, reason = '') {
        notificationManager.sendNotification(
            'Donation Declined',
            `Donation declined. Reason: ${reason || 'Capacity full'}`,
            'warning'
        );
        return { success: true };
    }

    /**
     * Add donation to inventory
     */
    addToInventory(donation) {
        const inventoryItem = {
            id: Date.now(),
            donationId: donation.id,
            foodType: donation.foodType,
            quantity: donation.quantity,
            freshness: donation.freshness,
            expiryTime: donation.expiryTime,
            receivedAt: new Date(),
            status: 'in-inventory'
        };

        this.inventory.push(inventoryItem);
        return inventoryItem;
    }

    /**
     * Get current inventory
     */
    getInventory(ngoId) {
        return this.inventory;
    }

    /**
     * Get inventory analytics
     */
    getInventoryAnalytics() {
        const total = this.inventory.reduce((sum, item) => sum + item.quantity, 0);
        const byType = {};
        
        this.inventory.forEach(item => {
            byType[item.foodType] = (byType[item.foodType] || 0) + item.quantity;
        });

        return {
            totalQuantity: total,
            itemCount: this.inventory.length,
            byFoodType: byType,
            storageCapacity: 200,
            utilization: (total / 200) * 100
        };
    }

    /**
     * Process distribution
     */
    processDistribution(inventoryId, quantityDistributed) {
        const item = this.inventory.find(i => i.id === inventoryId);
        if (item) {
            item.quantity -= quantityDistributed;
            if (item.quantity === 0) {
                item.status = 'distributed';
            }
            return true;
        }
        return false;
    }

    /**
     * Get NGO stats
     */
    getNGOStats(ngoId) {
        return {
            totalDonationsReceived: this.receivedDonations.length,
            totalFoodReceived: 456.5,
            activeDonations: this.inventory.filter(i => i.status === 'in-inventory').length,
            peopleServed: 1250,
            averageResponseTime: 45, // minutes
            rating: 4.7
        };
    }

    /**
     * Get NGO profile
     */
    getNGOProfile(ngoId) {
        return {
            id: ngoId,
            name: currentUser.ngoName,
            email: currentUser.email,
            phone: currentUser.phone,
            address: currentUser.address,
            joinedDate: new Date('2024-06-15'),
            totalDonationsReceived: 45,
            totalFoodReceived: 456.5,
            dailyCapacity: parseInt(currentUser.dailyCapacity),
            activeVolunteers: 12,
            peopleServed: 1250,
            rating: 4.7,
            badges: ['Trusted Partner', 'Community Champion']
        };
    }

    /**
     * Request delivery from donor
     */
    requestDonorDelivery(donationId) {
        notificationManager.sendNotification(
            'Delivery Requested',
            'Donor is arranging delivery',
            'info'
        );
        return { success: true, method: 'donor' };
    }

    /**
     * Request volunteer pickup
     */
    requestVolunteerPickup(donationId) {
        this.pickupRequests.push({
            id: Date.now(),
            donationId,
            requestedAt: new Date(),
            status: 'pending'
        });
        
        notificationManager.sendNotification(
            'Pickup Assigned',
            'Volunteer will pickup shortly',
            'info'
        );
        return { success: true, method: 'volunteer' };
    }

    /**
     * Arrange self-pickup
     */
    arrangeSelfPickup(donationId) {
        notificationManager.sendNotification(
            'Pickup Arranged',
            'You can pickup the donation now',
            'info'
        );
        return { success: true, method: 'ngo' };
    }

    /**
     * Set NGO food preferences
     */
    setFoodPreferences(preferences) {
        // Food type preferences for matching algorithm
        return { success: true, preferences };
    }

    /**
     * Get trending donations nearby
     */
    getTrendingDonations() {
        return [
            { foodType: 'Cooked Rice', count: 156, distance: '< 2km' },
            { foodType: 'Vegetables', count: 142, distance: '< 5km' },
            { foodType: 'Bread', count: 128, distance: '< 3km' }
        ];
    }

    /**
     * Verify food quality on delivery
     */
    verifyFoodQuality(donationId, qualityScore, notes) {
        // Record quality verification
        const verification = {
            donationId,
            verifiedAt: new Date(),
            qualityScore, // 1-10
            notes,
            verified: qualityScore >= 7
        };

        notificationManager.sendNotification(
            'Food Verified',
            `Quality score: ${qualityScore}/10`,
            'info'
        );

        return verification;
    }
}

// Initialize NGO manager
const ngoManager = new NGOManager();

// Export for use in other modules
window.ngoManager = ngoManager;
