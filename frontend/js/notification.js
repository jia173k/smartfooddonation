// ============ Notification Module ============

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.initializeNotificationCenter();
    }

    /**
     * Initialize notification center
     */
    initializeNotificationCenter() {
        // Check for browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    /**
     * Send in-app notification
     */
    sendNotification(title, message, type = 'info', duration = 4000) {
        const notification = {
            id: Date.now(),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false
        };

        this.notifications.unshift(notification);
        this.unreadCount++;

        // Show toast
        showToast(`${title}: ${message}`, type);

        // Send browser notification if available
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: '/images/logo.png'
            });
        }

        // Auto-remove after duration
        setTimeout(() => {
            this.removeNotification(notification.id);
        }, duration);

        return notification.id;
    }

    /**
     * Mark notification as read
     */
    markAsRead(notificationId) {
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
            notification.read = true;
            this.unreadCount--;
        }
    }

    /**
     * Remove notification
     */
    removeNotification(notificationId) {
        const index = this.notifications.findIndex(n => n.id === notificationId);
        if (index > -1) {
            const notification = this.notifications[index];
            if (!notification.read) {
                this.unreadCount--;
            }
            this.notifications.splice(index, 1);
        }
    }

    /**
     * Get all notifications
     */
    getAllNotifications() {
        return this.notifications;
    }

    /**
     * Get unread notifications
     */
    getUnreadNotifications() {
        return this.notifications.filter(n => !n.read);
    }

    /**
     * Clear all notifications
     */
    clearAll() {
        this.notifications = [];
        this.unreadCount = 0;
    }

    /**
     * Donation posted notification
     */
    notifyDonationPosted(donation) {
        const message = `Your donation of ${donation.quantity}kg ${donation.foodType} was posted successfully`;
        this.sendNotification('Donation Posted', message, 'success');
    }

    /**
     * Donation matched notification
     */
    notifyDonationMatched(donation, ngo) {
        const message = `Your donation matched with ${ngo.name}! Distance: ${ngo.distance}km`;
        this.sendNotification('Match Found', message, 'success');
    }

    /**
     * Donation accepted notification
     */
    notifyDonationAccepted(ngo) {
        const message = `${ngo.name} accepted your donation! Delivery will be arranged soon.`;
        this.sendNotification('Donation Accepted', message, 'success');
    }

    /**
     * Donation declined notification
     */
    notifyDonationDeclined(ngo) {
        const message = `${ngo.name} declined your donation. Check other matches.`;
        this.sendNotification('Donation Declined', message, 'warning');
    }

    /**
     * Donation expiring notification (predictive alert)
     */
    notifyDonationExpiring(donation, minutesLeft) {
        const message = `Your donation will expire in ${minutesLeft} minutes. Find a match quickly!`;
        this.sendNotification('Expiry Alert', message, 'warning');
    }

    /**
     * NGO notification for available donation
     */
    notifyNGOOfDonation(donation, distance) {
        const message = `New donation available: ${donation.quantity}kg ${donation.foodType} - ${distance}km away`;
        this.sendNotification('New Donation Available', message, 'info');
    }

    /**
     * NGO delivery notification
     */
    notifyDeliveryArranged(donor, eta) {
        const message = `Delivery arranged from ${donor.name}. ETA: ${eta} minutes`;
        this.sendNotification('Delivery Arranged', message, 'info');
    }

    /**
     * Reward points notification
     */
    notifyRewardPoints(points, reason) {
        const message = `You earned ${points} points for ${reason}`;
        this.sendNotification('Reward Earned', message, 'success');
    }

    /**
     * Badge unlocked notification
     */
    notifyBadgeUnlocked(badgeName) {
        const message = `Congratulations! You unlocked the "${badgeName}" badge`;
        this.sendNotification('Badge Unlocked', message, 'success');
    }

    /**
     * Setup real-time notifications (WebSocket simulation)
     */
    setupRealTimeNotifications() {
        // In production, this would be a WebSocket connection
        // setInterval(() => {
        //     fetch(`${API_BASE}/notifications`, {
        //         headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         if (data.notifications && data.notifications.length > 0) {
        //             data.notifications.forEach(notif => {
        //                 if (!this.notifications.find(n => n.id === notif.id)) {
        //                     this.sendNotification(notif.title, notif.message, notif.type);
        //                 }
        //             });
        //         }
        //     });
        // }, 10000); // Check every 10 seconds
    }

    /**
     * Setup predictive alerts for expiring donations
     */
    setupExpiryAlerts(donation) {
        const expiryTime = new Date(donation.expiryTime);
        const now = new Date();
        const timeUntilExpiry = expiryTime - now;

        // Alert when 30 minutes left
        setTimeout(() => {
            if (timeUntilExpiry > 30 * 60 * 1000) {
                this.notifyDonationExpiring(donation, 30);
            }
        }, timeUntilExpiry - 30 * 60 * 1000);

        // Alert when 10 minutes left
        setTimeout(() => {
            if (timeUntilExpiry > 10 * 60 * 1000) {
                this.notifyDonationExpiring(donation, 10);
            }
        }, timeUntilExpiry - 10 * 60 * 1000);

        // Alert when 2 minutes left
        setTimeout(() => {
            if (timeUntilExpiry > 2 * 60 * 1000) {
                this.notifyDonationExpiring(donation, 2);
            }
        }, timeUntilExpiry - 2 * 60 * 1000);
    }

    /**
     * Get notification history
     */
    getNotificationHistory(limit = 10) {
        return this.notifications.slice(0, limit);
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager();

// Export for use in other modules
window.notificationManager = notificationManager;
