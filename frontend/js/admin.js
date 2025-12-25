// ============ Admin Module ============

class AdminManager {
    constructor() {
        this.users = [];
        this.donations = [];
        this.reports = [];
    }

    /**
     * Get all users (with pagination)
     */
    getAllUsers(page = 1, limit = 10) {
        // Mock data
        const allUsers = [
            { id: 1, name: 'Restaurant ABC', email: 'contact@restuabc.com', role: 'Donor', status: 'active', joinedDate: new Date('2025-01-15') },
            { id: 2, name: 'City Food Bank', email: 'info@cityfoodbank.org', role: 'NGO', status: 'active', joinedDate: new Date('2024-12-01') },
            { id: 3, name: 'Hotel XYZ', email: 'hr@hotelxyz.com', role: 'Donor', status: 'active', joinedDate: new Date('2025-01-20') },
            { id: 4, name: 'Community Kitchen', email: 'contact@communitykitchen.org', role: 'NGO', status: 'active', joinedDate: new Date('2025-02-05') },
            { id: 5, name: 'Bakery PQR', email: 'info@bakerrypqr.com', role: 'Donor', status: 'suspended', joinedDate: new Date('2025-01-10') }
        ];

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            users: allUsers.slice(startIndex, endIndex),
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(allUsers.length / limit),
                total: allUsers.length
            }
        };
    }

    /**
     * Get user details
     */
    getUserDetails(userId) {
        return {
            id: userId,
            name: 'Restaurant ABC',
            email: 'contact@restuabc.com',
            phone: '+91-9876543210',
            role: 'Donor',
            organizationName: 'ABC Restaurant',
            address: '123 Main St, City',
            joinedDate: new Date('2025-01-15'),
            status: 'active',
            totalDonations: 24,
            totalQuantity: 156.5,
            rating: 4.8,
            reviews: 45,
            rewardPoints: 450,
            documents: ['verified', 'id-proof', 'address-proof']
        };
    }

    /**
     * Suspend or activate user
     */
    updateUserStatus(userId, status) {
        notificationManager.sendNotification(
            'User Status Updated',
            `User ${userId} status changed to ${status}`,
            'info'
        );
        return { success: true, userId, newStatus: status };
    }

    /**
     * Get all donations with filters
     */
    getDonations(filters = {}) {
        const donations = [
            {
                id: 1,
                type: 'Cooked Rice',
                donor: 'Restaurant ABC',
                receiver: 'City Food Bank',
                quantity: 5,
                status: 'delivered',
                createdAt: new Date('2025-12-05'),
                deliveredAt: new Date('2025-12-05')
            },
            {
                id: 2,
                type: 'Vegetables',
                donor: 'Hotel XYZ',
                receiver: 'Community Kitchen',
                quantity: 8,
                status: 'accepted',
                createdAt: new Date('2025-12-04'),
                deliveredAt: null
            },
            {
                id: 3,
                type: 'Bread',
                donor: 'Bakery PQR',
                receiver: null,
                quantity: 12,
                status: 'expired',
                createdAt: new Date('2025-12-03'),
                expiredAt: new Date('2025-12-03')
            }
        ];

        let filtered = donations;

        if (filters.status) {
            filtered = filtered.filter(d => d.status === filters.status);
        }

        if (filters.donor) {
            filtered = filtered.filter(d => d.donor.includes(filters.donor));
        }

        if (filters.receiver) {
            filtered = filtered.filter(d => d.receiver && d.receiver.includes(filters.receiver));
        }

        return filtered;
    }

    /**
     * Get platform analytics
     */
    getAnalytics() {
        return {
            summary: {
                totalUsers: 1250,
                activeDonors: 856,
                activeNGOs: 94,
                totalDonations: 5632,
                totalFoodDonated: 45620, // kg
                peopleServed: 12500
            },
            statistics: {
                donationsThisMonth: 542,
                foodDonatedThisMonth: 4580,
                averageDonationSize: 8.1,
                successRate: 92.5,
                averageMatchTime: 12 // minutes
            },
            topDonors: [
                { name: 'Restaurant ABC', donations: 156, quantity: 1250 },
                { name: 'Hotel XYZ', donations: 128, quantity: 950 },
                { name: 'Bakery PQR', donations: 102, quantity: 850 }
            ],
            topNGOs: [
                { name: 'City Food Bank', received: 450, quantity: 3600 },
                { name: 'Community Kitchen', received: 320, quantity: 2200 },
                { name: 'Hope Foundation', received: 280, quantity: 1850 }
            ],
            geographicDistribution: {
                downtown: 45,
                suburbs: 35,
                outskirts: 20
            }
        };
    }

    /**
     * Get platform reports
     */
    getReports() {
        return [
            {
                id: 1,
                title: 'Daily Activity Report',
                type: 'daily',
                lastGenerated: new Date(),
                data: {
                    donations: 125,
                    matches: 98,
                    deliveries: 85
                }
            },
            {
                id: 2,
                title: 'Monthly Statistics',
                type: 'monthly',
                lastGenerated: new Date(),
                data: {
                    totalDonations: 3650,
                    totalFood: 29400,
                    newUsers: 156
                }
            },
            {
                id: 3,
                title: 'Impact Assessment',
                type: 'impact',
                lastGenerated: new Date(Date.now() - 7*24*60*60*1000),
                data: {
                    foodWastePrevented: 45620,
                    economicValue: 456200,
                    peopleHelped: 12500
                }
            }
        ];
    }

    /**
     * Verify user documents
     */
    verifyUserDocuments(userId, documents) {
        return {
            success: true,
            userId,
            verifiedDocuments: documents,
            status: 'verified'
        };
    }

    /**
     * Handle user complaints/reports
     */
    handleComplaint(complaintData) {
        const complaint = {
            id: Date.now(),
            ...complaintData,
            status: 'open',
            createdAt: new Date()
        };

        this.reports.push(complaint);

        notificationManager.sendNotification(
            'Complaint Received',
            'We will review and respond within 24 hours',
            'info'
        );

        return complaint;
    }

    /**
     * Generate donation report
     */
    generateDonationReport(startDate, endDate) {
        return {
            reportPeriod: `${startDate} to ${endDate}`,
            totalDonations: 542,
            totalQuantity: 4580,
            successfulDeliveries: 498,
            expiredDonations: 22,
            cancelledDonations: 22,
            averageMatchTime: 12.5,
            averageDeliveryTime: 45,
            topFoodTypes: {
                'Cooked Food': 156,
                'Vegetables': 142,
                'Bread': 128
            }
        };
    }

    /**
     * Generate impact report
     */
    generateImpactReport() {
        return {
            period: 'Last 12 months',
            foodWastePrevented: 125480, // kg
            economicValue: 1254800, // Rs/USD
            peopleServed: 35600,
            carbonEmissionPrevented: 314, // kg CO2
            mealsProvided: 89200,
            activeParticipants: 1250,
            socialImpact: {
                foodSecurityImproved: 156,
                communityEmpowered: 94,
                volunteerHours: 5600
            }
        };
    }

    /**
     * Manage system settings
     */
    updateSystemSettings(settings) {
        return {
            success: true,
            settings: {
                maxMatchDistance: settings.maxMatchDistance || 10,
                matchTimeout: settings.matchTimeout || 30,
                minRewardPoints: settings.minRewardPoints || 50,
                maintenanceMode: settings.maintenanceMode || false
            }
        };
    }

    /**
     * Monitor system health
     */
    getSystemHealth() {
        return {
            status: 'healthy',
            uptime: 99.98,
            apiResponseTime: 125, // ms
            databaseStatus: 'connected',
            activeUsers: 856,
            requestsPerMinute: 1250,
            errorRate: 0.02
        };
    }

    /**
     * Get email logs
     */
    getEmailLogs(limit = 20) {
        return [
            { id: 1, recipient: 'user@example.com', subject: 'Donation Matched', sentAt: new Date(), status: 'delivered' },
            { id: 2, recipient: 'ngo@example.com', subject: 'New Donation Available', sentAt: new Date(), status: 'delivered' }
        ];
    }

    /**
     * Send bulk notifications
     */
    sendBulkNotification(users, message) {
        notificationManager.sendNotification(
            'Bulk Notification Sent',
            `Message sent to ${users.length} users`,
            'success'
        );
        return { success: true, recipientCount: users.length };
    }

    /**
     * Manage banned/blocked users
     */
    blockUser(userId, reason) {
        return {
            success: true,
            userId,
            status: 'blocked',
            reason
        };
    }

    /**
     * Audit log
     */
    getAuditLog(limit = 50) {
        return [
            { id: 1, action: 'user_created', user: 'Restaurant ABC', timestamp: new Date(), details: 'New donor registered' },
            { id: 2, action: 'donation_posted', user: 'Hotel XYZ', timestamp: new Date(), details: '5kg vegetables' },
            { id: 3, action: 'user_suspended', user: 'Admin', timestamp: new Date(), details: 'User flagged for abuse' }
        ];
    }
}

// Initialize admin manager
const adminManager = new AdminManager();

// Export for use in other modules
window.adminManager = adminManager;
