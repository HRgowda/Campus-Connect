export default function HomePage() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-8 border border-primary/20">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to Campus Connect</h1>
        <p className="text-muted-foreground text-lg">
          Your central hub for campus resources, communication, and academic support.
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Campus Feed</h3>
          <p className="text-muted-foreground mb-4">Stay updated with the latest campus news and announcements.</p>
          <a href="/student/feed" className="text-primary hover:text-primary/80 font-medium">
            View Feed →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Channels</h3>
          <p className="text-muted-foreground mb-4">Connect with your peers and join discussion channels.</p>
          <a href="/student/channel" className="text-primary hover:text-primary/80 font-medium">
            Browse Channels →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Resources</h3>
          <p className="text-muted-foreground mb-4">Access study materials, notes, and academic resources.</p>
          <a href="/student/resources" className="text-primary hover:text-primary/80 font-medium">
            View Resources →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Resume Analyzer</h3>
          <p className="text-muted-foreground mb-4">Get AI-powered feedback on your resume and improve it.</p>
          <a href="/student/resume_analyzer" className="text-primary hover:text-primary/80 font-medium">
            Analyze Resume →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Feedback Portal</h3>
          <p className="text-muted-foreground mb-4">Share feedback and suggestions with the administration.</p>
          <a href="/student/feedback_portal" className="text-primary hover:text-primary/80 font-medium">
            Give Feedback →
          </a>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
          <h3 className="text-xl font-semibold text-card-foreground mb-2">Profile</h3>
          <p className="text-muted-foreground mb-4">Manage your profile information and preferences.</p>
          <a href="/student/profile" className="text-primary hover:text-primary/80 font-medium">
            View Profile →
          </a>
        </div>
      </div>
    </div>
  )
}