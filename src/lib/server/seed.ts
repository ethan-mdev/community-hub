import { randomUUID } from "crypto";
import Database from "better-sqlite3";

const db = new Database("forum.db");

export function seedDatabase() {
    // Check if categories already exist before seeding
    const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
    const existingPosts = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };

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
                is_locked: 1,
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
                is_locked: 1
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

        // Now seed some posts for the threads
        console.log('Seeding sample posts...');

        // Get some thread IDs to add posts to
        const threadRows = db.prepare(`SELECT id, title FROM threads ORDER BY id ASC LIMIT 5`).all() as { id: number, title: string }[];

        // Create a few more sample users for variety
        const users = [
            { id: randomUUID(), username: 'PlayerOne', email: 'player1@example.com', profile_image: 'avatar-3.png' },
            { id: randomUUID(), username: 'WizardMage', email: 'wizard@example.com', profile_image: 'avatar-4.png' },
            { id: randomUUID(), username: 'SwordMaster', email: 'sword@example.com', profile_image: 'avatar-5.png' },
            { id: randomUUID(), username: 'NewbieGamer', email: 'newbie@example.com', profile_image: 'avatar-6.png' }
        ];

        for (const user of users) {
            db.prepare(`
                INSERT INTO users (id, email, username, password_hash, profile_image, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run(user.id, user.email, user.username, 'dummy_hash', user.profile_image, new Date().toISOString());
        }

        // Sample posts for different threads
        const posts = [
            // Posts for first thread (Winter Festival Event)
            {
                thread_id: threadRows[0]?.id,
                author_id: sampleUserId,
                content: `🎄 Get ready for the most magical event of the year! 

The Winter Festival brings:
• Double XP for all activities
• Exclusive winter cosmetics
• Special holiday quests
• Limited-time mounts

Event runs from December 15th through December 31st. Don't miss out!`
            },
            {
                thread_id: threadRows[0]?.id,
                author_id: users[0].id,
                content: `This sounds amazing! I've been saving up for months to participate in a big event like this. 

Quick question - will the winter cosmetics be tradeable after the event ends?`
            },
            {
                thread_id: threadRows[0]?.id,
                author_id: users[1].id,
                content: `@PlayerOne - Based on previous events, the cosmetics are usually bind-on-pickup, so you won't be able to trade them. But they're definitely worth collecting!

Can't wait to see what the new mounts look like 🐎❄️`
            },

            // Posts for second thread (Double XP Weekend)
            {
                thread_id: threadRows[1]?.id,
                author_id: sampleUserId,
                content: `Mark your calendars everyone! This weekend (Saturday & Sunday) we're running a double XP event.

Perfect time to:
- Level up those alts
- Grind out some achievements 
- Try new content you've been putting off

The boost applies to ALL XP sources - quests, dungeons, PvP, crafting, everything!`
            },
            {
                thread_id: threadRows[1]?.id,
                author_id: users[2].id,
                content: `Finally! I've been stuck at level 47 for weeks. Time to push to 50 💪

Anyone want to group up for some dungeon runs? I'm a tank so we should get quick queues.`
            },

            // Posts for third thread (Favorite class)
            {
                thread_id: threadRows[2]?.id,
                author_id: users[0].id,
                content: `I'm a Mage main and absolutely love it! The spell combinations are so satisfying.

My favorite combo is Frost Bolt → Ice Shard → Blizzard for AOE clearing. What about you all?`
            },
            {
                thread_id: threadRows[2]?.id,
                author_id: users[2].id,
                content: `Warrior all the way! There's nothing quite like charging into battle with a massive two-handed sword.

Sure, we don't have fancy spells, but when you land a perfect critical hit... *chef's kiss* 👨‍🍳💋`
            },
            {
                thread_id: threadRows[2]?.id,
                author_id: users[1].id,
                content: `I used to be a pure DPS player (Rogue), but recently switched to Paladin for the versatility. 

Being able to heal, tank, OR DPS depending on what the group needs is amazing. Plus the holy magic effects look incredible!`
            },
            {
                thread_id: threadRows[2]?.id,
                author_id: users[3].id,
                content: `@WizardMage Paladin was actually my first choice when I started! But I found the rotation a bit complex for a beginner.

Currently playing Hunter - the pet system is so cool and it's pretty forgiving for new players like me.`
            },

            // Posts for fourth thread (New player tips)
            {
                thread_id: threadRows[3]?.id,
                author_id: users[3].id,
                content: `Hey everyone! Just started playing yesterday and I'm completely overwhelmed 😅

There are so many systems, menus, and options. Any advice for a complete noob? I picked a Ranger if that matters.`
            },
            {
                thread_id: threadRows[3]?.id,
                author_id: sampleUserId,
                content: `Welcome to the game! 🎮

Here are my top tips for new players:

1. **Take your time** - Don't rush to endgame, enjoy the journey
2. **Join a newbie-friendly guild** - The community here is great
3. **Focus on your main quest line** - It teaches you the basics
4. **Don't worry about optimal builds** - Have fun experimenting
5. **Ask questions!** - We're all here to help

Ranger is a great choice for beginners. Good damage and pretty survivable!`
            },
            {
                thread_id: threadRows[3]?.id,
                author_id: users[0].id,
                content: `@NewbieGamer One thing I wish I knew when starting: don't sell everything to vendors!

Check the auction house first - some "junk" items are worth way more than vendor price. Especially crafting materials and rare components.`
            },

            // Posts for fifth thread (Latest patch thoughts)
            {
                thread_id: threadRows[4]?.id,
                author_id: users[1].id,
                content: `What does everyone think about the combat changes in patch 2.4.1?

The spell casting speed buffs are nice, but I'm not sure about the mana cost increases. Feels like we're going OOM much faster now.`
            },
            {
                thread_id: threadRows[4]?.id,
                author_id: users[2].id,
                content: `As a melee player, I LOVE the new dodge mechanics! Finally feels like agility actually matters.

The weapon rebalancing is interesting too - seems like they're trying to make more weapon types viable in endgame.`
            }
        ];

        const insertPost = db.prepare(`
            INSERT INTO posts (thread_id, author_id, content, created_at, updated_at, is_deleted)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0)
        `);

        for (const post of posts) {
            if (post.thread_id) {
                insertPost.run(post.thread_id, post.author_id, post.content);
            }
        }

        console.log("Seeded sample posts successfully!");

    } else {
        console.log(`Categories already exist (${existingCategories.count} found), skipping seed.`);
    }
}