### **System Requirements**

The system will be a **REST API** designed to enable the creation, management, and sale of event tickets through partners. It will be scalable to handle thousands of simultaneous accesses.

### **Business Rules**

1. **Ticket Management**

   - Only the event creator partner can manage the associated tickets.
   - Tickets are created in batches and start with the "available" status.

2. **Ticket Purchase**

   - A customer can purchase multiple tickets for different events in a single transaction.
   - Only one customer can purchase a specific ticket at a time (concurrency control).
   - If the purchase fails, data must be logged with the failure reason.

3. **Purchase Cancellation**

   - A customer can cancel a purchase, making the tickets available for sale again.
   - A status change history must be maintained.

4. **Scalability**

   - The system must support high loads of simultaneous access.

5. **Partners**

   - Partners will be registered in the system and have access to a control panel.
   - Partners can create events and manage the associated tickets.
   - Partners can view the ticket sales associated with their events.

6. **Customers**
   - Customers will be registered in the system and can purchase event tickets.
   - Customers can view available events and buy tickets.
   - Customers can cancel their purchases and view their purchase history.

### **Main Entities**

1. **Partners**  
   Represent the creators of events and tickets.  
   **Fields:**

   - `id`: Unique identifier (numeric).
   - `name`: Full name of the partner.
   - `email`: Email for login and contact.
   - `password`: Encrypted password.
   - `company_name name`: Name of the associated company_name.

2. **Customers**  
   Represent ticket buyers.  
   **Fields:**

   - `id`: Unique identifier (numeric).
   - `name`: Full name of the customer.
   - `email`: Email for login and contact.
   - `password`: Encrypted password.
   - `address`: Customer address.
   - `phone`: Contact phone number.

3. **Event**  
   Represent events created by partners.  
   **Fields:**

   - `id`: Unique identifier (numeric).
   - `name`: Event name.
   - `description`: Brief description of the event.
   - `date`: Date and time of the event.
   - `location`: Venue of the event.
   - `partner_id`: ID of the partner who created the event (foreign key).

4. **Tickets**  
   Represent tickets available for each event.  
   **Fields:**
   - `id`: Unique identifier (numeric).
   - `event_id`: ID of the associated event (foreign key).
   - `seat`: Seat identifier (e.g., A1, B2).
   - `price`: Ticket price.
   - `status`: Available, sold.
