export default function Home() {
  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Awthar Marketplace API</h1>
      <p>Backend service running on Next.js. All endpoints under <code>/api/*</code></p>
      <h3>Auth</h3>
      <ul>
        <li><code>GET /api/auth/user</code> - Get current user</li>
        <li><code>PATCH /api/auth/user</code> - Update user profile</li>
        <li><code>POST /api/auth/complete-profile</code> - Complete profile setup</li>
        <li><code>POST /api/auth/providers</code> - Create provider profile</li>
        <li><code>GET /api/auth/providers/me/profile</code> - Get my provider profile</li>
        <li><code>GET /api/auth/providers/:id</code> - Get provider by ID</li>
      </ul>
      <h3>Services</h3>
      <ul>
        <li><code>GET /api/services</code> - Search/list services</li>
        <li><code>POST /api/services</code> - Create service</li>
        <li><code>GET /api/services/:id</code> - Get service</li>
        <li><code>PATCH /api/services/:id</code> - Update service</li>
        <li><code>DELETE /api/services/:id</code> - Delete service</li>
      </ul>
      <h3>Categories</h3>
      <ul>
        <li><code>GET /api/categories</code> - List categories</li>
        <li><code>GET /api/categories/:slug</code> - Get category by slug</li>
      </ul>
      <h3>Locations</h3>
      <ul>
        <li><code>GET /api/locations</code> - Search locations</li>
        <li><code>GET /api/locations/popular</code> - Popular locations</li>
        <li><code>GET /api/locations/emirates</code> - List emirates</li>
        <li><code>GET /api/locations/search/:query</code> - Search by name</li>
      </ul>
      <h3>Bookings</h3>
      <ul>
        <li><code>GET /api/bookings</code> - List bookings</li>
        <li><code>POST /api/bookings</code> - Create booking</li>
        <li><code>GET /api/bookings/:id</code> - Get booking</li>
        <li><code>DELETE /api/bookings/:id</code> - Cancel booking</li>
        <li><code>PATCH /api/bookings/:id/status</code> - Update status</li>
      </ul>
      <h3>Chat</h3>
      <ul>
        <li><code>GET /api/conversations</code> - List conversations</li>
        <li><code>POST /api/conversations</code> - Create conversation</li>
        <li><code>GET /api/messages/:conversationId</code> - Get messages</li>
        <li><code>POST /api/messages</code> - Send message</li>
      </ul>
      <h3>Reviews</h3>
      <ul>
        <li><code>POST /api/reviews</code> - Create review</li>
        <li><code>GET /api/reviews/provider/:providerId</code> - Provider reviews</li>
      </ul>
      <h3>Favorites</h3>
      <ul>
        <li><code>GET /api/favorites</code> - List favorites</li>
        <li><code>POST /api/favorites</code> - Add favorite</li>
        <li><code>GET /api/favorites/check/:serviceId</code> - Check if favorited</li>
        <li><code>DELETE /api/favorites/:serviceId</code> - Remove favorite</li>
      </ul>
      <h3>Upload</h3>
      <ul>
        <li><code>POST /api/upload/image</code> - Upload single image</li>
        <li><code>POST /api/upload/images</code> - Upload multiple images</li>
        <li><code>GET /api/upload/file/:key</code> - Serve file</li>
      </ul>
      <h3>Reports</h3>
      <ul>
        <li><code>POST /api/reports</code> - Submit report</li>
        <li><code>GET /api/reports/my-reports</code> - My reports</li>
      </ul>
      <h3>Analytics</h3>
      <ul>
        <li><code>GET /api/analytics/dashboard</code> - Dashboard stats</li>
        <li><code>GET /api/analytics/provider</code> - Detailed analytics</li>
      </ul>
    </div>
  );
}
