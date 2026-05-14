require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Worker = require('../models/Worker');
const Customer = require('../models/Customer');
const Service = require('../models/Service');
const Territory = require('../models/Territory');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear
  await Promise.all([User.deleteMany(), Worker.deleteMany(), Customer.deleteMany(), Service.deleteMany(), Territory.deleteMany()]);
  console.log('Cleared existing data');

  // Territories
  const territories = await Territory.insertMany([
    { pincode: '500001', areaName: 'Secunderabad', city: 'Hyderabad', state: 'Telangana' },
    { pincode: '500002', areaName: 'Banjara Hills', city: 'Hyderabad', state: 'Telangana' },
    { pincode: '500003', areaName: 'Jubilee Hills', city: 'Hyderabad', state: 'Telangana' },
    { pincode: '500004', areaName: 'Madhapur', city: 'Hyderabad', state: 'Telangana' },
    { pincode: '500005', areaName: 'Gachibowli', city: 'Hyderabad', state: 'Telangana' },
  ]);
  console.log('Territories seeded');

  // Services
  const services = await Service.insertMany([
    { name: 'Electrician',    description: 'Electrical wiring, repairs, and installations', basePrice: 299, category: 'Electrical', icon: 'bolt' },
    { name: 'Plumber',        description: 'Pipe repairs, leakages, and installations',      basePrice: 249, category: 'Plumbing',   icon: 'droplet' },
    { name: 'AC Repair',      description: 'AC servicing, repair, and installation',         basePrice: 499, category: 'Appliance',  icon: 'wind' },
    { name: 'Cleaning',       description: 'Home and office deep cleaning',                  basePrice: 399, category: 'Cleaning',   icon: 'sparkles' },
    { name: 'Carpenter',      description: 'Furniture repair and woodwork',                  basePrice: 349, category: 'Carpentry',  icon: 'hammer' },
    { name: 'Painter',        description: 'Interior and exterior painting',                 basePrice: 299, category: 'Painting',   icon: 'paintbrush' },
  ]);
  console.log('Services seeded');

  // Admin
  const adminUser = await User.create({ name: 'Admin User', email: 'admin@service.com', password: 'admin123', role: 'admin' });
  console.log('Admin created: admin@service.com / admin123');

  // Workers
  for (let i = 1; i <= 5; i++) {
    const u = await User.create({ name: `Worker ${i}`, email: `worker${i}@service.com`, password: 'worker123', role: 'worker', phone: `98765432${i}0` });
    await Worker.create({
      user: u._id,
      territory: territories[i - 1]._id,
      services: [services[i % services.length]._id, services[(i + 1) % services.length]._id],
      skills: ['Certified', '5+ years exp'],
      status: 'approved',
      availability: 'available',
      rating: (3.5 + i * 0.3).toFixed(1),
      totalReviews: i * 4,
      earnings: i * 5000,
      totalJobs: i * 10,
      hourlyRate: 150 + i * 25,
      experience: i + 1,
      bio: `Experienced professional with ${i + 1} years of expertise.`,
    });
  }
  console.log('Workers seeded: worker1@service.com to worker5@service.com / worker123');

  // Customers
  for (let i = 1; i <= 3; i++) {
    const u = await User.create({ name: `Customer ${i}`, email: `customer${i}@service.com`, password: 'customer123', role: 'customer', phone: `91234567${i}0` });
    await Customer.create({ user: u._id, address: `${i}23 Main Street`, pincode: territories[i - 1].pincode, city: 'Hyderabad' });
  }
  console.log('Customers seeded: customer1@service.com to customer3@service.com / customer123');

  console.log('\n=== SEED COMPLETE ===');
  console.log('Admin:    admin@service.com / admin123');
  console.log('Worker:   worker1@service.com / worker123');
  console.log('Customer: customer1@service.com / customer123');
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
