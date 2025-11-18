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
            // Parent categories
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
            // Subcategories
            {
                id: randomUUID(),
                name: "Server Updates",
                description: "Latest server patches and updates.",
                image: null,
                slug: "updates-patches",  // Add this slug!
                is_locked: 0,
                parent_id: announcementsId
            },
            {
                id: randomUUID(),
                name: "Events",
                description: "Upcoming and ongoing events.",
                image: null,
                slug: "events",
                is_locked: 0,
                parent_id: announcementsId
            },
            {
                id: randomUUID(),
                name: "General Discussion",
                description: "Talk about anything game related.",
                image: null,
                slug: "general-discussion",
                is_locked: 0,
                parent_id: gameDiscussionId
            },
            {
                id: randomUUID(),
                name: "Strategies & Guides",
                description: "Share your best strategies and tips.",
                image: null,
                slug: "strategies-guides",
                is_locked: 0,
                parent_id: gameDiscussionId
            },
            {
                id: randomUUID(),
                name: "Buying",
                description: "Looking to purchase items or services.",
                image: null,
                slug: "buying",
                is_locked: 0,
                parent_id: tradingId
            },
            {
                id: randomUUID(),
                name: "Selling",
                description: "List items or services for sale.",
                image: null,
                slug: "selling",
                is_locked: 0,
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

        // Now seed some sample threads
        console.log('Seeding sample threads...');

        // Get some category IDs for threads
        const eventsCategory = db.prepare(`SELECT id FROM categories WHERE slug = 'events'`).get() as { id: string } | undefined;
        const generalCategory = db.prepare(`SELECT id FROM categories WHERE slug = 'general-discussion'`).get() as { id: string } | undefined;
        const strategiesCategory = db.prepare(`SELECT id FROM categories WHERE slug = 'strategies-guides'`).get() as { id: string } | undefined;
        const buyingCategory = db.prepare(`SELECT id FROM categories WHERE slug = 'buying'`).get() as { id: string } | undefined;

        // Create a sample user first
        const sampleUserId = randomUUID();
        db.prepare(`
            INSERT INTO users (id, email, username, password_hash, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(sampleUserId, 'admin@example.com', 'GameMaster', 'dummy_hash', new Date().toISOString());

        const threads = [
            // Events category
            {
                category_id: eventsCategory?.id,
                title: "🎉 Winter Festival Event - December 15-31",
                author_id: sampleUserId,
                is_sticky: 1,
                is_locked: 0
            },
            {
                category_id: eventsCategory?.id,
                title: "Double XP Weekend Coming Soon!",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            // General discussion
            {
                category_id: generalCategory?.id,
                title: "What's your favorite class and why?",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            {
                category_id: generalCategory?.id,
                title: "New player here - any tips?",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            {
                category_id: generalCategory?.id,
                title: "Thoughts on the latest patch?",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            // Strategies & Guides
            {
                category_id: strategiesCategory?.id,
                title: "📚 Complete Beginner's Guide to PvP",
                author_id: sampleUserId,
                is_sticky: 1,
                is_locked: 0
            },
            {
                category_id: strategiesCategory?.id,
                title: "Advanced Combat Techniques",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            {
                category_id: strategiesCategory?.id,
                title: "Best farming spots for new players",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            // Trading
            {
                category_id: buyingCategory?.id,
                title: "WTB: Legendary Sword of Flames",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            },
            {
                category_id: buyingCategory?.id,
                title: "Looking for enchanted armor set",
                author_id: sampleUserId,
                is_sticky: 0,
                is_locked: 0
            }
        ];

        const insertThread = db.prepare(`
            INSERT INTO threads (category_id, title, author_id, is_sticky, is_locked, is_deleted, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `);

        for (const thread of threads) {
            if (thread.category_id) {
                insertThread.run(
                    thread.category_id,
                    thread.title,
                    thread.author_id,
                    thread.is_sticky,
                    thread.is_locked
                );
            }
        }

        console.log("Seeded sample threads successfully!");

    } else {
        console.log(`Categories already exist (${existingCategories.count} found), skipping seed.`);
    }
}