import { randomUUID } from "crypto";
import Database from "better-sqlite3";

const db = new Database("forum.db");

export function seedDatabase() {
    // Check if categories already exist before seeding
    const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };

    if (existingCategories.count === 0) {
        console.log('Seeding categories...');

        const announcementsId = randomUUID();
        const gameDiscussionId = randomUUID();
        const tradingId = randomUUID();

        const categories = [
            // Top-level categories
            {
                id: announcementsId,
                name: "Announcements",
                description: "Official updates and important information.",
                image: "/assets/announcements.png",
                slug: null, 
                is_locked: 0, 
                parent_id: null
            },
            {
                id: gameDiscussionId,
                name: "Game Discussion",
                description: "General gameplay topics and strategies.",
                image: "/assets/gamediscussion.png",
                slug: null, 
                is_locked: 0,  
                parent_id: null
            },
            {
                id: tradingId,
                name: "Trading & Economy",
                description: "Buy, sell, and trade in-game items.",
                image: "/assets/trading.png",
                slug: null,  
                is_locked: 0,  
                parent_id: null
            },
            // Subcategories under Announcements
            {
                id: randomUUID(),
                name: "Updates & Patches",
                description: "Latest updates and patch information.",
                image: null,
                is_locked: 1,
                slug: "updates-patches",
                parent_id: announcementsId
            },
            {
                id: randomUUID(),
                name: "Events",
                description: "Upcoming events and special activities.",
                image: null,
                is_locked: 1,
                slug: "events",
                parent_id: announcementsId
            },
            // Subcategories under Game Discussion
            {
                id: randomUUID(),
                name: "General Discussion",
                description: "Talk about anything game related.",
                image: null,
                is_locked: 0,
                slug: "general-discussion",
                parent_id: gameDiscussionId
            },
            {
                id: randomUUID(),
                name: "Strategies & Guides",
                description: "Share your best strategies and tips.",
                image: null,
                is_locked: 0,
                slug: "strategies-guides",
                parent_id: gameDiscussionId
            },
            {
                id: randomUUID(),
                name: "Class Discussions",
                description: "Discuss different classes and roles.",
                image: null,
                is_locked: 0,
                slug: "class-discussions",
                parent_id: gameDiscussionId
            },
            {
                id: randomUUID(),
                name: "Guild Recruitment",
                description: "Find or recruit guild members.",
                image: null,
                is_locked: 0,
                slug: "guild-recruitment",
                parent_id: gameDiscussionId
            },
            // Subcategories under Trading & Economy
            {
                id: randomUUID(),
                name: "Buying",
                description: "Looking to purchase items or services.",
                image: null,
                is_locked: 0,
                slug: "buying",
                parent_id: tradingId
            },
            {
                id: randomUUID(),
                name: "Selling",
                description: "List items or services for sale.",
                image: null,
                is_locked: 0, 
                slug: "selling",
                parent_id: tradingId
            }
        ];

        const insert = db.prepare(`
            INSERT INTO categories (id, name, description, image, slug, is_locked, parent_id)
            VALUES (@id, @name, @description, @image, @slug, @is_locked, @parent_id)
        `);

        for (const cat of categories) {
            insert.run(cat);
        }

        console.log("Seeded categories successfully!");
    } else {
        console.log(`Categories already exist (${existingCategories.count} found), skipping seed.`);
    }
}