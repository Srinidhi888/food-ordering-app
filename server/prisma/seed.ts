import { PrismaClient, Role, Country } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../prisma/dev.db');
const adapter = new PrismaBetterSqlite3({ url: dbPath });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
    // CLEANUP
    await (prisma as any).orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.restaurant.deleteMany();
    await prisma.user.deleteMany();


    // USERS
    await prisma.user.createMany({
        data: [
            { name: "Nick Fury", role: Role.ADMIN, country: Country.INDIA, payment: "Credit Card" },
            { name: "Captain Marvel", role: Role.MANAGER, country: Country.INDIA, payment: "Credit Card" },
            { name: "Captain America", role: Role.MANAGER, country: Country.AMERICA, payment: "Credit Card" },
            { name: "Thanos", role: Role.MEMBER, country: Country.INDIA, payment: "Cash" },
            { name: "Thor", role: Role.MEMBER, country: Country.INDIA, payment: "Cash" },
            { name: "Travis", role: Role.MEMBER, country: Country.AMERICA, payment: "Cash" },
        ],
    });

    // RESTAURANTS
    const indiaRestaurant = await prisma.restaurant.create({
        data: { name: "Mumbai Meals", country: Country.INDIA },
    });

    const usaRestaurant = await prisma.restaurant.create({
        data: { name: "NYC Bites", country: Country.AMERICA },
    });

    // MENU ITEMS
    await prisma.menuItem.createMany({
        data: [
            { name: "Butter Chicken", price: 300, restaurantId: indiaRestaurant.id },
            { name: "Paneer Tikka", price: 250, restaurantId: indiaRestaurant.id },
            { name: "Burger", price: 400, restaurantId: usaRestaurant.id },
            { name: "Pizza", price: 600, restaurantId: usaRestaurant.id },
        ],
    });
}

main()
    .catch(async (e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
