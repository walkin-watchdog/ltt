# Luxé TimeTravel Project

The **Luxé TimeTravel** project provides a comprehensive solution for managing tours, experiences, bookings, availability, and cart recovery. It comprises three core components: the **user-facing frontend**, **admin dashboard**, and **backend API**.

---

## System Overview

### **Backend (Node.js + Express + PostgreSQL + Prisma)**

The backend serves as the central API, managing data persistence, security, and business logic. It includes functionalities such as:

* **Authentication & Authorization**: JWT-based authentication with user roles (`ADMIN`, `EDITOR`, `VIEWER`).
* **Product Management**: Manage tours and experiences with complete product information.
* **Availability Management**: Handle date-specific availability and capacity.
* **Booking & Payment Processing**: Integration with Razorpay and PayPal.
* **Analytics & Reporting**: Generate dashboard statistics and reports.
* **Newsletter & Abandoned Cart Management**: Automate email notifications and recovery workflows.

### **Admin Dashboard (React + TypeScript + Tailwind + Shadcn UI)**

A robust admin interface for efficient management of the travel business operations:

* **Dashboard**: Provides analytics overview and quick actions.
* **Product Management**: Edit products comprehensively (content, pricing, booking details, and offers).
* **Availability Management**: Define product booking availability via intuitive UI.
* **Bookings Management**: View and manage booking statuses and details.
* **Trip Request Management**: Process custom travel requests.

### **User Frontend (React + TypeScript + Tailwind)**

An intuitive customer-facing website enabling users to:

* **Browse Products** by destination, category, or experience type.
* **View Detailed Product Information**: Images, descriptions, inclusions, and exclusions.
* **Book Tours and Experiences**: Select dates and packages, and enter customer details.
* **Process Payments** via integrated gateways (Razorpay and PayPal).
* **Request Custom Trips** tailored to specific customer needs.

---

## Availability Management System

A key component managing product availability and capacity across the platform.

### **Backend Implementation**

**Data Model:**

* `availabilities` table linking products to specific dates.
* Status: `AVAILABLE`, `SOLD_OUT`, `NOT_OPERATING`.
* Capacity tracking: fields for `available` (slots) and `booked` (count).

**API Endpoints:**

* `GET /availability/product/:productId`: Fetch availability by product.
* `GET /availability`: Retrieve all availability (admin only).
* `POST /availability`: Create/update individual date availability.
* `POST /availability/bulk`: Batch update for multiple dates.

### **Admin Frontend Implementation**

**Main Availability Page:**

* Interactive calendar/table view with easy toggling.
* Filters by product, date, and status.

**Calendar View:**

* Color-coded visualization for easy identification.
* Direct capacity display on calendar dates.
* Bulk selection and quick toggle options.
* Monthly navigation.

**Date Management:**

* Edit availability individually via modals.
* Bulk operations using date ranges with repeat patterns (weekday/weekend).
* Clear visual indicators for status changes.

**Product Integration:**

* Dedicated "Availability" tab within product creation/editing.
* Calendar-based interface for setting availability.
* Easy bulk options (e.g., "Add Next 7 Days").

**Capacity Management:**

* Intuitive controls for setting slots per date.
* Real-time display of available and booked slots.
* Status-aware UI displaying capacity only for available dates.

### **Booking Flow Integration**

Availability directly affects the customer booking process:

* Date picker shows only available dates.
* Upon booking:

  * Validates availability and sufficient capacity.
  * Automatically updates `available` and `booked` counts.
  * Marks dates as `SOLD_OUT` when capacity reaches zero.

---

## Abandoned Cart Recovery System

Helps convert potential customers who abandon bookings:

### **Cart Capture Process**

* Automatic saving of incomplete bookings after basic customer information is provided.
* Triggered after 5 seconds of user inactivity to minimize API calls.
* Stores product, customer data, and booking progress.

### **Backend Processing**

* Stored cart data processed by cron jobs:

  * Runs every 2 hours, sending reminders to carts older than 2 hours with fewer than 3 reminders.
  * Updates reminder counts upon sending notifications.
* Weekly clean-up of carts older than 30 days.

### **Customer Recovery Flow**

* Users returning to the site receive notifications of existing abandoned carts.
* One-click resume feature restores previously entered booking information.

### **Admin Dashboard Integration**

* Dedicated "Abandoned Carts" management section:

  * View abandoned cart details.
  * Manually send reminder emails.
  * Directly convert carts into confirmed bookings.
  * Delete unnecessary carts.

---

## Conclusion

The Luxé TimeTravel system integrates comprehensive availability management and abandoned cart recovery functionalities, streamlining both the customer booking experience and administrative efficiency.