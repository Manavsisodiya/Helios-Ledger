# 🏛️ Helios Treasury OS

**Helios** is a full-stack, enterprise-grade corporate treasury application designed to simulate high-velocity, multi-currency financial settlements. 

While it features a modern, glassmorphic React frontend, the core focus of this project is the **backend architecture**, demonstrating how to safely handle state, concurrency, and money in a distributed environment.

## ⚙️ Backend Architecture & Engineering

The backend is built as a lightweight, high-performance Java microservice utilizing **SparkJava**, **PostgreSQL**, and **Redis**. It is engineered to solve the classic "Double Spend" problem using strict database constraints and distributed caching.

### Core Backend Features:

* **Cryptographic Idempotency (Redis Lock Engine)**
  Every transfer request must include a unique `X-Idempotency-Key` header. Before the database is ever touched, the Java API attempts a distributed `SETNX` lock in Redis. If the key exists, the transaction is instantly rejected as a duplicate, preventing double-spending from network retries or concurrent clicks.
* **ACID-Compliant Settlement (PostgreSQL)**
  Financial settlements are wrapped in strict database transaction blocks. Debiting the sender, crediting the receiver, and writing to the immutable `ledger_entries` audit log are executed atomically. If the sender lacks sufficient funds, the entire block rolls back safely.
* **Type-Safe SQL Queries (jOOQ)**
  Instead of fragile ORMs, the application relies on **jOOQ** for type-safe, compiled SQL query generation. This allows for raw SQL performance while mitigating SQL injection vulnerabilities and abstracting complex ResultSet parsing.
* **Cache-Aside Pattern Optimization**
  Read-heavy operations (like polling active balances) are designed to minimize database load by securely serving normalized JSON data at low latency.

## 🛠️ Tech Stack

**Backend System:**
* **Language:** Java 
* **Framework:** SparkJava (Lightweight Microservice)
* **Database:** PostgreSQL
* **Caching & Locking:** Redis (via Jedis)
* **Data Access Layer:** jOOQ

**Frontend System:**
* **Library:** React.js
* **Styling:** Tailwind CSS (Dark Glassmorphism)
* **Icons:** Lucide React

## 🚀 Local Development

### Prerequisites
* Java (JDK 11+)
* Node.js & npm
* Docker & Docker Compose

### Booting the Infrastructure
The application uses Docker to orchestrate the database and cache layers.
```bash
# Start the PostgreSQL and Redis containers
docker compose up -d
