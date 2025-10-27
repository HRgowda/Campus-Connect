export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Campus Connect</h1>
        <p className="text-muted-foreground text-lg">
          Your comprehensive platform for managing courses, student interactions, and academic resources.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Campus Feed</h3>
          <p className="text-muted-foreground mb-4">Stay updated with campus announcements and share important updates.</p>
          <a href="/professor/feed" className="text-primary hover:text-primary/80 font-medium">
            View Feed →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Channels</h3>
          <p className="text-muted-foreground mb-4">Create and manage communication channels with students.</p>
          <a href="/professor/channels" className="text-primary hover:text-primary/80 font-medium">
            Manage Channels →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Resources</h3>
          <p className="text-muted-foreground mb-4">Upload and manage course materials and academic resources.</p>
          <a href="/professor/resources" className="text-primary hover:text-primary/80 font-medium">
            Manage Resources →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Student Feedback</h3>
          <p className="text-muted-foreground mb-4">Review and respond to student feedback and suggestions.</p>
          <a href="/professor/feedbacks" className="text-primary hover:text-primary/80 font-medium">
            View Feedback →
          </a>
        </div>
      </div>
    </div>
  )
}