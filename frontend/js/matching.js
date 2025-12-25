// ============ Matching Algorithm Module ============

/**
 * Smart Matching Algorithm
 * Matches surplus food with nearest NGOs based on:
 * - Distance (proximity)
 * - Food freshness and quality
 * - NGO capacity and requirements
 * - Real-time availability
 */

class MatchingEngine {
    constructor() {
        this.matches = [];
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    /**
     * Calculate freshness score (0-100)
     * Based on time since preparation and food type
     */
    calculateFreshnessScore(freshness, timeElapsed) {
        const freshnessMap = {
            'fresh': 100,   // Just prepared
            'good': 75,     // < 2 hours
            'fair': 50      // 2-4 hours
        };
        
        const baseScore = freshnessMap[freshness] || 50;
        
        // Deduct 1 point per hour
        const score = Math.max(0, baseScore - (timeElapsed * 15));
        
        return Math.min(100, score);
    }

    /**
     * Calculate match score for NGO
     */
    calculateMatchScore(donation, ngo, distance) {
        let score = 100;
        
        // Distance penalty (1 point per km, max 30 points)
        const distancePenalty = Math.min(30, distance * 1.5);
        score -= distancePenalty;
        
        // Freshness bonus (prefer fresher food)
        const freshnessScore = this.calculateFreshnessScore(
            donation.freshness,
            0 // Assuming just posted
        );
        score += (freshnessScore / 100) * 15;
        
        // Capacity check (food fits in NGO capacity)
        if (donation.quantity <= ngo.dailyCapacity) {
            score += 10;
        } else if (donation.quantity <= ngo.dailyCapacity * 1.5) {
            score += 5;
        }
        
        // NGO rating bonus
        score += (ngo.rating / 5) * 10;
        
        // Food type preference
        if (ngo.foodPreferences && ngo.foodPreferences.includes(donation.foodType)) {
            score += 5;
        }
        
        return Math.max(0, Math.min(100, score));
    }

    /**
     * Find best matching NGOs for a donation
     */
    findMatches(donation, availableNGOs, donorLocation) {
        const matches = availableNGOs.map(ngo => {
            const distance = this.calculateDistance(
                donorLocation.lat,
                donorLocation.lon,
                ngo.location.lat,
                ngo.location.lon
            );
            
            const matchScore = this.calculateMatchScore(donation, ngo, distance);
            
            return {
                ngo,
                distance,
                matchScore,
                confidence: matchScore / 100,
                eta: Math.ceil(distance / 30 * 60) // ETA in minutes assuming 30 km/h
            };
        });
        
        // Sort by match score descending
        matches.sort((a, b) => b.matchScore - a.matchScore);
        
        // Return top 5 matches with score > 50
        return matches.filter(m => m.matchScore > 50).slice(0, 5);
    }

    /**
     * Predict donation matches in real-time
     */
    predictMatches(donationData) {
        // Mock NGO data - in real implementation, fetch from database
        const ngos = [
            {
                id: 1,
                name: 'City Food Bank',
                location: { lat: 19.0760, lon: 72.8777 },
                dailyCapacity: 100,
                rating: 4.8,
                foodPreferences: ['cooked', 'vegetables']
            },
            {
                id: 2,
                name: 'Community Kitchen',
                location: { lat: 19.0761, lon: 72.8900 },
                dailyCapacity: 50,
                rating: 4.5,
                foodPreferences: ['vegetables', 'bread']
            },
            {
                id: 3,
                name: 'Food for All NGO',
                location: { lat: 19.0900, lon: 72.8777 },
                dailyCapacity: 150,
                rating: 4.7,
                foodPreferences: ['cooked', 'bread']
            },
            {
                id: 4,
                name: 'Hope Foundation',
                location: { lat: 19.1000, lon: 72.9000 },
                dailyCapacity: 75,
                rating: 4.6,
                foodPreferences: ['all']
            }
        ];
        
        const matches = this.findMatches(
            donationData,
            ngos,
            donationData.donorLocation || { lat: 19.0760, lon: 72.8777 }
        );
        
        return matches;
    }

    /**
     * Update match status in real-time
     */
    updateMatchStatus(matchId, status) {
        console.log(`Match ${matchId} status updated to: ${status}`);
        // Send to backend
        // fetch(`${API_BASE}/matches/${matchId}`, {
        //     method: 'PATCH',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ status })
        // });
    }

    /**
     * Get match history for a donor
     */
    getMatchHistory(donorId) {
        // Mock data
        return [
            {
                id: 1,
                donationId: 101,
                ngo: 'City Food Bank',
                matchedAt: new Date('2025-12-05'),
                status: 'delivered',
                matchScore: 92
            },
            {
                id: 2,
                donationId: 102,
                ngo: 'Community Kitchen',
                matchedAt: new Date('2025-12-04'),
                status: 'accepted',
                matchScore: 85
            }
        ];
    }

    /**
     * Recommend NGOs based on donor history and patterns
     */
    getRecommendedNGOs(donorId, numberOfRecommendations = 3) {
        // Analyze donor's donation history and recommend best matching NGOs
        const recommendations = [
            {
                ngo: 'City Food Bank',
                reason: 'Perfect match for cooked food donations',
                matchRate: 95
            },
            {
                ngo: 'Community Kitchen',
                reason: 'High acceptance rate for your donation types',
                matchRate: 88
            },
            {
                ngo: 'Hope Foundation',
                reason: 'Frequently requests donation quantities you provide',
                matchRate: 82
            }
        ];
        
        return recommendations.slice(0, numberOfRecommendations);
    }
}

// Initialize matching engine
const matchingEngine = new MatchingEngine();

// Export for use in other modules
window.matchingEngine = matchingEngine;
