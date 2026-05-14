# 🛠️ Service Territory-Based Booking Platform

A full-stack MERN application that connects customers with service workers based on geographical territories (pincode/area).

---

## 🧱 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Tailwind CSS, React Router v6 |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT (JSON Web Tokens) + bcryptjs    |
| File Upload| Multer                              |

---

## 📁 Project Structure

```
service-booking/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── seed.js            # Database seeder
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── bookingController.js
│   │   ├── workerController.js
│   │   ├── reviewController.js
│   │   └── serviceController.js  # Services + Territories
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + authorize
│   │   └── upload.js          # Multer file upload
│   ├── models/
│   │   ├── User.js
│   │   ├── Worker.js
│   │   ├── Customer.js
│   │   ├── Service.js
│   │   ├── Territory.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   └── Review.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── workerRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── serviceRoutes.js
│   │   ├── territoryRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── reviewRoutes.js
│   ├── uploads/               # Worker documents (auto-created)
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── admin/AdminLayout.jsx
    │   │   ├── worker/WorkerLayout.jsx
    │   │   └── customer/CustomerLayout.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── RegisterCustomer.jsx
    │   │   ├── RegisterWorker.jsx
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── AdminWorkers.jsx
    │   │   │   ├── AdminBookings.jsx
    │   │   │   ├── AdminServices.jsx
    │   │   │   ├── AdminTerritories.jsx
    │   │   │   ├── AdminPayments.jsx
    │   │   │   └── AdminUsers.jsx
    │   │   ├── worker/
    │   │   │   ├── WorkerDashboard.jsx
    │   │   │   ├── WorkerBookings.jsx
    │   │   │   ├── WorkerProfile.jsx
    │   │   │   └── WorkerEarnings.jsx
    │   │   └── customer/
    │   │       ├── CustomerDashboard.jsx
    │   │       ├── CustomerBookings.jsx
    │   │       ├── CustomerNewBooking.jsx
    │   │       └── CustomerProfile.jsx
    │   ├── utils/
    │   │   └── api.js          # Axios instance
    │   ├── App.jsx
    │   ├── index.js
    │   └── index.css
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/service_booking
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- 5 territories (Hyderabad pincodes: 500001–500005)
- 6 services (Electrician, Plumber, AC Repair, Cleaning, Carpenter, Painter)
- 1 admin, 5 approved workers, 3 customers

### 4. Run the App

**Terminal 1 – Backend:**
```bash
cd backend
npm run dev        # runs on http://localhost:5000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm start          # runs on http://localhost:3000
```

---

## 🔑 Demo Credentials

| Role     | Email                      | Password    |
|----------|----------------------------|-------------|
| Admin    | admin@service.com          | admin123    |
| Worker   | worker1@service.com        | worker123   |
| Customer | customer1@service.com      | customer123 |

---

## 🌐 API Reference

### Auth
| Method | Endpoint                        | Description           |
|--------|---------------------------------|-----------------------|
| POST   | `/api/auth/register/customer`   | Register customer     |
| POST   | `/api/auth/register/worker`     | Register worker       |
| POST   | `/api/auth/login`               | Login (all roles)     |
| GET    | `/api/auth/me`                  | Get current user      |

### Admin (requires `admin` role)
| Method | Endpoint                            | Description             |
|--------|-------------------------------------|-------------------------|
| GET    | `/api/admin/dashboard`              | Platform stats          |
| GET    | `/api/admin/workers?status=pending` | List workers            |
| PUT    | `/api/admin/workers/:id/status`     | Approve/reject worker   |
| PUT    | `/api/admin/workers/:id/territory`  | Assign territory        |
| PUT    | `/api/admin/users/:id/suspend`      | Suspend/activate user   |
| GET    | `/api/admin/bookings`               | All bookings            |
| GET    | `/api/admin/payments`               | All payments            |

### Bookings
| Method | Endpoint                      | Description                    |
|--------|-------------------------------|--------------------------------|
| POST   | `/api/bookings`               | Create booking (customer)      |
| GET    | `/api/bookings/my`            | My bookings (customer)         |
| PUT    | `/api/bookings/:id/cancel`    | Cancel booking (customer)      |
| GET    | `/api/bookings/worker`        | My bookings (worker)           |
| PUT    | `/api/bookings/:id/respond`   | Accept/reject (worker)         |
| PUT    | `/api/bookings/:id/status`    | Update job status (worker)     |

### Services & Territories
| Method | Endpoint                          | Description             |
|--------|-----------------------------------|-------------------------|
| GET    | `/api/services`                   | All services            |
| GET    | `/api/territories`                | All territories         |
| GET    | `/api/territories/detect/:pincode`| Detect territory        |

---

## 🔒 Core Territory Logic

When a customer creates a booking:
1. System looks up the territory by **pincode**
2. Finds an available, approved worker in **that exact territory**
3. Uses **fair allocation** — picks the worker with the **least recent job** and **lowest workload**
4. Backend **validates** territory on every worker action — workers can't access jobs outside their territory

---

## 💰 Commission System

- Platform commission: **10%** per completed job
- Example: Booking ₹1,000 → Platform ₹100 → Worker ₹900
- Automatically calculated on job completion

---

## 🚀 Future Enhancements

- [ ] Socket.io for real-time booking notifications
- [ ] Razorpay / Stripe payment gateway integration
- [ ] Mobile app (React Native)
- [ ] AI-based worker recommendation
- [ ] Admin analytics charts (recharts)
- [ ] Email notifications (Nodemailer)
- [ ] Google Maps territory visualization
